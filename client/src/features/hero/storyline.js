import { RING, STORY_VH } from '@/features/hero/heroConfig';

const clamp01 = (n) => Math.min(1, Math.max(0, n));
export const smoothstep = (t) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

/** Lays the hero's chapters out on the pinned scroll (progress 0 → 1) for one frame set: film → ring. */
export function buildStoryline(set) {
  const totalVh = STORY_VH.film + STORY_VH.ring;
  const filmEnd = STORY_VH.film / totalVh;
  const last = set.count - 1;

  return {
    totalVh,
    filmEnd,
    ringStart: filmEnd,
    last,
    /** Scroll progress at which a film frame shows. */
    pOfFrame: (frame) => (frame / last) * filmEnd,
  };
}

/** Ring geometry (world units) for a card count and device: shared by the ring and the camera rig that frames it. */
export function ringDims(count, isMobile) {
  const device = isMobile ? 'mobile' : 'desktop';
  const baseCount = isMobile ? RING.mobileCount : 8;
  const cardWidth = RING.cardWidth[device];
  return {
    radius: RING.radius[device] * Math.max(1, count / baseCount),
    cardWidth,
    cardHeight: cardWidth / 1.5, // ring images are 3:2
    tilt: (RING.tilt * Math.PI) / 180,
  };
}
