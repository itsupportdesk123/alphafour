import { create } from 'zustand';

/**
 * Whether the intro plays on this visit is decided by the inline script in index.html, before the
 * app loads, so its splash can cover the first paint. The rules live there: ?intro=1 / ?intro=0,
 * VITE_INTRO_MODE (session | always | once | off), and no autoplay for reduced motion, Data Saver
 * or automated browsers.
 */
const playsOnEntry = typeof window !== 'undefined' && window.__alphafourIntro === true;

export const useIntroStore = create((set) => ({
  open: playsOnEntry,
  /** True when the visitor asked to watch it again (it fades in instead of taking over the splash). */
  replay: false,
  play: () => set({ open: true, replay: true }),
  close: () => set({ open: false }),
}));
