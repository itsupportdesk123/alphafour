import { motion } from 'framer-motion';
import { SmartImage } from '@/components/common/SmartImage';
import { BorderBeam } from '@/components/effects/BorderBeam';
import { AMENITIES, AMENITY_SHOWCASE } from '@/data/amenities';
import { EASE_LUXE, viewportOnce } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Bento grid of signature amenities. Hovering a tile plays a slow cinematic
 * pan-and-zoom over the photograph (a lightweight "video preview").
 */
export function AmenitiesBento() {
  return (
    <ul className="grid auto-rows-[15rem] grid-cols-1 gap-4 sm:grid-cols-2 lg:auto-rows-[14.5rem] lg:grid-cols-4">
      {AMENITY_SHOWCASE.map((item, index) => {
        const Icon = AMENITIES[item.key]?.icon;
        return (
          <motion.li
            key={item.key}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.9, ease: EASE_LUXE, delay: (index % 4) * 0.08 }}
            className={cn('group relative overflow-hidden rounded-[1.75rem] border border-gold/20 bg-navy', item.span)}
          >
            <SmartImage
              photo={item.photo}
              alt={item.title}
              className="absolute inset-0 size-full"
              sizes="(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw"
              widths={[480, 768, 1200]}
              imgClassName="transition-transform [transition-duration:1800ms] ease-luxe group-hover:scale-110 group-hover:animate-kenburns"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent" />
            <div aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-champagne/15 to-transparent transition-transform [transition-duration:1400ms] ease-luxe group-hover:translate-x-full" />
            {index === 0 && <BorderBeam size={260} duration={10} />}
            <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
              {Icon && (
                <span className="glass-dark mb-4 inline-flex size-11 items-center justify-center rounded-full text-gold">
                  <Icon className="size-5" strokeWidth={1.5} aria-hidden />
                </span>
              )}
              <h3 className={cn('font-display leading-tight', index === 0 ? 'text-4xl' : 'text-2xl')}>{item.title}</h3>
              <p
                className={cn(
                  'mt-2 max-w-sm text-sm text-ivory/80 transition-all duration-700 ease-luxe',
                  index === 0 ? '' : 'lg:max-h-0 lg:translate-y-2 lg:opacity-0 lg:group-hover:max-h-24 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:max-h-24 lg:group-focus-within:opacity-100',
                )}
              >
                {item.description}
              </p>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}

/** Compact icon grid of every amenity a residence offers. */
export function AmenityList({ keys, className }) {
  return (
    <ul className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4', className)}>
      {keys.map((key) => {
        const amenity = AMENITIES[key];
        if (!amenity) return null;
        const Icon = amenity.icon;
        return (
          <li key={key} className="glass flex items-center gap-3 rounded-2xl px-4 py-3 text-sm">
            <Icon className="size-5 shrink-0 text-gold-ink dark:text-gold" strokeWidth={1.5} aria-hidden />
            {amenity.label}
          </li>
        );
      })}
    </ul>
  );
}
