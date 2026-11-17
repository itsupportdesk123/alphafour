import { Bath, BedDouble, CalendarClock, Check, Landmark as LandmarkIcon, MapPin, Maximize2, Rotate3d, Share2, ShieldCheck } from 'lucide-react';
import { lazy, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { LazyMount } from '@/components/common/LazyMount';
import { Reveal } from '@/components/common/Reveal';
import { Container, Eyebrow, GoldDivider } from '@/components/common/Section';
import { Seo } from '@/components/common/Seo';
import { Button } from '@/components/ui/button';
import { FEATURES, site } from '@/config/site';
import { AREA_LANDMARKS, LANDMARK_ICONS } from '@/data/landmarks';
import { buildPriceBreakdown, getResidence, hasPrice, RESIDENCES, STATUS_META } from '@/data/residences';
import { TOUR_SCENES } from '@/data/tour';
import { AmenityList } from '@/features/amenities/AmenitiesBento';
import { EmiCalculator } from '@/features/emi/EmiCalculator';
import { FloorPlans, PlanDrawings } from '@/features/floorplans/FloorPlans';
import { BrochureDialog, PhotoMosaic, PriceBreakdown } from '@/features/residences/DetailParts';
import { FavoriteButton, ResidenceCard, StatusBadge } from '@/features/residences/ResidenceCard';
import { formatArea, formatAreaRange, formatBhk, formatINR, formatPossession, formatPriceRange } from '@/lib/format';
import { unsplash } from '@/lib/media';
import { cn } from '@/lib/utils';
import NotFoundPage from '@/pages/NotFoundPage';
import { useUiStore } from '@/store/ui';

const PanoramaViewer = lazy(() => import('@/features/tour/PanoramaViewer'));
const LocationMap = lazy(() => import('@/features/map/LocationMap'));

function DetailSection({ id, eyebrow, title, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-40 border-t border-gold/15 py-14 first:border-t-0 first:pt-0">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={`${id}-title`} className="mt-4 text-display-md">
        {title}
      </h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default function ResidenceDetailPage() {
  const { slug } = useParams();
  const residence = getResidence(slug);
  const openDialog = useUiStore((s) => s.openDialog);
  const [brochureOpen, setBrochureOpen] = useState(false);
  const [tourStarted, setTourStarted] = useState(false);
  const [activeLandmark, setActiveLandmark] = useState(null);

  const scenes = useMemo(() => {
    if (!residence) return [];
    const ids = new Set(residence.panoramas);
    return TOUR_SCENES.filter((s) => ids.has(s.id)).map((s) => ({ ...s, links: s.links.filter((l) => ids.has(l.to)) }));
  }, [residence]);

  if (!residence) return <NotFoundPage />;

  const landmarks = AREA_LANDMARKS[residence.nearby] ?? [];
  const similar = RESIDENCES.filter((r) => r.slug !== residence.slug && (r.city === residence.city || r.type === residence.type)).slice(0, 3);
  const priced = hasPrice(residence);
  const commercial = residence.bedrooms.length === 0;
  const drawings = residence.planDrawings ?? [];
  const showPlans = drawings.length > 0 || (FEATURES.floorPlans && residence.floorPlans.length > 0);
  const breakdown = priced ? buildPriceBreakdown(residence) : [];
  const url = `${site.url}/residences/${residence.slug}`;
  const absolute = (src) => (src.startsWith('http') ? src : `${site.url}${src}`);

  const sections = [
    { id: 'overview', label: 'Overview' },
    ...(residence.sections ?? []),
    scenes.length > 0 && { id: 'tour', label: '360° Tour' },
    showPlans && { id: 'plans', label: 'Floor plans' },
    { id: 'amenities', label: 'Amenities' },
    priced && { id: 'pricing', label: 'Pricing' },
    { id: 'location', label: 'Location' },
  ].filter(Boolean);

  const seoDescription = priced
    ? `${residence.tagline}. ${formatBhk(residence.bedrooms)} in ${residence.locality}, ${residence.city} from ${formatINR(residence.price)}.`
    : `${residence.tagline}. ${formatArea(residence.area[0])} ${residence.type.toLowerCase()} development in ${residence.locality}, ${residence.city}.`;

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: residence.name, text: residence.tagline, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied', { description: 'Share it with family or your advisor.' });
      }
    } catch {
      /* share sheet dismissed */
    }
  };

  const listingSchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: residence.name,
    description: residence.description.split('\n')[0],
    url,
    image: residence.images.slice(0, 3).map((id) => absolute(unsplash(id, { w: 1200 }))),
    datePosted: '2026-01-15',
    ...(priced && {
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'INR',
        lowPrice: residence.price,
        highPrice: residence.priceMax ?? residence.price,
        availability: residence.status === 'sold-out' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      },
    }),
    about: {
      '@type': commercial ? 'Place' : 'Residence',
      name: residence.name,
      address: { '@type': 'PostalAddress', streetAddress: residence.address, addressLocality: residence.city, addressCountry: 'IN' },
      geo: { '@type': 'GeoCoordinates', latitude: residence.coordinates[0], longitude: residence.coordinates[1] },
    },
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
      { '@type': 'ListItem', position: 2, name: 'Projects', item: `${site.url}/residences` },
      { '@type': 'ListItem', position: 3, name: residence.name, item: url },
    ],
  };

  const facts = [
    !commercial && { icon: BedDouble, label: 'Configurations', value: formatBhk(residence.bedrooms) },
    !commercial && { icon: Bath, label: 'Bathrooms', value: `${residence.bathrooms}+` },
    { icon: Maximize2, label: residence.areaLabel ?? 'Carpet area', value: formatAreaRange(residence.area[0], residence.area[1]) },
    // No announced date: say where the project stands, because formatPossession reads "no date" as ready to move.
    residence.possession === null
      ? { icon: CalendarClock, label: 'Status', value: STATUS_META[residence.status].label }
      : { icon: CalendarClock, label: 'Possession', value: formatPossession(residence.possession) },
    residence.rera && { icon: ShieldCheck, label: 'RERA', value: residence.rera },
    { icon: LandmarkIcon, label: 'Type', value: residence.type },
  ].filter(Boolean);

  return (
    <>
      <Seo title={residence.name} description={seoDescription} path={`/residences/${residence.slug}`} image={unsplash(residence.images[0], { w: 1200, h: 630 })} jsonLd={[listingSchema, breadcrumbSchema]} />

      <div data-nav-dark className="bg-royal-night pb-12 pt-28 text-ivory" data-tone="dark">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ivory/70">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link to="/" className="hover:text-gold">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link to="/residences" className="hover:text-gold">
                  Projects
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-ivory">
                {residence.name}
              </li>
            </ol>
          </nav>
          <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={residence.status} />
                {residence.flagship && <span className="rounded-full border border-gold/50 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-gold">Flagship</span>}
              </div>
              <h1 className="mt-4 text-display-xl">{residence.name}</h1>
              <p className="mt-3 flex items-center gap-2 text-ivory/75">
                <MapPin className="size-4 text-gold" aria-hidden /> {residence.address}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <FavoriteButton slug={residence.slug} name={residence.name} />
              <button type="button" onClick={share} aria-label="Share this project" className="inline-flex size-10 items-center justify-center rounded-full border border-white/30 bg-navy/40 backdrop-blur-md transition-colors hover:border-gold">
                <Share2 className="size-4" aria-hidden />
              </button>
              <div className="text-right">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-champagne">{priced ? 'From' : 'Price'}</p>
                <p className="font-display text-3xl">{priced ? formatPriceRange(residence.price, residence.priceMax) : 'On request'}</p>
              </div>
            </div>
          </div>
          <PhotoMosaic residence={residence} />
        </Container>
      </div>

      <nav aria-label="On this page" className="sticky top-20 z-30 border-b border-gold/15 bg-background/85 backdrop-blur-xl">
        <Container className="no-scrollbar flex gap-1 overflow-x-auto py-2">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="shrink-0 rounded-full px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-gold/10 hover:text-gold-ink dark:hover:text-gold">
              {s.label}
            </a>
          ))}
        </Container>
      </nav>

      {/* The extra right padding keeps prices clear of the floating call and WhatsApp buttons until the page margin does. */}
      <Container className="py-14 lg:pr-24 min-[1360px]:pr-8">
        <DetailSection id="overview" eyebrow={residence.tagline} title="Overview">
          <dl className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="glass rounded-2xl p-4">
                <dt className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <Icon className="size-3.5 text-gold-ink dark:text-gold" aria-hidden /> {label}
                </dt>
                <dd className="mt-2 font-display text-xl leading-tight">{value}</dd>
              </div>
            ))}
          </dl>
          {residence.description.split('\n\n').map((p) => (
            <p key={p.slice(0, 20)} className="mb-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {residence.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-gold-foil text-navy">
                  <Check className="size-3.5" aria-hidden />
                </span>
                {h}
              </li>
            ))}
          </ul>
          {residence.idealFor && (
            <div className="mt-10">
              <h3 className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Ideal for</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {residence.idealFor.map((use) => (
                  <li key={use} className="rounded-full border border-gold/30 px-4 py-2 text-sm">
                    {use}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {residence.configurations.length > 0 && (
            <div className="mt-10 overflow-hidden rounded-[1.5rem] border border-gold/20">
              <table className="w-full text-sm">
                <caption className="sr-only">Configurations and prices</caption>
                <thead className="bg-surface text-left text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">Configuration</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Carpet area</th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">Price from</th>
                  </tr>
                </thead>
                <tbody>
                  {residence.configurations.map((c) => (
                    <tr key={c.label} className="border-t border-gold/10">
                      <th scope="row" className="px-5 py-3.5 text-left font-medium">{c.label}</th>
                      <td className="px-5 py-3.5 text-muted-foreground">{formatArea(c.area)}</td>
                      <td className="px-5 py-3.5 text-right font-display text-lg">{formatINR(c.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
            {residence.specs.map((s) => (
              <div key={s.label}>
                <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{s.label}</dt>
                <dd className="mt-1 font-medium">{s.value}</dd>
              </div>
            ))}
          </dl>
        </DetailSection>

        {residence.sections?.map((s) => (
          <DetailSection key={s.id} id={s.id} eyebrow={s.label} title={s.title}>
            <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">{s.body}</p>
          </DetailSection>
        ))}

        {scenes.length > 0 && (
          <DetailSection id="tour" eyebrow="360° virtual tour" title="Step inside">
            {tourStarted ? (
              <LazyMount minHeight="62vh">
                <PanoramaViewer scenes={scenes} />
              </LazyMount>
            ) : (
              <button type="button" onClick={() => setTourStarted(true)} className="group relative block h-[26rem] w-full overflow-hidden rounded-[1.75rem] border border-gold/25" aria-label="Start the 360° tour" data-cursor="Start">
                <img src={scenes[0].panorama} alt="" loading="lazy" className="absolute inset-0 size-full scale-110 object-cover transition-transform [transition-duration:2400ms] ease-luxe group-hover:scale-125" />
                <span className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent" />
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-ivory">
                  <span className="inline-flex size-20 items-center justify-center rounded-full bg-gold-foil text-navy shadow-gold-glow">
                    <Rotate3d className="size-9" strokeWidth={1.25} aria-hidden />
                  </span>
                  <span className="font-display text-2xl">Start the 360° tour · {scenes.length} rooms</span>
                </span>
              </button>
            )}
          </DetailSection>
        )}

        {showPlans && (
          <DetailSection id="plans" eyebrow="Floor plans" title="Layouts">
            {drawings.length > 0 ? <PlanDrawings residence={residence.name} plans={drawings} /> : <FloorPlans residence={residence.name} ids={residence.floorPlans} />}
          </DetailSection>
        )}

        <DetailSection id="amenities" eyebrow="Amenities" title={commercial ? 'Amenities and features' : 'Everything, on site'}>
          <AmenityList keys={residence.amenities} />
        </DetailSection>

        {priced && (
          <DetailSection id="pricing" eyebrow="Pricing" title="Cost sheet & EMI">
            <PriceBreakdown items={breakdown} />
            <p className="mt-3 text-xs text-muted-foreground">Indicative for the entry configuration. Statutory charges as applicable at registration.</p>
            <GoldDivider className="my-10" />
            <EmiCalculator defaultPrice={Math.min(500_000_000, residence.price)} />
          </DetailSection>
        )}

        <DetailSection id="location" eyebrow="Location" title={`${residence.locality}, ${residence.city}`}>
          {residence.locationNote && <p className="mb-8 max-w-3xl text-lg leading-relaxed text-muted-foreground">{residence.locationNote}</p>}
          <div className={cn('grid gap-6', landmarks.length > 0 && 'xl:grid-cols-[1fr_1.2fr]')}>
            {landmarks.length > 0 && (
              <ul className="space-y-2">
                {landmarks.map((l) => {
                  const Icon = LANDMARK_ICONS[l.category] ?? MapPin;
                  return (
                    <li key={l.name}>
                      <button type="button" onMouseEnter={() => setActiveLandmark(l.name)} onFocus={() => setActiveLandmark(l.name)} className="flex w-full items-center gap-4 rounded-2xl border border-transparent px-4 py-3 text-left transition-colors hover:border-gold/30 hover:bg-surface">
                        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-navy text-gold">
                          <Icon className="size-4" aria-hidden />
                        </span>
                        <span className="flex-1 text-sm font-medium">{l.name}</span>
                        <span className="text-right text-sm">
                          <span className="block font-semibold">{l.distance}</span>
                          <span className="text-xs text-muted-foreground">{l.time}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <LazyMount minHeight="26rem" className="overflow-hidden rounded-[1.75rem] border border-gold/25">
              <LocationMap center={residence.coordinates} label={residence.name} landmarks={landmarks} active={activeLandmark} onSelect={setActiveLandmark} zoom={14} className="h-[26rem]" />
            </LazyMount>
          </div>
        </DetailSection>

        {residence.quote && <p className="border-t border-gold/15 py-14 font-display text-display-md">{residence.quote}</p>}
      </Container>

      {similar.length > 0 && (
        <section aria-labelledby="similar-title" className="bg-surface section-pad">
          <Container>
            <Eyebrow>You may also like</Eyebrow>
            <h2 id="similar-title" className="mt-4 text-display-md">
              {commercial ? 'More from Alphafour' : 'Similar projects'}
            </h2>
            <ul className="mt-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {similar.map((r, i) => (
                <Reveal as="li" key={r.slug} delay={i * 0.08}>
                  <ResidenceCard residence={r} />
                </Reveal>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-[70] flex gap-2 border-t border-gold/20 bg-background/90 p-3 pr-20 backdrop-blur-xl lg:hidden">
        <Button className="flex-1" size="sm" onClick={() => openDialog('site-visit', { residence: residence.name, source: `residence/${residence.slug}/mobile-bar` })}>
          Book viewing
        </Button>
        {residence.status !== 'sold-out' ? (
          <Button variant="outline" size="sm" className="flex-1" onClick={() => setBrochureOpen(true)}>
            Brochure
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="flex-1" onClick={() => openDialog('enquiry', { residence: residence.name })}>
            Enquire
          </Button>
        )}
      </div>

      <BrochureDialog residence={residence} open={brochureOpen} onOpenChange={setBrochureOpen} />
    </>
  );
}
