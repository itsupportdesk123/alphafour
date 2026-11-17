/**
 * AlphaFour company intro film, played full-screen when a visitor enters the site.
 *
 * The files are web encodes of public/assets/AlphaFourIntroVideo.mp4 (H.264, index at the front so
 * playback starts at once, silent audio track removed). The poster is the film's exact first frame,
 * so the splash in index.html, the poster and the first video frame are pixel-identical.
 * index.html also references the poster path; keep the two in sync if you rename it.
 */
export const INTRO = {
  sources: {
    /** Desktops and tablets. */
    large: '/videos/alphafour-intro-1080.mp4',
    /** Phones and slow connections. */
    small: '/videos/alphafour-intro-720.mp4',
  },
  poster: '/videos/alphafour-intro-poster.webp',
  title: 'Alphafour Infrastructure Pvt Ltd introduction',
  /** Pause on the closing logo before fading into the site. */
  holdLastFrameMs: 350,
  /** Enter the site anyway if the film hasn't started by then (very slow network). */
  startTimeoutMs: 8000,
};

/** Smaller file for phones (either orientation) and connections reported as 3G or slower. */
export function pickIntroSource() {
  const smallScreen = window.matchMedia('(max-width: 767px), (max-height: 500px)').matches;
  const slow = ['slow-2g', '2g', '3g'].includes(navigator.connection?.effectiveType);
  return smallScreen || slow ? INTRO.sources.small : INTRO.sources.large;
}
