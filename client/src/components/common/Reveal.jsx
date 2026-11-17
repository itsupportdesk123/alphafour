import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { EASE_LUXE, viewportOnce } from '@/lib/motion';
import { prefersReducedMotion } from '@/lib/device';
import { cn } from '@/lib/utils';

/** Fades and lifts children into view once. */
export function Reveal({ children, delay = 0, y = 28, className, as = 'div' }) {
  const Component = motion[as] ?? motion.div;
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.9, ease: EASE_LUXE, delay }}
    >
      {children}
    </Component>
  );
}

/**
 * Line-by-line masked text reveal (GSAP SplitText), scrubbed into view.
 * Falls back to plain text under reduced motion.
 */
export function SplitReveal({ as: Component = 'h2', text, className, stagger = 0.08 }) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return undefined;
    let split;
    const ctx = gsap.context(() => {
      split = new SplitText(element, { type: 'lines,words', linesClass: 'split-line', mask: 'lines' });
      gsap.from(split.words, {
        yPercent: 110,
        opacity: 0,
        rotate: 2,
        duration: 1.1,
        ease: 'expo.out',
        stagger,
        scrollTrigger: { trigger: element, start: 'top 85%', once: true },
      });
    }, element);
    return () => {
      ctx.revert();
      split?.revert();
    };
  }, [text, stagger]);

  return (
    <Component ref={ref} className={cn(className)}>
      {text}
    </Component>
  );
}

/** Moves children vertically as the page scrolls (subtle parallax). */
export function Parallax({ children, speed = 0.15, className }) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        element,
        { yPercent: -speed * 100 },
        {
          yPercent: speed * 100,
          ease: 'none',
          scrollTrigger: { trigger: element.parentElement ?? element, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    });
    return () => ctx.revert();
  }, [speed]);

  return (
    <div ref={ref} className={cn('will-change-transform', className)}>
      {children}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const refreshScrollTriggers = () => ScrollTrigger.refresh();
