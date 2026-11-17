import { animate, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/device';

/** Counts up to `value` the first time it scrolls into view. */
export function NumberTicker({ value, decimals = 0, prefix = '', suffix = '', duration = 2.2, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    if (prefersReducedMotion()) {
      setDisplay(value);
      return undefined;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(latest),
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  const formatted = display.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  return (
    <span ref={ref} className={className}>
      <span aria-hidden>
        {prefix}
        {formatted}
        {suffix}
      </span>
      <span className="sr-only">
        {prefix}
        {value.toLocaleString('en-IN')}
        {suffix}
      </span>
    </span>
  );
}
