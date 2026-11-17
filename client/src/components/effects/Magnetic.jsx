import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { useFinePointer, useReducedMotion } from '@/hooks/useMediaQuery';

/** Pulls its child gently toward the cursor (magnetic button). */
export function Magnetic({ children, strength = 0.3, className }) {
  const ref = useRef(null);
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotion();
  const enabled = finePointer && !reducedMotion;
  const x = useSpring(useMotionValue(0), { stiffness: 180, damping: 14, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 180, damping: 14, mass: 0.4 });

  const onMove = (event) => {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={enabled ? { x, y } : undefined}
      className={className ?? 'inline-block'}
    >
      {children}
    </motion.div>
  );
}
