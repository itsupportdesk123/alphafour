import { Suspense, useEffect, useRef, useState } from 'react';
import { GoldRing } from '@/components/common/PageLoader';
import { cn } from '@/lib/utils';

/**
 * Renders children only once the placeholder approaches the viewport, inside Suspense.
 * Use with React.lazy() components to keep heavy libraries (maps, 360° viewers) out of
 * the initial bundle.
 */
export function LazyMount({ children, className, minHeight = '24rem', rootMargin = '400px 0px', fallback }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || visible) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  const placeholder = fallback ?? (
    <div className="grid size-full place-items-center" style={{ minHeight }}>
      <GoldRing size={48} />
    </div>
  );

  return (
    <div ref={ref} className={cn('relative', className)} style={visible ? undefined : { minHeight }}>
      {visible ? <Suspense fallback={placeholder}>{children}</Suspense> : placeholder}
    </div>
  );
}
