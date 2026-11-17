import { useRef, useState } from 'react';
import { Reveal } from '@/components/common/Reveal';
import { DirectorCard } from '@/features/directors/DirectorCard';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

/** Phones: a snap row with the next card peeking in, dimmed, plus gold rail markers. Wider screens: a pair of alcoves. */
export function DirectorGallery({ directors }) {
  const rowRef = useRef(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();

  const centreOf = (item) => item.offsetLeft + item.offsetWidth / 2;

  // The card nearest the middle of the row is the active one.
  const onScroll = () => {
    const row = rowRef.current;
    if (!row) return;
    const centre = row.scrollLeft + row.clientWidth / 2;
    const items = [...row.children];
    const nearest = items.reduce((best, item, index) => (Math.abs(centreOf(item) - centre) < Math.abs(centreOf(items[best]) - centre) ? index : best), 0);
    setActive(nearest);
  };

  const show = (index) => {
    const row = rowRef.current;
    const item = row?.children[index];
    if (!item) return;
    row.scrollTo({ left: item.offsetLeft - row.firstElementChild.offsetLeft, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <div className="relative -mx-5 mt-12 sm:mx-auto sm:mt-20 sm:max-w-[44rem] lg:max-w-[54rem]">
      <ul
        ref={rowRef}
        onScroll={onScroll}
        className="no-scrollbar relative flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto px-5 pb-4 pt-2 sm:grid sm:grid-cols-2 sm:gap-12 sm:overflow-visible sm:p-0 lg:gap-24"
      >
        {directors.map((director, index) => (
          <Reveal
            as="li"
            key={director.id}
            delay={index * 0.12}
            y={40}
            className="w-[86%] max-w-[21rem] shrink-0 snap-start sm:mx-auto sm:w-full lg:max-w-[22rem] xl:max-w-[24rem]"
          >
            {/* Reveal owns the item's opacity, so the phone dimming sits on its own wrapper. */}
            <div
              data-active={active === index}
              className="max-sm:transition-opacity max-sm:duration-700 max-sm:ease-luxe max-sm:data-[active=false]:opacity-55"
            >
              <DirectorCard director={director} />
            </div>
          </Reveal>
        ))}
      </ul>
      <div className="mt-3 flex justify-center gap-2 sm:hidden">
        {directors.map((director, index) => (
          <button
            key={director.id}
            type="button"
            onClick={() => show(index)}
            aria-label={`Show ${director.name}`}
            aria-current={active === index ? 'true' : undefined}
            className="flex h-11 items-center rounded-full px-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-ink dark:focus-visible:ring-gold"
          >
            <span
              className={cn(
                'block h-[3px] rounded-full transition-all duration-700 ease-luxe',
                active === index ? 'w-10 bg-gold-ink dark:bg-gold' : 'w-5 bg-taupe-ink/80 dark:bg-ivory/45',
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
