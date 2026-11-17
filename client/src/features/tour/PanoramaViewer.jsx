import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';
import { Viewer } from '@photo-sphere-viewer/core';
import { GyroscopePlugin } from '@photo-sphere-viewer/gyroscope-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import '@photo-sphere-viewer/virtual-tour-plugin/index.css';
import { useEffect, useRef, useState } from 'react';
import { getScene, TOUR_SCENES } from '@/data/tour';
import { prefersReducedMotion } from '@/lib/device';
import { cn } from '@/lib/utils';
import './panorama.css';

const deg = (value) => `${value}deg`;

function linkArrow(link) {
  const target = getScene(link.nodeId);
  const element = document.createElement('div');
  element.className = 'aurelia-link';
  element.innerHTML = `<span class="aurelia-link__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </span><span class="aurelia-link__label">${target?.name ?? 'Next room'}</span>`;
  return element;
}

function toNodes(scenes) {
  return scenes.map((scene) => ({
    id: scene.id,
    name: scene.name,
    caption: scene.caption,
    panorama: scene.panorama,
    thumbnail: scene.thumbnail,
    sphereCorrection: undefined,
    links: scene.links.map((link) => ({ nodeId: link.to, position: { yaw: deg(link.yaw), pitch: deg(link.pitch) } })),
    markers: scene.hotspots.map((hotspot) => ({
      id: `${scene.id}-${hotspot.id}`,
      position: { yaw: deg(hotspot.yaw), pitch: deg(hotspot.pitch) },
      html: '<span class="aurelia-hotspot"><span class="aurelia-hotspot__ring"></span><span class="aurelia-hotspot__dot"></span></span>',
      size: { width: 44, height: 44 },
      anchor: 'center center',
      tooltip: {
        content: `<strong>${hotspot.title}</strong><span>${hotspot.description}</span>`,
        position: 'top center',
        className: 'aurelia-tooltip',
      },
      data: { title: hotspot.title },
    })),
  }));
}

/**
 * Photo Sphere Viewer with the virtual-tour, markers, auto-rotate and gyroscope plugins:
 * click arrows to move between rooms, gold hotspots for highlights, fullscreen in the navbar.
 */
export default function PanoramaViewer({ scenes = TOUR_SCENES, startId = scenes[0].id, className, onSceneChange, autoRotate = true }) {
  const containerRef = useRef(null);
  const tourRef = useRef(null);
  const [current, setCurrent] = useState(startId);
  const onSceneChangeRef = useRef(onSceneChange);
  onSceneChangeRef.current = onSceneChange;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const start = getScene(startId) ?? scenes[0];
    const rotate = autoRotate && !prefersReducedMotion();

    const viewer = new Viewer({
      container,
      defaultYaw: deg(start.view.yaw),
      defaultPitch: deg(start.view.pitch),
      defaultZoomLvl: 25,
      mousewheelCtrlKey: true,
      touchmoveTwoFingers: false,
      loadingTxt: 'Loading the room…',
      navbar: ['autorotate', 'zoom', 'move', 'gyroscope', 'caption', 'fullscreen'],
      lang: { autorotate: 'Auto-rotate', fullscreen: 'Fullscreen', gyroscope: 'Tilt to look' },
      plugins: [
        [MarkersPlugin, {}],
        rotate ? [AutorotatePlugin, { autostartDelay: 2500, autostartOnIdle: true, autorotateSpeed: '1rpm', autorotatePitch: deg(0) }] : null,
        [GyroscopePlugin, {}],
        [
          VirtualTourPlugin,
          {
            positionMode: 'manual',
            renderMode: '2d',
            nodes: toNodes(scenes),
            startNodeId: start.id,
            showLinkTooltip: false,
            arrowStyle: { element: linkArrow, size: { width: 170, height: 46 } },
            transitionOptions: { showLoader: true, speed: '20rpm', effect: 'fade', rotation: true },
          },
        ],
      ].filter(Boolean),
    });

    const tour = viewer.getPlugin(VirtualTourPlugin);
    tourRef.current = tour;
    const onNodeChanged = ({ node }) => {
      setCurrent(node.id);
      const scene = getScene(node.id);
      if (scene) viewer.rotate({ yaw: deg(scene.view.yaw), pitch: deg(scene.view.pitch) });
      onSceneChangeRef.current?.(node.id);
    };
    tour.addEventListener('node-changed', onNodeChanged);

    return () => {
      tour.removeEventListener('node-changed', onNodeChanged);
      tourRef.current = null;
      viewer.destroy();
    };
  }, [scenes, startId, autoRotate]);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div
        ref={containerRef}
        role="application"
        aria-roledescription="360 degree panorama viewer"
        aria-label={`360° view: ${getScene(current)?.name ?? ''}. Drag to look around, use the arrows to move between rooms.`}
        data-cursor="Drag"
        data-lenis-prevent
        className="aurelia-psv relative h-[62vh] min-h-[380px] w-full overflow-hidden rounded-[1.75rem] border border-gold/25 bg-navy shadow-luxe"
      />
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label="Rooms">
        {scenes.map((scene) => {
          const active = scene.id === current;
          return (
            <button
              key={scene.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => tourRef.current?.setCurrentNode(scene.id)}
              className={cn(
                'group relative w-40 shrink-0 overflow-hidden rounded-2xl border text-left transition-all duration-500',
                active ? 'border-gold shadow-gold-glow' : 'border-white/15 opacity-75 hover:opacity-100',
              )}
            >
              <img src={scene.thumbnail} alt="" loading="lazy" className="aspect-[2/1] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/90 to-transparent px-3 pb-2 pt-6 text-xs font-semibold text-ivory">
                {scene.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
