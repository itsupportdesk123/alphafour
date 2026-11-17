import { ArrowUpRight, Award } from 'lucide-react';
import { lazy, useState } from 'react';
import { Link } from 'react-router-dom';
import { LazyMount } from '@/components/common/LazyMount';
import { Reveal } from '@/components/common/Reveal';
import { Container, Eyebrow, Section, SectionHeading } from '@/components/common/Section';
import { Marquee } from '@/components/effects/Marquee';
import { BeamLines, Spotlight } from '@/components/effects/Spotlight';
import { SiteVisitForm } from '@/components/forms/LeadForms';
import { Button } from '@/components/ui/button';
import { GALLERY } from '@/data/gallery';
import { CHENNAI_FACTS, GROUP_COMPANIES } from '@/data/group';
import { FLAGSHIP_LANDMARKS, LANDMARK_ICONS } from '@/data/landmarks';
import { FLAGSHIP } from '@/data/residences';
import { TESTIMONIALS } from '@/data/testimonials';
import { AmenitiesBento } from '@/features/amenities/AmenitiesBento';
import MasonryGallery from '@/features/gallery/MasonryGallery';
import { EmiCalculator } from '@/features/emi/EmiCalculator';
import { FloorPlans } from '@/features/floorplans/FloorPlans';
import { TestimonialsCarousel, TestimonialsMarquee } from '@/features/testimonials/Testimonials';
import { cn } from '@/lib/utils';

const LocationMap = lazy(() => import('@/features/map/LocationMap'));

export function AmenitiesSection() {
  return (
    <Section id="amenities" tone="light">
      <SectionHeading
        eyebrow="Amenities"
        title={
          <>
            Resort-grade living, <em className="italic text-gold-ink dark:text-gold">sixty storeys up</em>
          </>
        }
        description="Over 60,000 sq.ft of amenities across the podium deck and the summit: hover a tile to step inside."
      />
      <AmenitiesBento />
    </Section>
  );
}

export function FloorPlansSection() {
  return (
    <Section id="floor-plans" tone="surface">
      <SectionHeading
        eyebrow="Floor plans"
        title={
          <>
            Considered to the <em className="italic text-gold-ink dark:text-gold">last inch</em>
          </>
        }
        description="Every layout puts the living room on the sea. Zoom into a plan, compare areas, then request the full brochure."
      />
      <FloorPlans />
    </Section>
  );
}

export function GallerySection() {
  return (
    <Section id="gallery" tone="navy">
      <SectionHeading
        eyebrow="Gallery"
        title={
          <>
            Light, stone and <em className="italic text-gold">silence</em>
          </>
        }
        description="A glimpse of the residences, the amenities and the views that come with them."
        actions={
          <Button asChild variant="outline-light">
            <Link to="/gallery">
              Full gallery <ArrowUpRight aria-hidden />
            </Link>
          </Button>
        }
      />
      <MasonryGallery items={GALLERY} limit={12} />
    </Section>
  );
}

export function LocationSection() {
  const [active, setActive] = useState(null);
  return (
    <Section id="location" tone="light">
      <SectionHeading
        eyebrow="Location advantages"
        title={
          <>
            The heart of Chennai, <em className="italic text-gold-ink dark:text-gold">at your door</em>
          </>
        }
        description="Perungudi sits at the head of Chennai’s IT corridor on the OMR, minutes from the World Trade Center, the MRTS, the East Coast Road and the beaches of Besant Nagar."
      />
      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <ul className="space-y-2">
          {FLAGSHIP_LANDMARKS.map((landmark) => {
            const Icon = LANDMARK_ICONS[landmark.category] ?? Award;
            const isActive = active === landmark.name;
            return (
              <li key={landmark.name}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(landmark.name)}
                  onFocus={() => setActive(landmark.name)}
                  onClick={() => setActive(landmark.name)}
                  aria-pressed={isActive}
                  className={cn(
                    'flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-all duration-500',
                    isActive ? 'border-gold/60 bg-gold/10 shadow-gold-glow' : 'border-transparent hover:border-gold/30 hover:bg-surface',
                  )}
                >
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-navy text-gold">
                    <Icon className="size-4" strokeWidth={1.5} aria-hidden />
                  </span>
                  <span className="flex-1 text-sm font-medium">{landmark.name}</span>
                  <span className="text-right">
                    <span className="block font-display text-xl leading-none">{landmark.distance}</span>
                    <span className="text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">{landmark.time}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <LazyMount minHeight="34rem" className="overflow-hidden rounded-[2rem] border border-gold/25 shadow-luxe">
          <LocationMap
            center={FLAGSHIP.coordinates}
            label={FLAGSHIP.name}
            pin={false}
            landmarks={FLAGSHIP_LANDMARKS}
            active={active}
            onSelect={setActive}
            className="h-[34rem] lg:h-full lg:min-h-[34rem]"
          />
        </LazyMount>
      </div>
    </Section>
  );
}

export function TestimonialsSection() {
  return (
    <Section id="testimonials" tone="dark" bleed>
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <SectionHeading
          align="center"
          eyebrow="In their words"
          title={
            <>
              Homeowners who found <em className="italic text-gold">their horizon</em>
            </>
          }
          description="Families, investors and NRIs on what it is like to live with Alphafour Infrastructure Pvt Ltd."
        />
      </div>
      <TestimonialsCarousel testimonials={TESTIMONIALS} />
      <div className="mt-14">
        <TestimonialsMarquee testimonials={[...TESTIMONIALS].reverse()} reverse />
      </div>
    </Section>
  );
}

export function EmiSection() {
  return (
    <Section id="emi" tone="surface">
      <SectionHeading
        eyebrow="EMI calculator"
        title={
          <>
            Plan your purchase with <em className="italic text-gold-ink dark:text-gold">clarity</em>
          </>
        }
        description="Adjust the price, down payment, rate and tenure to see your monthly instalment. Preferential rates are available through our banking partners."
      />
      <EmiCalculator />
    </Section>
  );
}

/** Banner under the EMI calculator (and at the foot of the About page): Alphafour in Chennai, then the group companies. */
export function GroupSection() {
  return (
    <section aria-labelledby="group-heading" className="overflow-hidden border-y border-gold/15 bg-background py-14 md:py-16">
      <Container className="mb-10 flex flex-col items-center text-center md:mb-12">
        <Eyebrow>The Alphafour group</Eyebrow>
        <h2 id="group-heading" className="mt-4 text-balance font-display text-3xl leading-tight sm:text-4xl">
          Rooted in Chennai, <em className="italic text-gold-ink dark:text-gold">backed by our group companies</em>
        </h2>
        <p className="mt-4 max-w-2xl text-pretty text-muted-foreground">
          Alphafour builds across Chennai, and our group companies work in power cooling and cooling-plant service, robotics and automation,
          and food processing. Select a company to visit its website.
        </p>
      </Container>
      <Marquee duration="55s" className="mask-fade-x" gap="3.5rem" role="group" aria-label="Alphafour in Chennai">
        {CHENNAI_FACTS.map(({ icon: Icon, value, note }) => (
          <div key={value} className="flex shrink-0 items-center gap-4">
            <Icon className="size-7 shrink-0 text-gold-ink dark:text-gold" strokeWidth={1.25} aria-hidden />
            <div className="leading-tight">
              <p className="font-display text-2xl">{value}</p>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{note}</p>
            </div>
          </div>
        ))}
      </Marquee>
      {/* py-1 leaves room for the focus ring, which the row would otherwise clip. */}
      <Marquee reverse duration="45s" className="mask-fade-x mt-7 py-1 md:mt-9" gap="3.5rem" role="group" aria-label="Our group companies">
        {({ hidden }) =>
          GROUP_COMPANIES.map(({ logo, name, sector, href }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={hidden ? -1 : undefined}
              className="group/co flex shrink-0 flex-col items-start gap-3 rounded-3xl p-1 pr-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:flex-row sm:items-center sm:gap-4"
            >
              {/* The company's own logo on a white tile, so every logo keeps its colours in both themes. The name beside it labels the link. */}
              <span className="flex h-12 w-24 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 ring-1 ring-gold/30 transition-[box-shadow] duration-500 group-hover/co:shadow-gold-glow group-hover/co:ring-gold/70 sm:h-14 sm:w-28 sm:p-2">
                {/* Not lazy: the row clips its copies, so lazy logos would only load as they scroll in and pop up blank. The five files total about 37 KB. */}
                <img src={logo.src} alt="" width={logo.width} height={logo.height} fetchpriority="low" decoding="async" className="h-auto max-h-full w-auto max-w-full object-contain" />
              </span>
              {/* On phones the name sits under the logo and wraps, so the longest still fits on screen; one line beside it from sm up. */}
              <span className="block max-w-[13rem] leading-tight sm:max-w-none">
                <span className="block font-display text-lg sm:text-xl">
                  <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 ease-luxe [box-decoration-break:clone] group-hover/co:bg-[length:100%_1px]">
                    {name}
                  </span>
                  <ArrowUpRight
                    className="ml-1.5 inline-block size-4 align-[-0.1em] text-gold-ink transition-transform duration-500 ease-luxe group-hover/co:-translate-y-0.5 group-hover/co:translate-x-0.5 dark:text-gold"
                    aria-hidden
                  />
                </span>
                <span className="mt-0.5 block text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{sector}</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </span>
            </a>
          ))
        }
      </Marquee>
    </section>
  );
}

export function SiteVisitSection() {
  return (
    <Section id="site-visit" tone="dark">
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" />
      <BeamLines className="opacity-50" />
      <div className="relative grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <p className="flex items-center gap-3 text-micro uppercase text-gold">
            <span className="h-px w-8 bg-gold/80" /> Private viewing
          </p>
          <h2 className="mt-6 text-balance text-display-lg">
            See the light for yourself. <em className="italic text-gold-foil">Schedule a site visit.</em>
          </h2>
          <p className="mt-6 max-w-lg text-lg text-ivory/75">
            Choose a date and time. Your advisor will confirm by phone, arrange valet on arrival and walk you through the show residence,
            the amenity deck and the summit.
          </p>
          <ul className="mt-8 space-y-3 text-ivory/80">
            {['Viewings every day, 10 am – 6 pm', 'Complimentary chauffeur pickup in Chennai', 'Private NRI video walkthroughs on request'].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span aria-hidden className="size-1.5 rotate-45 bg-gold" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="glass-dark relative rounded-[2rem] p-6 sm:p-9">
            <SiteVisitForm tone="dark" source="home/site-visit" />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
