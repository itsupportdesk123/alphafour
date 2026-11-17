import { Section } from '@/components/common/Section';
import { Reveal } from '@/components/common/Reveal';
import { NumberTicker } from '@/components/effects/NumberTicker';
import { Particles } from '@/components/effects/Particles';
import { BeamLines } from '@/components/effects/Spotlight';
import { STATS } from '@/data/stats';

/** Animated achievement counters on a royal-night background with gold dust. */
export function StatsSection() {
  return (
    <Section id="stats" tone="dark" className="py-20 md:py-24">
      <Particles quantity={50} />
      <BeamLines className="opacity-60" />
      <h2 className="sr-only">Alphafour Infrastructure Pvt Ltd in numbers</h2>
      <dl className="relative grid grid-cols-2 gap-y-12 lg:grid-cols-4">
        {STATS.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 0.1} className="flex flex-col items-center px-4 text-center lg:border-l lg:border-gold/20 lg:first:border-l-0">
            <dd className="font-display text-[clamp(3rem,6vw,5.2rem)] font-light leading-none text-gold-foil">
              <NumberTicker value={stat.value} decimals={stat.decimals ?? 0} suffix={stat.suffix} />
            </dd>
            <dt className="mt-4 max-w-[12rem] text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-ivory/75">{stat.label}</dt>
          </Reveal>
        ))}
      </dl>
    </Section>
  );
}
