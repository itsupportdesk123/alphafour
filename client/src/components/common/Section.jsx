import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeUp, stagger, viewportOnce } from '@/lib/motion';

export function Container({ as: Component = 'div', size = 'default', className, ...props }) {
  const widths = { default: 'max-w-7xl', wide: 'max-w-[1600px]', narrow: 'max-w-4xl' };
  return <Component className={cn('mx-auto w-full px-5 sm:px-6 lg:px-8', widths[size], className)} {...props} />;
}

const tones = {
  light: 'bg-background text-foreground',
  surface: 'bg-surface text-foreground',
  dark: 'bg-royal-night text-ivory',
  navy: 'bg-navy-depth text-ivory',
};

/**
 * Page section with the house rhythm. `tone="dark"` sections stay navy in both themes
 * and expose data-tone so children (eyebrows, glass) adapt.
 */
export function Section({ id, tone = 'light', className, containerClassName, size, bleed = false, children, ...props }) {
  const isDark = tone === 'dark' || tone === 'navy';
  return (
    <section
      id={id}
      data-tone={isDark ? 'dark' : 'light'}
      className={cn('relative scroll-mt-24 overflow-hidden section-pad', tones[tone], className)}
      {...props}
    >
      {bleed ? children : <Container size={size} className={containerClassName}>{children}</Container>}
    </section>
  );
}

export function Eyebrow({ children, className, withRule = true, tone }) {
  return (
    <p
      className={cn(
        'flex items-center gap-3 text-micro uppercase',
        tone === 'dark' ? 'text-gold' : 'text-eyebrow [[data-tone=dark]_&]:text-gold',
        className,
      )}
    >
      {withRule && <span aria-hidden className="h-px w-8 bg-current opacity-70" />}
      {children}
    </p>
  );
}

/** Eyebrow + display title + description, revealed on scroll. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  as: Heading = 'h2',
  actions,
  className,
  id,
}) {
  const centered = align === 'center';
  return (
    <motion.div
      variants={stagger(0.1)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className={cn(
        'mb-12 flex flex-col gap-6 md:mb-16',
        centered ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className={cn('max-w-3xl', centered && 'flex flex-col items-center')}>
        {eyebrow && (
          <motion.div variants={fadeUp}>
            <Eyebrow withRule={!centered}>{eyebrow}</Eyebrow>
          </motion.div>
        )}
        <motion.div variants={fadeUp}>
          <Heading id={id} className="mt-5 text-balance text-display-lg">
            {title}
          </Heading>
        </motion.div>
        {description && (
          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground [[data-tone=dark]_&]:text-ivory/75 sm:text-lg"
          >
            {description}
          </motion.p>
        )}
      </div>
      {actions && <motion.div variants={fadeUp} className="shrink-0">{actions}</motion.div>}
    </motion.div>
  );
}

export function GoldDivider({ variant = 'line', className }) {
  if (variant === 'ornament') {
    return (
      <div aria-hidden className={cn('flex items-center justify-center gap-3 text-gold', className)}>
        <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/70" />
        <svg width="10" height="10" viewBox="0 0 10 10" className="rotate-45">
          <rect width="10" height="10" fill="currentColor" />
        </svg>
        <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/70" />
      </div>
    );
  }
  return <div aria-hidden className={cn('hairline', className)} />;
}

export function GlassCard({ as: Component = 'div', variant = 'auto', interactive = false, className, ...props }) {
  const base = {
    auto: 'glass [[data-tone=dark]_&]:glass-dark',
    light: 'glass-light',
    dark: 'glass-dark',
  };
  return (
    <Component
      className={cn(
        'rounded-3xl',
        base[variant],
        interactive &&
          'transition-all duration-700 ease-luxe hover:-translate-y-1 hover:border-gold/45 hover:shadow-gold-glow',
        className,
      )}
      {...props}
    />
  );
}
