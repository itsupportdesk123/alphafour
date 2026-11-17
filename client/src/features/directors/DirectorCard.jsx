import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { TiltCard } from '@/components/effects/TiltCard';
import { DirectorProfile } from '@/features/directors/DirectorProfile';
import { FramedPortrait } from '@/features/directors/FramedPortrait';
import { useFinePointer, useMediaQuery, useReducedMotion } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { useLenis } from '@/providers/SmoothScrollProvider';

/**
 * Navy glass caption plate: name and position. With a mouse, a bio teaser and "View profile" open on hover or focus;
 * on touch screens "View profile" is always shown.
 */
function CaptionPlate({ director, headingId, canHover }) {
  const reveal = 'group-hover:grid-rows-[1fr] group-hover:opacity-100 group-has-[:focus-visible]:grid-rows-[1fr] group-has-[:focus-visible]:opacity-100';
  return (
    <div className="absolute inset-x-[21px] bottom-[21px] z-10 rounded-2xl border border-white/15 bg-navy/60 px-4 py-3.5 text-ivory shadow-[0_18px_40px_-18px_rgba(6,12,28,0.8),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl lg:inset-x-[27px] lg:bottom-[27px] lg:px-5 lg:py-4 xl:inset-x-[35px] xl:bottom-[35px]">
      <h3 id={headingId} className="font-display text-[1.3rem] leading-tight lg:text-[1.4rem]">
        {director.name}
      </h3>
      <p className="mt-1.5 flex items-center justify-between gap-3 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-gold lg:tracking-[0.22em]">
        {director.position}
        {canHover && (
          <ArrowUpRight
            aria-hidden
            strokeWidth={1.5}
            className="size-4 shrink-0 transition-transform duration-700 ease-luxe group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        )}
      </p>
      <div
        aria-hidden
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-700 ease-luxe',
          canHover ? cn('grid-rows-[0fr] opacity-0', reveal) : 'grid-rows-[1fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          {canHover && <p className="line-clamp-2 pt-3 text-[0.8rem] leading-relaxed text-ivory/80">{director.bio}</p>}
          <p className="mt-3 flex items-center gap-3 border-t border-white/15 pt-3 text-[0.62rem] font-semibold uppercase tracking-[0.24em]">
            View profile
            <span className="h-px flex-1 bg-gradient-to-r from-gold/70 to-transparent" />
            {!canHover && <ArrowUpRight strokeWidth={1.5} className="size-4 shrink-0 text-gold" />}
          </p>
        </div>
      </div>
    </div>
  );
}

/** One director: an arched portrait card standing in a lit alcove, opening into the profile. */
export function DirectorCard({ director }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const canHover = useFinePointer();
  const wide = useMediaQuery('(min-width: 1024px)');
  const layoutId = wide && !reduced ? `portrait-${director.slug}` : undefined;
  const headingId = `${director.slug}-name`;

  // Smooth scrolling pauses while the profile is open.
  useEffect(() => {
    if (!open || !lenis) return undefined;
    lenis.stop();
    return () => lenis.start();
  }, [open, lenis]);

  // Hover styling only for real pointers, so a tap on a phone never leaves the card stuck in its hover state.
  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <article aria-labelledby={headingId} className="relative isolate pt-3 sm:pt-6">
        <div
          className={cn(
            'peer relative transition-transform duration-700 ease-luxe has-[:focus-visible]:-translate-y-1.5',
            canHover && 'hover:-translate-y-1.5',
          )}
        >
          <TiltCard maxTilt={6} className={cn('rounded-t-full', canHover && 'group')}>
            <FramedPortrait director={director} layoutId={layoutId} settle />
            <CaptionPlate director={director} headingId={headingId} canHover={canHover} />
            <DialogPrimitive.Trigger asChild>
              <button
                ref={triggerRef}
                type="button"
                data-cursor="View"
                className="absolute inset-0 z-20 rounded-t-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-ink focus-visible:ring-offset-4 focus-visible:ring-offset-background dark:focus-visible:ring-gold"
              >
                <span className="sr-only">View profile of {director.name}</span>
              </button>
            </DialogPrimitive.Trigger>
          </TiltCard>
        </div>
        {/* The alcove, the picture light above it, the floor shadow and the ledge line. */}
        <span
          aria-hidden
          className={cn(
            'absolute -inset-x-3 bottom-8 top-0 -z-10 rounded-t-full border border-b-0 border-gold/30 bg-gradient-to-b from-champagne/45 via-sand/20 to-transparent shadow-[inset_0_24px_36px_-28px_rgba(134,101,38,0.45)] transition-colors duration-700 [mask-image:linear-gradient(to_bottom,#000_62%,transparent)] peer-has-[:focus-visible]:border-gold/60 sm:-inset-x-4 lg:-inset-x-6',
            'dark:border-gold/25 dark:from-gold/[0.12] dark:via-navy-800/50 dark:shadow-[inset_0_24px_36px_-28px_rgba(0,0,0,0.6)]',
            canHover && 'peer-hover:border-gold/60',
          )}
        />
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute -top-10 left-1/2 -z-20 h-56 w-[130%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(243,223,162,0.55),transparent)] opacity-70 transition-opacity duration-700 ease-luxe peer-has-[:focus-visible]:opacity-100 dark:bg-[radial-gradient(closest-side,rgba(201,162,75,0.2),transparent)]',
            canHover && 'peer-hover:opacity-100',
          )}
        />
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-x-8 bottom-2 -z-10 h-6 rounded-[100%] bg-navy/30 blur-xl transition-[opacity,transform] duration-700 ease-luxe dark:bg-black/60',
            canHover && 'peer-hover:scale-x-75 peer-hover:opacity-60',
          )}
        />
        <span aria-hidden className="-mx-3 mt-4 block h-px bg-hairline-gold sm:-mx-4 lg:-mx-6" />
      </article>
      <AnimatePresence>
        {open && (
          <DirectorProfile
            key="profile"
            director={director}
            layoutId={layoutId}
            wide={wide}
            triggerRef={triggerRef}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
