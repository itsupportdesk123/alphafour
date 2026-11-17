import { cn } from '@/lib/utils';

/** A gold light travelling around a rounded border (animated gradient border). */
export function BorderBeam({ size = 220, duration = 9, delay = 0, colorFrom = '#F3DFA2', colorTo = '#B8892F', className }) {
  return (
    <div
      aria-hidden
      style={{
        '--size': size,
        '--duration': duration,
        '--color-from': colorFrom,
        '--color-to': colorTo,
        '--delay': `-${delay}s`,
      }}
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit] [border:1.5px_solid_transparent]',
        '![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]',
        'after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:animate-border-beam after:[animation-delay:var(--delay)] after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] after:[offset-anchor:90%_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]',
        className,
      )}
    />
  );
}
