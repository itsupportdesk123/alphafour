import { Cloud, Clouds, Environment } from '@react-three/drei';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RING, RING_WORLD } from '@/features/hero/heroConfig';
import { ringDims } from '@/features/hero/storyline';

const TAU = Math.PI * 2;
const SKY_RADIUS = 600;
/** Slightly dimmed so captions and cards keep their contrast against the bright horizon. */
const SKY_TINT = new THREE.Color(0.8, 0.8, 0.8);
const smoothstep = (t) => t * t * (3 - 2 * t);

/**
 * Loads textures without uploading them. drei's useTexture uploads every texture to the GPU the moment
 * the scene mounts, decoding each image on the main thread first: with the sky panoramas that froze the
 * film playing above for most of a second. RingWorld uploads them one at a time in idle moments instead.
 */
const useImageTextures = (urls) => useLoader(THREE.TextureLoader, urls);

/** Linear white → transparent alpha map: the reflection under each card fades out downwards. */
function useFadeTexture() {
  const texture = useMemo(() => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    // Canvas bottom = uv v 0 = the reflection's edge touching its card.
    const g = ctx.createLinearGradient(0, size, 0, 0);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.55, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

/** Plane whose texture is flipped vertically: a mirror image of a card that still culls when turned away. */
function useMirroredPlane(width, height) {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, height);
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i += 1) uv.setY(i, 1 - uv.getY(i));
    return g;
  }, [width, height]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

/** The two reused sky panoramas as nested domes; the second fades in as the ring turns. */
function SkyDome({ state }) {
  const textures = useImageTextures(RING_WORLD.skies);
  const group = useRef(null);
  const second = useRef(null);
  const geometries = useMemo(
    () =>
      [SKY_RADIUS, SKY_RADIUS * 0.96].map((r) => {
        const g = new THREE.SphereGeometry(r, 64, 32);
        g.scale(-1, 1, 1);
        return g;
      }),
    [],
  );
  useLayoutEffect(() => {
    for (const texture of textures) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    }
  }, [textures]);
  useEffect(() => () => geometries.forEach((g) => g.dispose()), [geometries]);

  useFrame(() => {
    if (group.current) group.current.rotation.y = THREE.MathUtils.degToRad(RING_WORLD.skyRotation - RING_WORLD.skyTurn * (1 - state.ring.turn));
    if (second.current) second.current.opacity = smoothstep(Math.min(1, Math.max(0, (state.ring.turn - 0.15) / 0.7)));
  });

  return (
    <group ref={group}>
      <mesh geometry={geometries[0]} renderOrder={-10}>
        <meshBasicMaterial map={textures[0]} color={SKY_TINT} toneMapped={false} depthWrite={false} fog={false} />
      </mesh>
      {textures[1] && (
        <mesh geometry={geometries[1]} renderOrder={-9}>
          <meshBasicMaterial ref={second} map={textures[1]} color={SKY_TINT} toneMapped={false} depthWrite={false} transparent opacity={0} fog={false} />
        </mesh>
      )}
    </group>
  );
}

/** A soft cloud sea under the ring, from the reused cloud sprite. */
function CloudSea({ radius, y, isMobile }) {
  const { clouds } = RING_WORLD;
  const segments = isMobile ? clouds.mobile : clouds.desktop;
  return (
    <Clouds material={THREE.MeshBasicMaterial} texture={RING_WORLD.cloud} limit={segments * 4} frustumCulled={false}>
      {/* A low bank under the ring, and a thinner one far below so the sky still reads behind it. */}
      <Cloud seed={4} segments={segments} bounds={[radius * 2.4, 0.25, radius * 1.4]} volume={radius * 0.9} position={[0, y - 0.25, 0]} color={clouds.color} opacity={clouds.opacity} speed={0.08} fade={radius * 10} growth={1.5} />
      <Cloud seed={12} segments={Math.round(segments * 0.6)} bounds={[radius * 4, 0.3, radius * 1.5]} volume={radius * 1.2} position={[0, y - 1.8, -radius * 3]} color={clouds.color} opacity={clouds.opacity * 0.6} speed={0.05} fade={radius * 12} growth={2} />
    </Clouds>
  );
}

function Ring({ images, state, isMobile, onFocus }) {
  const textures = useImageTextures(images.map((image) => (isMobile ? image.mobile : image.desktop)));
  const gl = useThree((s) => s.gl);
  const group = useRef(null);
  const cards = useRef([]);
  const focused = useRef(-1);
  const fade = useFadeTexture();

  const count = images.length;
  const { radius, cardWidth, cardHeight } = ringDims(count, isMobile);
  const mirrored = useMirroredPlane(cardWidth, cardHeight);
  const reflectionGap = 0.04 + RING.frame;
  const frameMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#d4ad5c', metalness: 1, roughness: 0.28, envMapIntensity: 1.4 }),
    [],
  );
  useEffect(() => () => frameMaterial.dispose(), [frameMaterial]);

  useLayoutEffect(() => {
    const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    for (const texture of textures) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = anisotropy;
      texture.needsUpdate = true;
    }
  }, [textures, gl]);

  useFrame((_, delta) => {
    if (!group.current) return;
    const angle = -state.ring.turn * TAU;
    group.current.rotation.y = angle;

    let best = 0;
    let bestFacing = -2;
    const ease = 1 - Math.exp(-delta * 10);
    for (let i = 0; i < count; i += 1) {
      const card = cards.current[i];
      if (!card) continue;
      // 1 when the card faces the camera, -1 when it's at the back of the ring.
      const facing = Math.cos((i / count) * TAU + angle);
      if (facing > bestFacing) {
        bestFacing = facing;
        best = i;
      }
      const targetScale = 1 + (RING.focusScale - 1) * Math.max(0, facing) ** 6;
      card.scale.setScalar(THREE.MathUtils.lerp(card.scale.x, targetScale, ease));
      const light = THREE.MathUtils.lerp(RING.sideBrightness, 1, smoothstep((facing + 1) / 2) ** 1.4);
      card.material.color.setScalar(light);
      card.userData.reflection ??= card.getObjectByName('reflection') ?? null;
      card.userData.reflection?.material.color.setScalar(light);
    }
    if (best !== focused.current) {
      focused.current = best;
      onFocus?.(best);
    }
  });

  return (
    <group ref={group}>
      {textures.map((texture, i) => {
        const a = (i / count) * TAU;
        return (
          <mesh
            key={images[i].file}
            ref={(mesh) => {
              cards.current[i] = mesh;
            }}
            position={[Math.sin(a) * radius, 0, Math.cos(a) * radius]}
            rotation-y={a}
          >
            <planeGeometry args={[cardWidth, cardHeight]} />
            {/* Single-sided: a card turned away is culled, like backface-visibility: hidden. */}
            <meshBasicMaterial map={texture} toneMapped={false} side={THREE.FrontSide} />
            {RING.frame > 0 && (
              <mesh position-z={-0.004} material={frameMaterial}>
                <planeGeometry args={[cardWidth + RING.frame * 2, cardHeight + RING.frame * 2]} />
              </mesh>
            )}
            {RING.reflections && (
              // Mirror image under the card, fading out: a glossy sheen over the cloud sea.
              <mesh name="reflection" geometry={mirrored}
                position-y={-cardHeight - reflectionGap}
              >
                <meshBasicMaterial map={texture} alphaMap={fade} transparent opacity={isMobile ? 0.16 : 0.22} depthWrite={false} toneMapped={false} />
              </mesh>
            )}
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * Ring chapter: the project images on a 360° ring that `state.ring.turn` (0 → 1) turns exactly
 * once, ending with the first image back at the front, over the reused sky domes, a cloud sea
 * and HDR lighting (gold frames).
 */
export function RingWorld({ images, state, isMobile, onFocus }) {
  const { gl, scene, camera } = useThree();
  const { radius, cardHeight, tilt } = ringDims(images.length, isMobile);
  const floorY = -(cardHeight / 2) * RING.focusScale - 0.45;

  // Get the GPU ready without blocking the page, so neither the film playing above nor the ring's first
  // visible frame stalls: shaders compile in parallel (compileAsync) instead of in one blocking call, and
  // each texture is decoded off the main thread, then uploaded on its own in an idle moment.
  useEffect(() => {
    let cancelled = false;
    const idle = () =>
      new Promise((resolve) => {
        if ('requestIdleCallback' in window) window.requestIdleCallback(resolve, { timeout: 1500 });
        else setTimeout(resolve, 200);
      });
    const textures = new Set();
    scene.traverse((object) => {
      const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
      for (const material of materials) for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    });
    (async () => {
      await idle();
      if (cancelled) return;
      const compiled = gl.compileAsync ? gl.compileAsync(scene, camera) : Promise.resolve(gl.compile(scene, camera));
      for (const texture of textures) {
        await texture.image?.decode?.().catch(() => {});
        await idle();
        if (cancelled) return;
        gl.initTexture(texture);
      }
      await compiled.catch(() => {});
    })();
    return () => {
      cancelled = true;
    };
  }, [gl, scene, camera]);

  return (
    <group>
      <Environment files={RING_WORLD.hdri} />
      <SkyDome state={state} />
      <group rotation-x={tilt}>
        <Ring images={images} state={state} isMobile={isMobile} onFocus={onFocus} />
        <CloudSea radius={radius} y={floorY} isMobile={isMobile} />
      </group>
    </group>
  );
}
