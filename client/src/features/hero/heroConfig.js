/**
 * Scroll-scrubbed hero: every tunable lives here.
 *
 * The pinned section is the sum of STORY_VH tall. Its scroll runs through two chapters:
 *   film  the film scrubs through its four scenes (aerial → arrival → showroom → rooftop), blending
 *         neighbouring frames so even a slow scroll glides, with a soft transition at each scene change,
 *   ring  the last frame dims and the project images turn once around a 360° ring,
 *         over a sky dome (public/skies), a cloud sea (textures/cloud.png) and HDR-lit gold frames.
 *
 * Whenever nobody is scrolling, the film also plays by itself, slowed down (AUTOPLAY).
 *
 * The block between the <generated> markers at the bottom is rewritten by `npm run hero:frames`
 * (scripts/extract-hero-frames.mjs); everything above it is yours to edit and survives regeneration.
 */

/** Scroll distance of each chapter, in viewport heights. Bigger = slower story. */
export const STORY_VH = {
  film: 900,
  ring: 320,
};

/** Seconds the film takes to catch up with the scrollbar. Higher = silkier, lazier. */
export const SCRUB_SMOOTHING = 2;

/**
 * The film playing by itself while nobody is scrolling. It picks up from wherever the scroll left
 * it, and any scroll takes over from the frame on screen, without a jump. It stays on the film: the
 * ring chapter only moves with the scroll.
 */
export const AUTOPLAY = {
  /** Playback speed (1 = the film's own speed). Lower = slower. */
  speed: 0.5,
  /** Seconds after the last scroll before the film picks up again. */
  resumeDelay: 1.2,
  /** Seconds the film takes to ease up to speed. */
  easeIn: 1.2,
  /** Seconds of the dip to dark on each side of the restart, when the film loops at the top of the page. */
  loopFade: 1,
};

/**
 * Smooth-scroll feel while the hero is on screen (Lenis). Lower multipliers = less distance per
 * wheel notch / swipe; lower lerp = heavier, lazier glide. The rest of the site keeps its own feel.
 */
export const SCROLL_FEEL = { wheelMultiplier: 0.42, touchMultiplier: 0.7, lerp: 0.045 };

/**
 * Scene transitions, played around each scene change as you scroll (the film keeps its own
 * dissolves). Deliberately no 3D tilt or canvas blur: both resample the picture, which softens it
 * and costs frames.
 */
export const TRANSITION = {
  /** Half-width of the effect, as a fraction of the shorter neighbouring scene. */
  window: 0.24,
  /** Gentle push-in at the scene change (1 → zoom → 1). */
  zoom: 1.04,
  /** Peak opacity of the warm light leak that drifts across the frame. */
  glow: 0.55,
  /** Peak opacity of the vignette that closes in around the change. */
  vignette: 0.55,
  /** Headline blur (px) while it fades out and the next one fades in. */
  textBlur: 12,
};

/** Headline layer drift against the canvas while the film plays (vh); the canvas itself drifts by `canvasScale`. */
export const PARALLAX = { copyVh: -9, canvasScale: 1.035 };

/** Ring chapter: how the held last frame sits behind the ring while the sky fades in. */
export const BACKDROP = { brightness: 0.4, blur: 6, scale: 1.08 };

/**
 * One headline per clip (in clip order). The first renders as the page's H1.
 * `emphasis` is rendered in gold italics wherever it appears in the title.
 * `source` notes where the copy came from; entries marked PLACEHOLDER need real copy.
 */
export const HEADLINES = [
  {
    kicker: 'Alphafour Infrastructure · Chennai',
    title: 'Where Elevation Meets Elegance',
    emphasis: 'Elegance',
    body: 'Redefining construction with innovation, integrity and excellence.',
    source: 'site tagline + home page story copy',
  },
  {
    kicker: 'Arrival',
    title: 'An arrival worth the journey',
    emphasis: 'journey',
    body: 'Buildings, commercial spaces and infrastructure, delivered to new standards of quality.',
    source: 'PLACEHOLDER title; body adapted from the home page story copy',
  },
  {
    kicker: 'Inside Alphafour',
    title: 'Building Better Tomorrow',
    emphasis: 'Tomorrow',
    body: 'Over 2.5 million square feet developed across Chennai.',
    source: 'title from the corporate lobby signage; body from the About page',
  },
  {
    kicker: 'Sky Deck',
    title: 'Your private horizon',
    emphasis: 'horizon',
    body: 'Landscaped terraces with the whole city lit up at your feet.',
    source: 'title from the previous hero; body PLACEHOLDER',
  },
];

/** Copy shown over the ring. */
export const RING_COPY = {
  kicker: 'Our projects',
  title: 'Spaces we have built',
};

/** 360° ring of project images (react-three-fiber). Sizes are world units. */
export const RING = {
  /** Ring radius for 8 cards on desktop / `mobileCount` cards on phones; grows with more cards so spacing stays even. */
  radius: { desktop: 3.1, mobile: 2.3 },
  /** Card width (height follows the 3:2 images). */
  cardWidth: { desktop: 1.7, mobile: 1.45 },
  /** Cards on phones / coarse pointers: the first N of `order`. */
  mobileCount: 6,
  /** Ring order by source filename; images not listed follow alphabetically. */
  order: [
    'adminlobby.jpg',
    'Luxury AlphaFour Corporate Lobby Panorama.png',
    'premam silks.jpg',
    'Floor1.png',
    'roofTop.jpg',
    'Luxury Silk Saree Boutique Panorama.png',
    'Luxurious Twilight Lobby Panorama.png',
    'floor5.jpg',
  ],
  /** Forward tilt of the ring (degrees) so the far side reads as a circle. */
  tilt: 7,
  /** Scale of the card nearest the camera. */
  focusScale: 1.14,
  /** Brightness of cards facing away (0–1); the front card is at 1. */
  sideBrightness: 0.32,
  /** Fading mirror image under each card. */
  reflections: true,
  /** HDR-lit gold frame around each card (world units; 0 = none). */
  frame: 0.035,
  /** Caption overrides by source filename; anything missing uses the filename-derived caption. */
  captions: {
    'adminlobby.jpg': 'Admin Lobby',
    'Floor1.png': 'Showroom · Floor 1',
    'floor5.jpg': 'Showroom · Floor 5',
    'Luxurious Twilight Lobby Panorama.png': 'Twilight Lobby',
    'Luxury AlphaFour Corporate Lobby Panorama.png': 'Alphafour Corporate Lobby',
    'Luxury Silk Saree Boutique Panorama.png': 'Silk Saree Boutique',
    'premam silks.jpg': 'Premam Silks',
    'roofTop.jpg': 'Rooftop Terrace',
  },
};

/** Ring world: the reused sky, HDRI and cloud assets. */
export const RING_WORLD = {
  /** Equirectangular skies: the ring turns from the first into the second. */
  skies: ['/skies/dusk.webp', '/skies/golden-hour.webp'],
  /** Image-based lighting for the gold card frames. */
  hdri: '/hdri/golden-hour_1k.hdr',
  /** Soft sprite for the cloud sea under the ring. */
  cloud: '/textures/cloud.png',
  clouds: { desktop: 22, mobile: 10, opacity: 0.4, color: '#ffe2cc' },
  /** How far the sky turns (degrees) during the ring's one revolution. */
  skyTurn: 40,
  /** Sky rotation (degrees) when the ring settles: -40 puts the golden-hour sun right behind the ring. */
  skyRotation: -40,
};

/** Frame loading and drawing. */
export const LOADING = {
  /** Fraction of frames that must be in before the canvas replaces the poster. */
  readyFraction: 0.1,
  /** Parallel frame downloads. */
  concurrency: 6,
  /** Frames just ahead of the playhead that are fetched before anything else, so the film never waits on the wider download. */
  lookahead: 32,
  /**
   * Decoded frames kept in memory. Compressed frames are all kept; only a window around the
   * playhead is decoded (a full 1920px set decoded would need ~2 GB).
   */
  decodedCache: { desktop: 40, mobile: 44 },
  maxDpr: 2,
  /** Cross-dissolve neighbouring frames by the scroll position between them: no stepping on a slow scroll. */
  blendFrames: true,
};

/** Phones, small viewports and touch devices get the mobile frame set and the smaller ring. */
export const MOBILE_QUERY = '(max-width: 767px), (pointer: coarse)';

// <generated by scripts/extract-hero-frames.mjs: do not edit by hand, run `npm run hero:frames`>
export const FRAMES = {
  "desktop": {
    "count": 600,
    "cutFrames": [
      168,
      372,
      522
    ],
    "transitionHalfFrames": 0,
    "width": 1920,
    "height": 1080,
    "quality": 80,
    "bytes": 41526364,
    "path": "/hero-frames/desktop/frame_",
    "pad": 4,
    "ext": ".webp"
  },
  "mobile": {
    "count": 380,
    "cutFrames": [
      106,
      236,
      330
    ],
    "transitionHalfFrames": 0,
    "width": 960,
    "height": 540,
    "quality": 80,
    "bytes": 11689056,
    "path": "/hero-frames/mobile/frame_",
    "pad": 4,
    "ext": ".webp"
  }
};

/** Kept for convenience: the desktop frame count. */
export const FRAME_COUNT = FRAMES.desktop.count;
/** Frame indices (0-based, desktop set) where each clip hands over to the next: the xfade midpoints. */
export const CUT_FRAMES = FRAMES.desktop.cutFrames;

export const HERO_MEDIA = {
  "poster": "/hero-frames/poster.webp",
  "posterMobile": "/hero-frames/poster-mobile.webp",
  "placeholder": "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAABQAwCdASogABIAPt1ipk4opaMiKA1REBuJZQC90BXzHwvIAAD+7NmuO/ytJr+vMR29V/fUv1B+ce2VueBjP7nM4keLk55HjQEbcT8cGVORzGAAAAA=",
  "cutTimes": [
    10.4,
    23.05,
    32.333
  ],
  "transition": "none (edited into the film)",
  "sourceDuration": 38.08,
  "droppedDarkFrames": 27,
  "sequenceDuration": 37.18
};

export const RING_IMAGES = [
  {
    "file": "adminlobby.jpg",
    "caption": "Adminlobby",
    "desktop": "/hero-frames/ring/desktop/adminlobby.webp",
    "mobile": "/hero-frames/ring/mobile/adminlobby.webp"
  },
  {
    "file": "Floor1.png",
    "caption": "Floor 1",
    "desktop": "/hero-frames/ring/desktop/floor1.webp",
    "mobile": "/hero-frames/ring/mobile/floor1.webp"
  },
  {
    "file": "floor5.jpg",
    "caption": "Floor 5",
    "desktop": "/hero-frames/ring/desktop/floor5.webp",
    "mobile": "/hero-frames/ring/mobile/floor5.webp"
  },
  {
    "file": "Luxurious Twilight Lobby Panorama.png",
    "caption": "Luxurious Twilight Lobby",
    "desktop": "/hero-frames/ring/desktop/luxurious-twilight-lobby-panorama.webp",
    "mobile": "/hero-frames/ring/mobile/luxurious-twilight-lobby-panorama.webp"
  },
  {
    "file": "Luxury AlphaFour Corporate Lobby Panorama.png",
    "caption": "Luxury Alpha Four Corporate Lobby",
    "desktop": "/hero-frames/ring/desktop/luxury-alphafour-corporate-lobby-panorama.webp",
    "mobile": "/hero-frames/ring/mobile/luxury-alphafour-corporate-lobby-panorama.webp"
  },
  {
    "file": "Luxury Silk Saree Boutique Panorama.png",
    "caption": "Luxury Silk Saree Boutique",
    "desktop": "/hero-frames/ring/desktop/luxury-silk-saree-boutique-panorama.webp",
    "mobile": "/hero-frames/ring/mobile/luxury-silk-saree-boutique-panorama.webp"
  },
  {
    "file": "premam silks.jpg",
    "caption": "Premam Silks",
    "desktop": "/hero-frames/ring/desktop/premam-silks.webp",
    "mobile": "/hero-frames/ring/mobile/premam-silks.webp"
  },
  {
    "file": "roofTop.jpg",
    "caption": "Roof Top",
    "desktop": "/hero-frames/ring/desktop/rooftop.webp",
    "mobile": "/hero-frames/ring/mobile/rooftop.webp"
  }
];
// </generated>
