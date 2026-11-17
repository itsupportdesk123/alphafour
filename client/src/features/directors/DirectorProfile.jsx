import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { motion, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';
import { Eyebrow, GoldDivider } from '@/components/common/Section';
import { FramedPortrait } from '@/features/directors/FramedPortrait';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { EASE_LUXE, EASE_SILK } from '@/lib/motion';
import { cn } from '@/lib/utils';

/** Gold ink on ivory, plain gold at night (AA in both themes). */
const INK = 'text-gold-ink dark:text-gold';

const TABS = [
  { value: 'highlights', label: 'Highlights' },
  { value: 'experience', label: 'Experience' },
];

/**
 * On the spread both panels share one grid cell, so switching never changes its height.
 * On the sheet the inactive panel leaves the flow, so a short panel leaves no blank sheet below it.
 */
const PANEL = cn(
  'col-start-1 row-start-1 self-start rounded-2xl transition-[opacity,transform,visibility] duration-500 ease-luxe',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-ink focus-visible:ring-offset-4 focus-visible:ring-offset-background dark:focus-visible:ring-gold',
  'data-[state=inactive]:pointer-events-none data-[state=inactive]:invisible data-[state=inactive]:translate-y-2 data-[state=inactive]:opacity-0',
  'max-lg:data-[state=inactive]:hidden max-lg:data-[state=active]:animate-in max-lg:data-[state=active]:fade-in-0 max-lg:data-[state=active]:slide-in-from-bottom-2 max-lg:data-[state=active]:duration-500',
);

/** Gold-foil segmented switcher between the two detail groups; one pill glides under the active label. */
function ProfileTabs({ director }) {
  const reduced = useReducedMotion();
  const [tab, setTab] = useState('highlights');
  return (
    <TabsPrimitive.Root value={tab} onValueChange={setTab} className="mt-7 [@media(min-width:1024px)_and_(max-height:820px)]:mt-5">
      <TabsPrimitive.List
        aria-label={`${director.name}: highlights and experience`}
        className="relative grid w-full grid-cols-2 rounded-full border border-gold/30 bg-white/60 p-1 shadow-glass dark:bg-white/[0.04] dark:shadow-glass-dark sm:inline-grid sm:w-auto"
      >
        <motion.span
          aria-hidden
          className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-gold-foil shadow-gold-glow"
          initial={false}
          animate={{ x: tab === TABS[0].value ? '0%' : '100%' }}
          transition={{ duration: reduced ? 0 : 0.55, ease: EASE_LUXE }}
        />
        {TABS.map(({ value, label }) => (
          <TabsPrimitive.Trigger
            key={value}
            value={value}
            className="relative h-11 rounded-full px-7 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-500 ease-luxe hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ivory data-[state=active]:text-navy dark:focus-visible:ring-gold dark:focus-visible:ring-offset-navy-900"
          >
            {label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      <div className="mt-5 grid">
        <TabsPrimitive.Content value="highlights" forceMount className={PANEL}>
          <HighlightList items={director.highlights} />
        </TabsPrimitive.Content>
        <TabsPrimitive.Content value="experience" forceMount className={PANEL}>
          <ExperienceList items={director.experience} />
        </TabsPrimitive.Content>
      </div>
    </TabsPrimitive.Root>
  );
}

/** Highlights as hairline-ruled entries, each marked with a gold diamond. */
function HighlightList({ items }) {
  return (
    <ul className="grid gap-x-10 sm:grid-cols-2 lg:gap-x-8 xl:gap-x-10">
      {items.map((item) => (
        <li key={item.title} className="group/hl flex gap-4 border-t border-gold/25 py-4 [@media(min-width:1024px)_and_(max-height:820px)]:py-3">
          <span
            aria-hidden
            className="mt-[0.55rem] size-2 shrink-0 rotate-45 border border-gold-ink transition-colors duration-500 group-hover/hl:bg-gold dark:border-gold"
          />
          <div>
            <h3 className="text-pretty font-display text-[1.3rem] leading-snug [@media(min-width:1024px)_and_(max-height:820px)]:text-[1.15rem]">
              {item.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground [@media(min-width:1024px)_and_(max-height:820px)]:text-[0.8125rem]">
              {item.description}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Experience as a ledger on a gold rail: role, organisation and period. */
function ExperienceList({ items }) {
  return (
    <div className="relative">
      <span aria-hidden className="absolute bottom-8 left-[4.5px] top-8 w-px bg-gradient-to-b from-gold/70 via-gold/35 to-gold/70" />
      <ul>
        {items.map((item) => (
          <li
            key={`${item.role}-${item.org}`}
            className="relative flex items-center justify-between gap-5 border-gold/15 py-3 pl-8 [&:not(:last-child)]:border-b [@media(min-width:1024px)_and_(max-height:820px)]:py-2.5"
          >
            <span aria-hidden className="absolute left-0 top-1/2 size-2.5 -translate-y-1/2 rotate-45 border border-gold bg-ivory dark:bg-navy-900" />
            <div className="min-w-0">
              <p className="font-display text-[1.3rem] leading-snug [@media(min-width:1024px)_and_(max-height:820px)]:text-[1.15rem]">{item.role}</p>
              <p className="text-sm text-muted-foreground">{item.org}</p>
            </div>
            <span className={cn('inline-flex shrink-0 items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.22em]', INK)}>
              <span aria-hidden className="size-1.5 rounded-full bg-current dark:shadow-[0_0_8px_rgba(201,162,75,0.9)]" />
              {item.period}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A director's opened profile. On large screens a two-page brochure spread: the framed portrait glides out of its card
 * onto the left page while the right page unfolds from the spine. Below that, a sheet that rises from the bottom edge.
 */
export function DirectorProfile({ director, layoutId, wide, triggerRef, onClose }) {
  const reduced = useReducedMotion();
  const dragControls = useDragControls();
  const [firstName, ...otherNames] = director.name.split(' ');
  const timing = (duration, delay = 0) => ({ duration: reduced ? 0.2 : duration, delay: reduced ? 0 : delay, ease: EASE_LUXE });
  const leave = { opacity: 0, transition: { duration: reduced ? 0.15 : 0.35, ease: EASE_SILK } };
  // Type clears first on close, so the portrait flying back to its card never crosses legible text.
  const clear = { opacity: 0, transition: { duration: 0.12, ease: EASE_LUXE } };

  // Phones and tablets: the whole sheet slides up and can be pulled down by its handle to close.
  // Large screens: paper, pages and portrait move separately.
  const sheet = wide
    ? {}
    : {
        initial: reduced ? { opacity: 0 } : { y: '100%' },
        animate: reduced ? { opacity: 1 } : { y: 0 },
        exit: reduced ? { opacity: 0 } : { y: '100%', transition: { duration: 0.45, ease: EASE_SILK } },
        transition: timing(0.7),
        drag: 'y',
        dragControls,
        dragListener: false,
        dragConstraints: { top: 0, bottom: 0 },
        dragElastic: { top: 0, bottom: 0.8 },
        onDragEnd: (_, info) => {
          if (info.offset.y > 110 || info.velocity.y > 600) onClose();
        },
      };
  const part = (delay, from = { opacity: 0, y: 14 }, exit = leave) =>
    wide
      ? { initial: reduced ? { opacity: 0 } : from, animate: { opacity: 1, x: 0, y: 0, scale: 1, rotateY: 0 }, exit, transition: timing(0.85, delay) }
      : {};

  // Return focus to the card without letting the browser scroll it into view.
  const returnFocus = (event) => {
    event.preventDefault();
    triggerRef.current?.focus({ preventScroll: true });
  };

  return (
    <DialogPrimitive.Portal forceMount>
      <DialogPrimitive.Overlay asChild forceMount>
        <motion.div
          className="fixed inset-0 z-[100] bg-navy/60 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: EASE_SILK } }}
          transition={timing(0.6)}
        />
      </DialogPrimitive.Overlay>
      <div className="pointer-events-none fixed inset-0 z-[110] flex items-end justify-center lg:items-center lg:p-8">
        <DialogPrimitive.Content asChild forceMount onCloseAutoFocus={returnFocus}>
          <motion.div
            {...sheet}
            className={cn(
              'pointer-events-auto relative w-full text-foreground',
              'max-lg:flex max-lg:max-h-[92dvh] max-lg:max-w-2xl max-lg:flex-col max-lg:overflow-hidden max-lg:rounded-t-[2rem] max-lg:border max-lg:border-b-0 max-lg:border-gold/30 max-lg:bg-ivory max-lg:shadow-[0_-24px_60px_-24px_rgba(6,12,28,0.55)] max-lg:dark:bg-navy-900',
              'lg:grid lg:h-[min(50rem,calc(100dvh-4rem))] lg:max-w-[70rem] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]',
            )}
          >
            {/* The sheet's solid header holds the drag handle and Close; on the spread only Close remains, in the corner. */}
            <div className="relative z-30 flex h-14 shrink-0 items-center justify-center border-b border-gold/20 bg-cream/95 backdrop-blur-md dark:bg-navy-800/95 lg:contents">
              <div
                aria-hidden
                onPointerDown={(event) => dragControls.start(event)}
                className="flex h-full w-40 cursor-grab touch-none items-center justify-center active:cursor-grabbing lg:hidden"
              >
                <span className="h-1 w-12 rounded-full bg-gold/50" />
              </div>
              <DialogPrimitive.Close asChild>
                <motion.button
                  type="button"
                  {...part(0.3, { opacity: 0 }, clear)}
                  className="absolute right-3 top-1.5 z-30 inline-flex size-11 items-center justify-center rounded-full border border-gold/35 bg-ivory/80 text-foreground backdrop-blur-md transition-colors duration-300 hover:border-gold hover:bg-gold/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-ink dark:bg-navy-900/70 dark:focus-visible:ring-gold lg:right-5 lg:top-5"
                >
                  <X className="size-4" aria-hidden />
                  <span className="sr-only">Close</span>
                </motion.button>
              </DialogPrimitive.Close>
            </div>

            {/* Large screens: the brochure paper, with a cream left page and a shaded spine. */}
            <motion.div
              aria-hidden
              {...part(0, { opacity: 0, scale: 0.97, y: 18 })}
              className="absolute inset-0 hidden rounded-[2rem] border border-gold/30 bg-ivory shadow-luxe dark:bg-navy-900 dark:shadow-glass-dark lg:block"
            >
              <div className="absolute inset-y-0 left-0 w-5/12 rounded-l-[2rem] bg-cream dark:bg-navy-800/70" />
              <div className="absolute inset-y-0 left-[41.667%] w-20 bg-gradient-to-r from-navy/[0.07] to-transparent dark:from-black/25" />
              <div className="absolute inset-y-10 left-[41.667%] w-px bg-gradient-to-b from-transparent via-gold/45 to-transparent" />
            </motion.div>

            <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain lg:contents">
              <div className="relative flex flex-col items-center px-6 pb-4 pt-9 max-lg:bg-gradient-to-b max-lg:from-cream max-lg:to-ivory max-lg:dark:from-navy-800 max-lg:dark:to-navy-900 sm:px-10 lg:justify-center lg:px-10 lg:py-12">
                <div className="relative isolate w-[12.5rem] sm:w-[15rem] lg:w-[18.5rem] [@media(min-width:1024px)_and_(max-height:760px)]:w-[15rem]">
                  <motion.span
                    aria-hidden
                    {...part(0.2, { opacity: 0 })}
                    className="absolute -inset-x-4 -top-4 bottom-[35%] -z-10 rounded-t-full border border-b-0 border-gold/30 [mask-image:linear-gradient(to_bottom,#000_55%,transparent)] lg:-inset-x-5 lg:-top-5"
                  />
                  <motion.div {...(layoutId ? {} : part(0.1, { opacity: 0 }))}>
                    <FramedPortrait director={director} layoutId={layoutId} fit="cover" />
                  </motion.div>
                </div>
                <motion.div {...part(0.35, undefined, clear)} className="mt-7 text-center lg:mt-8">
                  <DialogPrimitive.Title className="font-display text-display-md leading-[1.02]">
                    {firstName} <span className="block italic text-gold-ink dark:text-champagne">{otherNames.join(' ')}</span>
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description className={cn('mt-3 text-micro uppercase', INK)}>{director.position}</DialogPrimitive.Description>
                </motion.div>
              </div>

              <motion.div
                data-lenis-prevent
                {...part(0.12, { opacity: 0, rotateY: -14 }, clear)}
                style={wide ? { transformOrigin: '0% 50%', transformPerspective: 1800 } : undefined}
                className={cn(
                  'relative px-6 pb-12 pt-8 sm:px-10',
                  'lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:px-10 lg:pb-14 lg:pt-14 lg:[mask-image:linear-gradient(to_bottom,#000_calc(100%-3.5rem),transparent)] xl:pl-14 xl:pr-12',
                  '[@media(min-width:1024px)_and_(max-height:820px)]:pt-10',
                )}
              >
                <Eyebrow>Profile</Eyebrow>
                <p className="mt-4 text-pretty font-display text-[1.28rem] leading-[1.5] text-foreground/80 [@media(min-width:1024px)_and_(max-height:820px)]:text-[1.12rem] [@media(min-width:1024px)_and_(max-height:820px)]:leading-[1.45]">
                  {director.bio}
                </p>
                <GoldDivider className="mt-7 [@media(min-width:1024px)_and_(max-height:820px)]:mt-5" />
                <ProfileTabs director={director} />
              </motion.div>
            </div>
          </motion.div>
        </DialogPrimitive.Content>
      </div>
    </DialogPrimitive.Portal>
  );
}
