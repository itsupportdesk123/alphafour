import Lenis from 'lenis';
import { createContext, useContext, useEffect, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/device';

const LenisContext = createContext(null);

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger and Lenis
 * stay in perfect sync. Disabled for visitors who prefer reduced motion.
 */
export function SmoothScrollProvider({ children }) {
  const [lenis, setLenis] = useState(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const instance = new Lenis({ lerp: 0.075, smoothWheel: true, wheelMultiplier: 0.85, touchMultiplier: 1.3 });
    const onTick = (time) => instance.raf(time * 1000);

    instance.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    return () => {
      gsap.ticker.remove(onTick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLenis = () => useContext(LenisContext);

/** Scrolls to a target (selector, element or y) with Lenis when available. */
// eslint-disable-next-line react-refresh/only-export-components
export function scrollToTarget(lenis, target, { offset = -96, immediate = false } = {}) {
  if (lenis) {
    lenis.scrollTo(target, { offset, immediate, duration: immediate ? 0 : 1.4 });
    return;
  }
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: immediate ? 'auto' : 'smooth' });
    return;
  }
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (element) {
    const top = element.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: immediate ? 'auto' : 'smooth' });
  }
}
