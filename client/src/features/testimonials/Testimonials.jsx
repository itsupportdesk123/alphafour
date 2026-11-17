import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Pause, Play, Quote } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StarRating } from '@/components/common/StarRating';
import { Marquee } from '@/components/effects/Marquee';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { unsplash } from '@/lib/media';
import { cn } from '@/lib/utils';

const TWEEN = 0.42;

/**
 * 3D coverflow testimonials carousel (Embla): drag, arrows, dots, autoplay that pauses on
 * hover / focus, and a visible pause control. Reduced motion disables autoplay.
 */
export function TestimonialsCarousel({ testimonials }) {
  const reduced = useReducedMotion();
  const autoplay = useRef(Autoplay({ delay: 6500, stopOnInteraction: false, stopOnMouseEnter: true, stopOnFocusIn: true }));
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: 'center', skipSnaps: false, duration: 32 }, reduced ? [] : [autoplay.current]);
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(!reduced);
  const slideNodes = useRef([]);

  const tween = useCallback((api) => {
    const progress = api.scrollProgress();
    const snaps = api.scrollSnapList();
    const engine = api.internalEngine();
    snaps.forEach((snap, index) => {
      let diff = snap - progress;
      if (engine.options.loop) {
        engine.slideLooper.loopPoints.forEach((point) => {
          const target = point.target();
          if (index === point.index && target !== 0) {
            const sign = Math.sign(target);
            if (sign === -1) diff = snap - (1 + progress);
            if (sign === 1) diff = snap + (1 - progress);
          }
        });
      }
      const node = slideNodes.current[index];
      if (!node) return;
      const t = Math.min(1, Math.abs(diff * snaps.length) * TWEEN);
      const scale = 1 - t * 0.14;
      const rotate = Math.max(-1, Math.min(1, diff * snaps.length)) * -14;
      node.style.transform = `perspective(1400px) rotateY(${rotate}deg) scale(${scale})`;
      node.style.opacity = String(1 - t * 0.55);
    });
  }, []);

  useEffect(() => {
    if (!embla) return undefined;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    onSelect();
    tween(embla);
    embla.on('select', onSelect).on('scroll', tween).on('reInit', tween);
    return () => {
      embla.off('select', onSelect).off('scroll', tween).off('reInit', tween);
    };
  }, [embla, tween]);

  const togglePlay = () => {
    const plugin = embla?.plugins()?.autoplay;
    if (!plugin) return;
    if (plugin.isPlaying()) {
      plugin.stop();
      setPlaying(false);
    } else {
      plugin.play();
      setPlaying(true);
    }
  };

  return (
    <div role="region" aria-roledescription="carousel" aria-label="Homeowner testimonials" className="relative">
      <div ref={emblaRef} className="overflow-hidden py-6" data-cursor="Drag">
        <div className="flex touch-pan-y">
          {testimonials.map((item, index) => (
            <div
              key={item.name}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${testimonials.length}`}
              className="min-w-0 flex-[0_0_88%] px-2 sm:flex-[0_0_72%] lg:flex-[0_0_56%]"
            >
              <figure
                ref={(node) => {
                  slideNodes.current[index] = node;
                }}
                className="glass-dark relative flex h-full flex-col gap-6 rounded-[2rem] p-7 text-ivory will-change-transform sm:flex-row sm:items-center sm:p-10"
              >
                <Quote className="absolute right-7 top-7 size-10 text-gold/30" aria-hidden />
                <img
                  src={unsplash(item.portrait, { w: 240, h: 240, crop: 'faces', q: 75 })}
                  alt={item.name}
                  loading="lazy"
                  width={120}
                  height={120}
                  className="size-24 shrink-0 rounded-full border-2 border-gold/60 object-cover shadow-gold-glow sm:size-32"
                />
                <div>
                  <StarRating value={item.rating} size="md" />
                  <blockquote className="mt-4 font-display text-[1.45rem] font-light italic leading-snug sm:text-[1.7rem]">
                    “{item.quote}”
                  </blockquote>
                  <figcaption className="mt-5 text-sm">
                    <span className="font-semibold text-ivory">{item.name}</span>
                    <span className="block text-champagne/90">
                      {item.role} · {item.residence}
                    </span>
                  </figcaption>
                </div>
              </figure>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <button type="button" onClick={() => embla?.scrollPrev()} aria-label="Previous testimonial" className="inline-flex size-12 items-center justify-center rounded-full border border-gold/40 text-ivory transition-colors hover:bg-gold hover:text-navy">
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <div className="flex items-center">
          {testimonials.map((item, i) => (
            // 24px hit area (WCAG 2.5.8) around a small pill
            <button
              key={item.name}
              type="button"
              onClick={() => embla?.scrollTo(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              aria-current={i === selected}
              className="group inline-flex h-6 min-w-6 items-center justify-center px-1"
            >
              <span
                aria-hidden
                className={cn('h-2 rounded-full transition-all duration-500', i === selected ? 'w-8 bg-gold' : 'w-2 bg-ivory/35 group-hover:bg-ivory/70')}
              />
            </button>
          ))}
        </div>
        <button type="button" onClick={() => embla?.scrollNext()} aria-label="Next testimonial" className="inline-flex size-12 items-center justify-center rounded-full border border-gold/40 text-ivory transition-colors hover:bg-gold hover:text-navy">
          <ChevronRight className="size-5" aria-hidden />
        </button>
        {!reduced && (
          <button type="button" onClick={togglePlay} aria-label={playing ? 'Pause autoplay' : 'Resume autoplay'} className="inline-flex size-12 items-center justify-center rounded-full border border-white/15 text-ivory/80 transition-colors hover:border-gold hover:text-gold">
            {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
          </button>
        )}
      </div>
    </div>
  );
}

/** Infinite second row of short quotes. */
export function TestimonialsMarquee({ testimonials, reverse = false }) {
  return (
    <Marquee reverse={reverse} duration="55s" className="mask-fade-x py-2" aria-label="More homeowner reviews">
      {testimonials.map((item) => (
        <figure key={item.name} className="glass-dark flex w-[22rem] shrink-0 items-start gap-4 rounded-2xl p-5 text-ivory">
          <img src={unsplash(item.portrait, { w: 96, h: 96, crop: 'faces', q: 70 })} alt="" loading="lazy" width={48} height={48} className="size-12 rounded-full border border-gold/50 object-cover" />
          <div>
            <StarRating value={item.rating} />
            <blockquote className="mt-2 line-clamp-3 text-sm text-ivory/80">“{item.quote}”</blockquote>
            <figcaption className="mt-2 text-xs font-semibold text-champagne">{item.name}</figcaption>
          </div>
        </figure>
      ))}
    </Marquee>
  );
}
