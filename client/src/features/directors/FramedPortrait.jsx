import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { EASE_LUXE, viewportOnce } from '@/lib/motion';
import { cn } from '@/lib/utils';

/** Fine film grain over both photographs, so the small and the large source read as one set. */
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>")`;

/**
 * A director's portrait as a framed object: ivory mat inside a gold hairline and fillet, a keystone and an arched window.
 * `fit="dissolve"` (cards) keeps the square photo at its own width and lets it dissolve into a blurred wash of itself,
 * so the small source is never enlarged; `fit="cover"` (the profile, drawn smaller) fills the window.
 * A shared `layoutId` lets the frame fly between the card and the profile.
 */
export function FramedPortrait({ director, layoutId, fit = 'dissolve', settle = false }) {
  const reduced = useReducedMotion();
  const cover = fit === 'cover';
  return (
    <motion.div
      layoutId={layoutId}
      transition={{ layout: { duration: 0.9, ease: EASE_LUXE } }}
      className={cn(
        'relative rounded-t-full border border-gold/45 bg-gradient-to-b from-ivory via-ivory to-cream p-3.5 shadow-luxe',
        'dark:border-gold/45 dark:from-navy-700 dark:via-navy-800 dark:to-navy-900 dark:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)]',
        !cover && 'xl:p-[1.375rem]',
      )}
    >
      <span
        aria-hidden
        className={cn('pointer-events-none absolute inset-[5px] rounded-t-full border border-gold/30 dark:border-gold/20', !cover && 'xl:inset-[8px]')}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 z-30 size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-gold bg-ivory shadow-[0_0_10px_rgba(201,162,75,0.45)] transition-[background-color,box-shadow] duration-700 ease-luxe group-hover:bg-gold group-hover:shadow-[0_0_18px_rgba(243,223,162,0.9)] group-has-[:focus-visible]:bg-gold dark:bg-navy-900"
      />
      <div className="relative isolate aspect-[4/5] overflow-hidden rounded-t-full bg-navy ring-1 ring-gold/50">
        <motion.div
          className="absolute inset-0"
          initial={settle && !reduced ? { scale: 1.12 } : false}
          whileInView={{ scale: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 1.8, ease: EASE_LUXE }}
        >
          {!cover && (
            <img
              src={director.portrait}
              alt=""
              aria-hidden
              decoding="async"
              className="absolute inset-0 size-full scale-125 object-cover blur-2xl brightness-90 saturate-150 transition-transform ease-luxe [transition-duration:1600ms] group-hover:scale-[1.32]"
            />
          )}
          <img
            src={director.portrait}
            alt={`Portrait of ${director.name}`}
            decoding="async"
            className={cn(
              'absolute w-full origin-[50%_30%] object-cover transition-transform ease-luxe [transition-duration:1600ms] group-hover:scale-105',
              cover ? 'inset-0 h-full' : 'inset-x-0 top-0 aspect-square [mask-image:linear-gradient(to_bottom,#000_64%,transparent_96%)]',
            )}
          />
        </motion.div>
        <span aria-hidden className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
        <span aria-hidden className="absolute inset-0 bg-[radial-gradient(85%_55%_at_50%_28%,transparent_45%,rgba(6,12,28,0.3)_100%)]" />
        <span
          aria-hidden
          className={cn('absolute inset-0 bg-gradient-to-t to-transparent', cover ? 'from-navy/35 via-navy/0 via-30%' : 'from-navy/80 via-navy/0 via-45%')}
        />
        <span aria-hidden className="absolute inset-0 rounded-t-full shadow-[inset_0_2px_14px_rgba(6,12,28,0.35)]" />
      </div>
    </motion.div>
  );
}
