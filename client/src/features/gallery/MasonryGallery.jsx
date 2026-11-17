import { AnimatePresence, motion } from 'framer-motion';
import { Expand } from 'lucide-react';
import { lazy, Suspense, useMemo, useState } from 'react';
import { SmartImage } from '@/components/common/SmartImage';
import { GALLERY_FILTERS } from '@/data/gallery';
import { unsplash } from '@/lib/media';
import { EASE_LUXE } from '@/lib/motion';
import { cn } from '@/lib/utils';

const GalleryLightbox = lazy(() => import('@/features/gallery/GalleryLightbox'));

const CATEGORY_LABEL = Object.fromEntries(GALLERY_FILTERS.map((f) => [f.value, f.label]));

/** Filterable masonry gallery with a full-screen lightbox (zoom, thumbnails, captions). */
export default function MasonryGallery({ items, limit, tone = 'dark', initialFilter = 'all', onFilterChange }) {
  const [filter, setFilter] = useState(initialFilter);
  const [index, setIndex] = useState(-1);

  const visible = useMemo(
    () => items.filter((item) => filter === 'all' || item.category === filter).slice(0, limit ?? items.length),
    [items, filter, limit],
  );

  const slides = useMemo(
    () =>
      visible.map((item) => ({
        src: unsplash(item.photo, { w: 2200, q: 80 }),
        srcSet: [960, 1600, 2200].map((w) => ({ src: unsplash(item.photo, { w, q: 80 }), width: w, height: Math.round(w / item.ratio) })),
        width: 2200,
        height: Math.round(2200 / item.ratio),
        alt: item.title,
        title: item.title,
        description: CATEGORY_LABEL[item.category],
      })),
    [visible],
  );

  const changeFilter = (value) => {
    setFilter(value);
    onFilterChange?.(value);
  };

  return (
    <div>
      <div role="group" aria-label="Filter gallery" className="mb-10 flex flex-wrap gap-2">
        {GALLERY_FILTERS.map((option) => {
          const count = option.value === 'all' ? items.length : items.filter((i) => i.category === option.value).length;
          const active = option.value === filter;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => changeFilter(option.value)}
              className={cn(
                'inline-flex h-10 items-center gap-2 rounded-full border px-5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition-all duration-500',
                active
                  ? 'border-transparent bg-gold-foil text-navy shadow-gold-glow'
                  : tone === 'dark'
                    ? 'border-white/20 text-ivory/80 hover:border-gold hover:text-gold'
                    : 'border-gold/30 hover:border-gold hover:text-gold-ink',
              )}
            >
              {option.label}
              <span className={cn('text-[0.6rem]', active ? 'text-navy/70' : 'opacity-60')}>{count}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.ul
          key={filter}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_LUXE } }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          className="columns-1 gap-5 sm:columns-2 lg:columns-3"
        >
          {visible.map((item, i) => (
            <li key={item.photo} className="mb-5 break-inside-avoid">
              <button
                type="button"
                onClick={() => setIndex(i)}
                data-cursor="View"
                aria-label={`Open “${item.title}” in full screen`}
                className="group relative block w-full overflow-hidden rounded-2xl"
              >
                <SmartImage
                  photo={item.photo}
                  alt={item.title}
                  ratio={item.ratio}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  widths={[480, 768, 1080]}
                  imgClassName="transition-transform [transition-duration:1400ms] ease-luxe group-hover:scale-[1.06]"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/0 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-left text-ivory">
                  <span>
                    <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-champagne">{CATEGORY_LABEL[item.category]}</span>
                    <span className="mt-1 block font-display text-xl leading-tight">{item.title}</span>
                  </span>
                  <span className="inline-flex size-9 shrink-0 translate-y-2 items-center justify-center rounded-full bg-ivory/90 text-navy opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <Expand className="size-4" aria-hidden />
                  </span>
                </span>
              </button>
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>

      {index >= 0 && (
        <Suspense fallback={null}>
          <GalleryLightbox slides={slides} index={index} onClose={() => setIndex(-1)} />
        </Suspense>
      )}
    </div>
  );
}
