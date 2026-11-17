import { AnimatePresence, motion } from 'framer-motion';
import { Heart, LayoutGrid, List, Map as MapIcon, Search, SlidersHorizontal, X } from 'lucide-react';
import { lazy, useEffect, useId, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LazyMount } from '@/components/common/LazyMount';
import { Container } from '@/components/common/Section';
import { Seo } from '@/components/common/Seo';
import { PageHero } from '@/components/layout/PageHero';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RESIDENCES, RESIDENCE_TYPES, ZONES } from '@/data/residences';
import { BUDGET_RANGE, filterResidences, readFilters, SORT_OPTIONS, STATUS_FILTERS } from '@/features/residences/filters';
import { ResidenceCard } from '@/features/residences/ResidenceCard';
import { useFavorites } from '@/hooks/useFavorites';
import { formatPriceRange } from '@/lib/format';
import { EASE_LUXE } from '@/lib/motion';
import { PHOTOS } from '@/lib/media';
import { cn } from '@/lib/utils';
import { scrollToTarget, useLenis } from '@/providers/SmoothScrollProvider';

const LocationMap = lazy(() => import('@/features/map/LocationMap'));

const DEFAULTS = { q: '', area: 'all', type: 'all', status: 'all', min: BUDGET_RANGE.min, max: BUDGET_RANGE.max, bhk: 'any', sort: 'featured', view: 'grid', saved: false };

function Chip({ active, children, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'h-9 rounded-full border px-4 text-xs font-semibold transition-all duration-300',
        active ? 'border-transparent bg-gold-foil text-navy shadow-gold-glow' : 'border-gold/25 hover:border-gold',
      )}
    >
      {children}
    </button>
  );
}

function FiltersPanel({ filters, update, reset, savedCount }) {
  const uid = useId();
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="font-display text-2xl">Refine</p>
        <button type="button" onClick={reset} className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-ink hover:underline dark:text-gold">
          Reset
        </button>
      </div>

      <button
        type="button"
        aria-pressed={filters.saved}
        onClick={() => update({ saved: !filters.saved })}
        className={cn(
          'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-colors',
          filters.saved ? 'border-gold bg-gold/10' : 'border-gold/20 hover:border-gold/50',
        )}
      >
        <span className="flex items-center gap-2">
          <Heart className={cn('size-4', filters.saved && 'fill-gold text-gold')} aria-hidden /> Saved projects
        </span>
        <span className="text-xs text-muted-foreground">{savedCount}</span>
      </button>

      <div className="space-y-3">
        <Label htmlFor={`${uid}-area`}>Location</Label>
        <Select
          id={`${uid}-area`}
          value={filters.area}
          onValueChange={(area) => update({ area })}
          options={[{ value: 'all', label: 'All of Chennai' }, ...ZONES.map((z) => ({ value: z, label: z }))]}
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] opacity-80">Project type</legend>
        <div className="flex flex-wrap gap-2">
          <Chip active={filters.type === 'all'} onClick={() => update({ type: 'all' })}>
            All
          </Chip>
          {RESIDENCE_TYPES.map((type) => (
            <Chip key={type} active={filters.type === type.toLowerCase()} onClick={() => update({ type: type.toLowerCase() })}>
              {type}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] opacity-80">Status</legend>
        <div className="flex flex-wrap gap-2">
          <Chip active={filters.status === 'all'} onClick={() => update({ status: 'all' })}>
            Any
          </Chip>
          {STATUS_FILTERS.map((status) => (
            <Chip key={status.value} active={filters.status === status.value} onClick={() => update({ status: status.value })}>
              {status.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <Label id={`${uid}-budget`}>Budget</Label>
          <span className="text-sm font-semibold">
            ₹{filters.min} – ₹{filters.max}
            {filters.max >= BUDGET_RANGE.max ? '+' : ''} Cr
          </span>
        </div>
        <Slider
          aria-labelledby={`${uid}-budget`}
          min={BUDGET_RANGE.min}
          max={BUDGET_RANGE.max}
          step={BUDGET_RANGE.step}
          minStepsBetweenThumbs={2}
          value={[filters.min, filters.max]}
          onValueChange={([min, max]) => update({ min, max })}
          thumbLabels={['Minimum budget in crore', 'Maximum budget in crore']}
        />
      </div>

      <fieldset>
        <legend className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] opacity-80">Bedrooms</legend>
        <div className="flex flex-wrap gap-2">
          {['any', '2', '3', '4', '5'].map((value) => (
            <Chip key={value} active={filters.bhk === value} onClick={() => update({ bhk: value })}>
              {value === 'any' ? 'Any' : `${value}${value === '5' ? '+' : ''} BHK`}
            </Chip>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

export default function ResidencesPage() {
  const [params, setParams] = useSearchParams();
  const lenis = useLenis();
  // Arriving with filters (the home search, or footer links such as Villas or Saved projects) brings the
  // results into view, since the full-screen header would otherwise hide them.
  const [arrivedFiltered] = useState(() => [...params.keys()].length > 0);
  useEffect(() => {
    if (!arrivedFiltered || !lenis) return undefined;
    const timer = setTimeout(() => scrollToTarget(lenis, '#project-results', { offset: -96 }), 600);
    return () => clearTimeout(timer);
  }, [arrivedFiltered, lenis]);
  const filters = useMemo(() => readFilters(params), [params]);
  const { favorites, count } = useFavorites();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const results = useMemo(() => filterResidences(filters, favorites), [filters, favorites]);

  const update = (patch) => {
    const next = { ...filters, ...patch };
    const query = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value === DEFAULTS[key] || value === '' || value === false) return;
      query.set(key, value === true ? '1' : String(value));
    });
    setParams(query, { replace: true, preventScrollReset: true });
  };
  const reset = () => setParams(new URLSearchParams(), { replace: true, preventScrollReset: true });

  const activeCount = ['area', 'type', 'status', 'bhk'].filter((k) => filters[k] !== DEFAULTS[k]).length + (filters.min !== BUDGET_RANGE.min || filters.max !== BUDGET_RANGE.max ? 1 : 0) + (filters.saved ? 1 : 0);

  const views = [
    { value: 'grid', label: 'Grid view', icon: LayoutGrid },
    { value: 'list', label: 'List view', icon: List },
    { value: 'map', label: 'Map view', icon: MapIcon },
  ];

  return (
    <>
      <Seo title="Projects" description="Explore the residential and commercial projects by Alphafour Infrastructure Pvt Ltd across Chennai: apartments, penthouses, villas, townhomes and commercial spaces." path="/residences" />
      <PageHero
        eyebrow="The collection"
        title={
          <>
            Explore our <em className="italic text-gold">projects</em>
          </>
        }
        description={`${RESIDENCES.length} addresses across Chennai, from duplex penthouses on the OMR skyline to garden mansions in Poes Garden.`}
        photo={PHOTOS.villaInfinity}
        breadcrumbs={[{ label: 'Projects' }]}
      />

      <Container id="project-results" className="section-pad scroll-mt-24 !pt-12">
        <div className="grid gap-10 lg:grid-cols-[18rem_1fr]">
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="glass sticky top-28 rounded-[2rem] p-6">
              <FiltersPanel filters={filters} update={update} reset={reset} savedCount={count} />
            </div>
          </aside>

          <div>
            <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative flex-1 xl:max-w-sm">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <label htmlFor="residence-search" className="sr-only">
                  Search projects
                </label>
                <input
                  id="residence-search"
                  type="search"
                  value={filters.q}
                  onChange={(e) => update({ q: e.target.value })}
                  placeholder="Search by name or neighbourhood"
                  className="h-12 w-full rounded-full border border-input bg-white/80 pl-11 pr-4 text-sm outline-none transition-colors focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/30 dark:bg-navy-800/60"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" size="md" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
                  <SlidersHorizontal aria-hidden /> Filters{activeCount ? ` (${activeCount})` : ''}
                </Button>
                <div className="w-52">
                  <Select aria-label="Sort projects" value={filters.sort} onValueChange={(sort) => update({ sort })} options={SORT_OPTIONS} />
                </div>
                <div role="group" aria-label="View" className="glass flex rounded-full p-1">
                  {views.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      aria-label={label}
                      aria-pressed={filters.view === value}
                      onClick={() => update({ view: value })}
                      className={cn('inline-flex size-10 items-center justify-center rounded-full transition-colors', filters.view === value ? 'bg-gold-foil text-navy' : 'hover:text-gold')}
                    >
                      <Icon className="size-4" aria-hidden />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {/* The results count heads the card grid (cards use h3 titles) */}
              <h2 className="font-sans text-sm" aria-live="polite">
                {results.length} {results.length === 1 ? 'project' : 'projects'}
                {filters.saved ? ' saved' : ''}
              </h2>
              {activeCount > 0 && (
                <button type="button" onClick={reset} className="inline-flex items-center gap-1 font-semibold text-gold-ink hover:underline dark:text-gold">
                  <X className="size-3.5" aria-hidden /> Clear filters
                </button>
              )}
            </div>

            {results.length === 0 ? (
              <div className="glass flex flex-col items-center rounded-[2rem] px-6 py-20 text-center">
                <Heart className="size-10 text-gold" strokeWidth={1.25} aria-hidden />
                <h2 className="mt-6 font-display text-display-sm">{filters.saved ? 'No saved projects yet' : 'No projects match'}</h2>
                <p className="mt-3 max-w-md text-muted-foreground">
                  {filters.saved
                    ? 'Tap the heart on any project to save it here. Your shortlist stays on this device.'
                    : 'Try widening your budget or choosing another neighbourhood. Our advisors also know of off-market homes.'}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button onClick={reset}>Show all projects</Button>
                  <Button asChild variant="outline">
                    <Link to="/contact">Ask an advisor</Link>
                  </Button>
                </div>
              </div>
            ) : filters.view === 'map' ? (
              <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
                <LazyMount minHeight="36rem" className="overflow-hidden rounded-[2rem] border border-gold/25 shadow-luxe">
                  <LocationMap
                    center={results[0].coordinates}
                    label={results[0].name}
                    landmarks={results.slice(1).map((r) => ({ name: r.name, coordinates: r.coordinates, distance: `${r.locality}, ${r.city}`, time: formatPriceRange(r.price, r.priceMax) }))}
                    zoom={11}
                    className="h-[36rem]"
                  />
                </LazyMount>
                <ul className="max-h-[36rem] space-y-3 overflow-y-auto pr-1" data-lenis-prevent>
                  {results.map((r) => (
                    <li key={r.slug}>
                      <Link to={`/residences/${r.slug}`} className="glass flex items-center justify-between gap-3 rounded-2xl px-4 py-3 transition-colors hover:border-gold/50">
                        <span>
                          <span className="block font-display text-lg leading-tight">{r.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {r.locality}, {r.city}
                          </span>
                        </span>
                        <span className="text-right text-sm font-semibold text-gold-ink dark:text-gold">{formatPriceRange(r.price, r.priceMax).replace(' onwards', '')}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ul className={cn('grid gap-8', filters.view === 'list' ? 'grid-cols-1' : 'sm:grid-cols-2 2xl:grid-cols-3')}>
                <AnimatePresence initial={false}>
                  {results.map((residence, index) => (
                    <motion.li
                      key={residence.slug}
                      layout
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_LUXE, delay: Math.min(index, 6) * 0.05 } }}
                      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.25 } }}
                    >
                      <ResidenceCard residence={residence} layout={filters.view} priority={index < 2} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </div>
      </Container>

      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent side="left">
          <DialogTitle className="sr-only">Filters</DialogTitle>
          <DialogDescription className="sr-only">Refine the projects shown</DialogDescription>
          <FiltersPanel filters={filters} update={update} reset={reset} savedCount={count} />
          <Button className="mt-8 w-full" onClick={() => setFiltersOpen(false)}>
            Show {results.length} {results.length === 1 ? 'project' : 'projects'}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
