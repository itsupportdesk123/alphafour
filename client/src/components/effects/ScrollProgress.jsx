import { motion, useScroll, useSpring } from 'framer-motion';

/** Hairline gold reading-progress bar at the very top of the page. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[90] h-[2px] origin-left bg-gold-foil print:hidden"
    />
  );
}

export function GrainOverlay() {
  return <div aria-hidden className="grain-overlay" />;
}
