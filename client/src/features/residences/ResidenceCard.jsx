import useEmblaCarousel from 'embla-carousel-react';
import { Bath, BedDouble, Building2, ChevronLeft, ChevronRight, Heart, Maximize2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SmartImage } from '@/components/common/SmartImage';
import { TiltCard } from '@/components/effects/TiltCard';
import { Badge } from '@/components/ui/badge';
import { hasPrice, STATUS_META } from '@/data/residences';
import { useFavorites } from '@/hooks/useFavorites';
import { formatAreaRange, formatBhk, formatPriceRange } from '@/lib/format';
import { cn } from '@/lib/utils';

export function StatusBadge({ status, className }) {
  const meta = STATUS_META[status];
  return (
    <Badge variant={meta.variant} className={className}>
      {meta.label}
    </Badge>
  );
}

export function FavoriteButton({ slug, name, className }) {
  const { isFavorite, toggle } = useFavorites();
  const saved = isFavorite(slug);
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(slug);
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from saved projects` : `Save ${name}`}
      className={cn(
        'relative z-10 inline-flex size-10 items-center justify-center rounded-full border border-white/30 bg-navy/40 text-ivory backdrop-blur-md transition-all duration-500 hover:scale-105 hover:border-gold',
        saved && 'border-gold bg-gold text-navy',
        className,
      )}
    >
      <Heart className={cn('size-4', saved && 'fill-current')} aria-hidden />
    </button>
  );
}

/** Swipeable photo slider inside a card (Embla). */
export function CardSlider({ images, alt, ratio = 4 / 3, sizes, priority = false }) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, duration: 26 });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!embla) return undefined;
    const onSelect = () => setIndex(embla.selectedScrollSnap());
    embla.on('select', onSelect);
    return () => embla.off('select', onSelect);
  }, [embla]);

  const go = useCallback(
    (direction) => (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (direction < 0) embla?.scrollPrev();
      else embla?.scrollNext();
    },
    [embla],
  );

  return (
    <div className="group/slider relative" role="region" aria-roledescription="carousel" aria-label={`${alt} photos`}>
      <div ref={emblaRef} className="overflow-hidden" data-cursor="Drag">
        <div className="flex touch-pan-y">
          {images.map((photo, i) => (
            <div key={photo} className="min-w-0 flex-[0_0_100%]" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${images.length}`}>
              <SmartImage
                photo={photo}
                alt={`${alt}, view ${i + 1}`}
                ratio={ratio}
                sizes={sizes ?? '(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw'}
                widths={[480, 720, 1080]}
                priority={priority && i === 0}
                imgClassName="transition-transform [transition-duration:1600ms] ease-luxe group-hover:scale-[1.04]"
              />
            </div>
          ))}
        </div>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-navy/20" />
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={go(-1)}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 z-10 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/85 text-navy opacity-0 shadow-luxe transition-opacity duration-300 focus-visible:opacity-100 group-hover/slider:opacity-100"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={go(1)}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 z-10 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/85 text-navy opacity-0 shadow-luxe transition-opacity duration-300 focus-visible:opacity-100 group-hover/slider:opacity-100"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
          <div className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2">
            {images.map((photo, i) => (
              // 24px hit area (WCAG 2.5.8) around a small pill
              <button
                key={photo}
                type="button"
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  embla?.scrollTo(i);
                }}
                className="inline-flex h-6 min-w-6 items-center justify-center px-0.5"
              >
                <span aria-hidden className={cn('h-1.5 rounded-full transition-all duration-500', i === index ? 'w-6 bg-gold' : 'w-1.5 bg-ivory/70')} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Glass residence card with hover tilt, photo slider, badges, price and key specs. */
export function ResidenceCard({ residence, priority = false, layout = 'grid' }) {
  const href = `/residences/${residence.slug}`;
  const list = layout === 'list';
  const priced = hasPrice(residence);

  return (
    <TiltCard maxTilt={list ? 3 : 6} className="group h-full rounded-[1.75rem]">
      <article
        className={cn(
          'relative flex h-full overflow-hidden rounded-[1.75rem] border border-gold/20 bg-card text-card-foreground shadow-luxe transition-[box-shadow,border-color] duration-700 group-hover:border-gold/45 group-hover:shadow-gold-glow',
          list ? 'flex-col md:flex-row' : 'flex-col',
          residence.status === 'sold-out' && '[&_img]:saturate-[.6]',
        )}
      >
        <div className={cn('relative', list && 'md:w-[44%] md:shrink-0')}>
          <CardSlider images={residence.images.slice(0, 4)} alt={residence.name} priority={priority} />
          <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
            <StatusBadge status={residence.status} />
            {residence.flagship && <Badge variant="glass">Flagship</Badge>}
          </div>
          <FavoriteButton slug={residence.slug} name={residence.name} className="absolute right-4 top-4" />
          <div className="glass-dark absolute inset-x-4 bottom-4 z-[5] flex items-center justify-between rounded-2xl px-4 py-3 text-ivory">
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-champagne">{priced ? 'Starting' : 'Price'}</span>
            <span className="font-display text-xl">{priced ? formatPriceRange(residence.price, residence.priceMax).replace(' onwards', '') : 'On request'}</span>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {residence.locality}, {residence.city} · {residence.type}
          </p>
          <h3 className="mt-2 font-display text-[1.9rem] leading-tight">
            <Link to={href} className="outline-none after:absolute after:inset-0 after:rounded-[1.75rem] after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-gold">
              {residence.name}
            </Link>
          </h3>
          <p className="mb-5 mt-2 line-clamp-2 text-sm text-muted-foreground">{residence.tagline}</p>
          {/* Wraps rather than using fixed columns: an area range like "3,800 – 4,600 sq.ft" is wider than a third of a card. */}
          <dl className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-gold/15 pt-5 text-sm">
            {residence.bedrooms.length > 0 ? (
              <>
                <div>
                  <dt className="sr-only">Bedrooms</dt>
                  <dd className="flex items-center gap-2">
                    <BedDouble className="size-4 text-gold-ink dark:text-gold" aria-hidden />
                    {formatBhk(residence.bedrooms)}
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">Bathrooms</dt>
                  <dd className="flex items-center gap-2">
                    <Bath className="size-4 text-gold-ink dark:text-gold" aria-hidden />
                    {residence.bathrooms} baths
                  </dd>
                </div>
              </>
            ) : (
              <div>
                <dt className="sr-only">Suited to</dt>
                <dd className="flex items-center gap-2">
                  <Building2 className="size-4 shrink-0 text-gold-ink dark:text-gold" aria-hidden />
                  {residence.use}
                </dd>
              </div>
            )}
            <div>
              <dt className="sr-only">Area</dt>
              <dd className="flex items-center gap-2 whitespace-nowrap">
                <Maximize2 className="size-4 shrink-0 text-gold-ink dark:text-gold" aria-hidden />
                {formatAreaRange(residence.area[0], residence.area[1]).replace(' sq.ft', '')}
                <span className="text-xs text-muted-foreground">sq.ft</span>
              </dd>
            </div>
          </dl>
        </div>
      </article>
    </TiltCard>
  );
}
