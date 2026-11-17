import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { CustomCursor } from '@/components/effects/CustomCursor';
import { GrainOverlay, ScrollProgress } from '@/components/effects/ScrollProgress';
import { LeadDialogs } from '@/components/forms/LeadDialogs';
import { FloatingActions } from '@/components/layout/FloatingActions';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useIntroStore } from '@/features/intro/introStore';
import { ScrollTrigger } from '@/lib/gsap';
import { EASE_SILK } from '@/lib/motion';
import { scrollToTarget, SmoothScrollProvider, useLenis } from '@/providers/SmoothScrollProvider';

/** How long the old page fades before the next one replaces it. */
const PAGE_EXIT_MS = 400;

/**
 * Fades the old page out, then shows whichever page the visitor is on by then. Following another link
 * during the fade only retargets it, so the page on screen always ends up matching the URL. (This was
 * AnimatePresence mode="wait", which could stay stuck on a stale page after quick clicks.)
 */
function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();
  const lenis = useLenis();
  // The element a route had when it was shown: it stays on screen unchanged while it fades out.
  const [shown, setShown] = useState({ key: location.pathname, outlet });
  const [leaving, setLeaving] = useState(false);
  const latest = useRef(null);
  const hasSwapped = useRef(false); // the first page appears at once, with no fade

  useEffect(() => {
    latest.current = { location, outlet, lenis };
  });

  useEffect(() => {
    if (location.pathname === shown.key) {
      setLeaving(false);
      return undefined;
    }
    setLeaving(true);
    const timer = setTimeout(() => {
      const next = latest.current;
      if (!next.location.hash) scrollToTarget(next.lenis, 0, { immediate: true, offset: 0 });
      hasSwapped.current = true;
      setShown({ key: next.location.pathname, outlet: next.outlet });
      setLeaving(false);
    }, PAGE_EXIT_MS);
    return () => clearTimeout(timer);
  }, [location.pathname, shown.key]);

  return (
    <motion.div
      key={shown.key}
      initial={hasSwapped.current ? { opacity: 0 } : false}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={leaving ? { duration: PAGE_EXIT_MS / 1000, ease: EASE_SILK } : { duration: 0.6, ease: EASE_SILK, delay: 0.2 }}
    >
      {shown.outlet}
    </motion.div>
  );
}

/** Navy curtain with a gold edge that sweeps over the page between routes. */
function RouteCurtain() {
  const { pathname } = useLocation();
  const [sweep, setSweep] = useState(0);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setSweep((n) => n + 1);
  }, [pathname]);

  if (sweep === 0) return null;
  return (
    <motion.div
      key={sweep}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[95] border-y border-gold/50 bg-royal-night"
      initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
      animate={{
        clipPath: ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)', 'inset(0% 0% 0% 0%)', 'inset(0% 0% 100% 0%)'],
      }}
      transition={{ duration: 1.35, times: [0, 0.32, 0.5, 1], ease: EASE_SILK }}
    />
  );
}

/**
 * Scrolls to #hash targets after navigation and refreshes ScrollTrigger measurements.
 * While the entry intro film covers the page it waits, then runs once the film is gone.
 */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  const lenis = useLenis();
  const entryIntro = useIntroStore((s) => s.open && !s.replay);

  useEffect(() => {
    if (entryIntro) return undefined;
    const timers = [];
    if (hash) {
      timers.push(setTimeout(() => scrollToTarget(lenis, hash, { offset: -80 }), 650));
    }
    timers.push(setTimeout(() => ScrollTrigger.refresh(), 900));
    return () => timers.forEach(clearTimeout);
  }, [pathname, hash, lenis, entryIntro]);

  return null;
}

/** Holds smooth scrolling while the intro film is on screen. */
function IntroScrollLock() {
  const introOpen = useIntroStore((s) => s.open);
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    if (introOpen) lenis.stop();
    else lenis.start();
  }, [lenis, introOpen]);

  return null;
}

export function RootLayout() {
  return (
    <SmoothScrollProvider>
      <TooltipProvider>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-gold focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-navy"
        >
          Skip to content
        </a>
        <ScrollProgress />
        <Navbar />
        <main id="main" tabIndex={-1} className="outline-none">
          <AnimatedOutlet />
        </main>
        <RouteCurtain />
        <Footer />
        <FloatingActions />
        <LeadDialogs />
        <ScrollManager />
        <IntroScrollLock />
        <CustomCursor />
        <GrainOverlay />
        <Toaster
          position="bottom-center"
          toastOptions={{
            classNames: {
              toast: '!rounded-2xl !border !border-gold/30 !bg-navy !text-ivory !shadow-luxe',
              description: '!text-ivory/75',
              title: '!font-semibold',
            },
          }}
        />
      </TooltipProvider>
    </SmoothScrollProvider>
  );
}
