import { useEffect, useRef, useState } from 'react';
import { useFinePointer, useReducedMotion } from '@/hooks/useMediaQuery';

const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, label, summary, [data-cursor]';

/**
 * Gold ring that trails the pointer and grows over interactive elements.
 * Shows a label for elements with data-cursor="Drag" / "View" etc.
 * The native cursor stays visible for accessibility.
 */
export function CustomCursor() {
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotion();
  const enabled = finePointer && !reducedMotion;
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!enabled) return undefined;
    const ring = ringRef.current;
    const dot = dotRef.current;
    const target = { x: -100, y: -100 };
    const current = { x: -100, y: -100 };
    let scale = 1;
    let targetScale = 1;
    let frame;

    const onMove = (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
      dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`;
      const element = event.target instanceof Element ? event.target.closest(INTERACTIVE) : null;
      const text = element?.getAttribute('data-cursor') ?? '';
      targetScale = element ? (text ? 2.6 : 1.8) : 1;
      setLabel((prev) => (prev === text ? prev : text));
    };
    const onLeave = () => {
      target.x = -100;
      target.y = -100;
    };
    const onDown = () => {
      targetScale *= 0.85;
    };

    const loop = () => {
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;
      scale += (targetScale - scale) * 0.15;
      ring.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerdown', onDown);
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[140] mix-blend-difference">
      <div
        ref={ringRef}
        className="absolute left-0 top-0 flex size-9 items-center justify-center rounded-full border border-[#E6D3A3] will-change-transform"
      >
        {label && (
          <span className="text-[0.32rem] font-bold uppercase tracking-[0.2em] text-[#E6D3A3]">{label}</span>
        )}
      </div>
      <div ref={dotRef} className="absolute left-0 top-0 size-1.5 rounded-full bg-[#E6D3A3] will-change-transform" />
    </div>
  );
}
