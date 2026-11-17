import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Eyebrow, GoldDivider, Section } from '@/components/common/Section';
import { Parallax, Reveal, SplitReveal } from '@/components/common/Reveal';
import { SmartImage } from '@/components/common/SmartImage';
import { site } from '@/config/site';
import { DIRECTORS } from '@/data/team';
import { PHOTOS } from '@/lib/media';

const [founder] = DIRECTORS;

/** Brand story: split-text reveal with a three-image parallax stack. */
export function IntroSection() {
  return (
    <Section id="story" tone="light" className="bg-cream-glow dark:bg-none">
      <div className="grid items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Reveal>
            <Eyebrow>The {site.name} story</Eyebrow>
          </Reveal>
          <SplitReveal
            as="h2"
            className="mt-6 text-balance text-display-lg"
            text="A quiet obsession with the art of living well."
          />
          <Reveal delay={0.15}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Welcome to {site.name}, where we redefine construction experiences with innovation, integrity, and excellence. Our company is
              committed to transforming the way people buy, sell, rent, and invest in properties, offering personalized services and
              cutting-edge solutions tailored to meet our clients’ diverse needs.
            </p>
            <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
              Our primary focus is on delivering top-notch construction services for buildings, commercial spaces, and infrastructure projects,
              aiming to establish new standards for quality, innovation, and client satisfaction on a global scale.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <GoldDivider variant="ornament" className="mt-10 justify-start" />
            <div className="mt-10 flex flex-wrap items-center gap-8">
              <div>
                <p className="font-display text-4xl italic text-gold-ink dark:text-gold">{founder.name}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{founder.position}</p>
              </div>
              <Link to="/about" className="link-luxe text-sm font-semibold uppercase tracking-[0.18em] text-gold-ink dark:text-gold">
                Our story <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="relative h-[32rem] sm:h-[38rem] lg:col-span-6">
          <Parallax speed={0.08} className="absolute right-0 top-0 w-[68%]">
            <SmartImage photo={PHOTOS.livingDarkGallery} alt="Living room with deep green walls and gallery art" ratio={3 / 4} className="rounded-[2rem] shadow-luxe" sizes="(min-width: 1024px) 34vw, 70vw" />
          </Parallax>
          <Parallax speed={-0.12} className="absolute bottom-0 left-0 w-[52%]">
            <SmartImage photo={PHOTOS.kitchenOak} alt="Kitchen in white and oak" ratio={4 / 5} className="rounded-[2rem] border-4 border-ivory shadow-luxe dark:border-navy" sizes="(min-width: 1024px) 26vw, 52vw" />
          </Parallax>
          <Parallax speed={0.18} className="absolute bottom-10 right-6 w-[34%]">
            <SmartImage photo={PHOTOS.bathStoneTub} alt="Freestanding stone bath among plants" ratio={1} className="rounded-3xl border-4 border-ivory shadow-luxe dark:border-navy" sizes="(min-width: 1024px) 17vw, 34vw" />
          </Parallax>
          <div className="glass absolute left-[38%] top-[6%] z-10 rounded-2xl px-5 py-4 shadow-luxe">
            <p className="font-display text-4xl leading-none text-gold-ink dark:text-gold">25+</p>
            <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Years of leadership experience</p>
          </div>
        </div>
      </div>
    </Section>
  );
}
