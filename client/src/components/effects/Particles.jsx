import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/device';
import { cn } from '@/lib/utils';

/**
 * Slow floating gold dust on a canvas. Pauses when off-screen and is static
 * for reduced-motion users. Gently drifts away from the pointer.
 */
export function Particles({ quantity = 55, color = '201,162,75', className }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const reduced = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pointer = { x: -9999, y: -9999 };
    let particles = [];
    let frame = 0;
    let visible = true;
    let width = 0;
    let height = 0;

    const spawn = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -Math.random() * 0.25 - 0.05,
      alpha: Math.random() * 0.5 + 0.15,
      twinkle: Math.random() * Math.PI * 2,
    });

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: quantity }, spawn);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        if (!reduced) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            p.x += (dx / dist) * 0.6;
            p.y += (dy / dist) * 0.6;
          }
          p.x += p.vx;
          p.y += p.vy;
          p.twinkle += 0.02;
          if (p.y < -10) Object.assign(p, spawn(), { y: height + 10 });
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
        }
        const alpha = p.alpha * (0.65 + Math.sin(p.twinkle) * 0.35);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${color},0.6)`;
        ctx.fill();
      }
    };

    const loop = () => {
      if (visible) draw();
      frame = requestAnimationFrame(loop);
    };

    const onPointer = (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };

    resize();
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(canvas);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    if (reduced) draw();
    else frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
    };
  }, [quantity, color]);

  return <canvas ref={canvasRef} aria-hidden className={cn('pointer-events-none absolute inset-0', className)} />;
}
