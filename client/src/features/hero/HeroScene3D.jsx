import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { RING } from '@/features/hero/heroConfig';
import { RingWorld } from '@/features/hero/ImageRing360';
import { ringDims } from '@/features/hero/storyline';

const RING_FOV = 32;

/** Where the camera sits to frame the ring at a viewport aspect ratio. */
function ringFraming(dims, aspect, isMobile) {
  const { radius, cardWidth, cardHeight, tilt } = dims;
  const tanV = Math.tan(THREE.MathUtils.degToRad(RING_FOV / 2));
  const tanH = tanV * aspect;
  // Fit the whole ring across the screen, but never let the front card get lost on a narrow screen.
  const fitRing = ((radius * 2 + cardWidth) * 1.08) / 2 / tanH;
  const fitCard = radius + cardWidth / (2 * tanH * (isMobile ? 0.6 : 0.26));
  const fitHeight = radius + (cardHeight * RING.focusScale) / (2 * tanV * 0.42);
  const distance = Math.max(Math.min(fitRing, fitCard), fitHeight);
  return {
    position: new THREE.Vector3(0, 0.55, distance),
    // Aim at the front card (lowered by the ring's tilt), nudged so the ring sits just below centre.
    target: new THREE.Vector3(0, -radius * Math.sin(tilt) + cardHeight * 0.08, radius * Math.cos(tilt)),
  };
}

/** Frames the ring for the current viewport. */
function CameraRig({ dims, isMobile }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const framing = ringFraming(dims, size.width / size.height, isMobile);
    camera.position.copy(framing.position);
    camera.lookAt(framing.target);
    camera.fov = RING_FOV;
    camera.updateProjectionMatrix();
  }, [camera, dims, size, isMobile]);
  return null;
}

/**
 * The hero's 3D layer (one WebGL context, loaded lazily): the project ring. The scroll timeline
 * writes `state`; this only reads it each frame, so React never re-renders while scrolling.
 * `live` runs the render loop only while the ring chapter is near.
 */
export default function HeroScene3D({ state, live, isMobile, ringImages, onFocus }) {
  const dims = useMemo(() => ringDims(ringImages.length, isMobile), [ringImages.length, isMobile]);
  return (
    <Canvas
      className="!absolute inset-0"
      frameloop={live ? 'always' : 'never'}
      dpr={[1, isMobile ? 1.5 : 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: RING_FOV, near: 0.05, far: 2000 }}
      resize={{ debounce: 150, scroll: false }}
      aria-hidden
    >
      <CameraRig dims={dims} isMobile={isMobile} />
      <Suspense fallback={null}>
        <RingWorld images={ringImages} state={state} isMobile={isMobile} onFocus={onFocus} />
      </Suspense>
    </Canvas>
  );
}
