import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { useFinePointer, useReducedMotion } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

/** 3D hover tilt with a moving gold glare (desktop pointers only). */
export function TiltCard({ children, maxTilt = 7, glare = true, className }) {
  const ref = useRef(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;

  const rx = useSpring(useMotionValue(0), { stiffness: 160, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 160, damping: 18 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glareBg = useMotionTemplate`radial-gradient(420px circle at ${gx}% ${gy}%, rgba(243,223,162,.22), transparent 55%)`;

  const onMove = (event) => {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    ry.set((px - 0.5) * maxTilt * 2);
    rx.set(-(py - 0.5) * maxTilt * 2);
    gx.set(px * 100);
    gy.set(py * 100);
  };

  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={enabled ? { rotateX: rx, rotateY: ry, transformPerspective: 1100 } : undefined}
      className={cn('relative [transform-style:preserve-3d]', className)}
    >
      {children}
      {glare && enabled && (
        <motion.div
          aria-hidden
          style={{ background: glareBg }}
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      )}
    </motion.div>
  );
}
