import { hasPrice, RESIDENCES } from '@/data/residences';

export const BUDGET_RANGE = { min: 3, max: 45, step: 0.5 }; // ₹ crore

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'area-desc', label: 'Largest first' },
  { value: 'possession', label: 'Earliest possession' },
];

export const STATUS_FILTERS = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'new-launch', label: 'New Launch' },
  { value: 'under-construction', label: 'Under Construction' },
  { value: 'ready-to-move', label: 'Ready to Move' },
  { value: 'sold-out', label: 'Sold Out' },
];

/** Reads listing filters from the URL (shared by the search bar and the listing page). */
export function readFilters(params) {
  const number = (key, fallback) => {
    const value = Number(params.get(key));
    return Number.isFinite(value) && params.has(key) ? value : fallback;
  };
  return {
    q: params.get('q') ?? '',
    area: params.get('area') ?? 'all',
    type: params.get('type') ?? 'all',
    status: params.get('status') ?? 'all',
    min: number('min', BUDGET_RANGE.min),
    max: number('max', BUDGET_RANGE.max),
    bhk: params.get('bhk') ?? 'any',
    sort: params.get('sort') ?? 'featured',
    view: params.get('view') ?? 'grid',
    saved: params.get('saved') === '1',
  };
}

const CRORE = 10_000_000;

/** Applies filters + sort to the portfolio. */
export function filterResidences(filters, favorites = []) {
  const q = filters.q.trim().toLowerCase();
  const list = RESIDENCES.filter((r) => {
    if (filters.saved && !favorites.includes(r.slug)) return false;
    if (filters.area !== 'all' && r.zone !== filters.area) return false;
    if (filters.type !== 'all' && r.type.toLowerCase() !== filters.type) return false;
    if (filters.status !== 'all' && r.status !== filters.status) return false;
    // A project priced on request stays in the results at any budget.
    if (hasPrice(r)) {
      const low = r.price / CRORE;
      const high = (r.priceMax ?? r.price) / CRORE;
      if (high < filters.min || (filters.max < BUDGET_RANGE.max && low > filters.max)) return false;
    }
    if (filters.bhk !== 'any') {
      const wanted = Number(filters.bhk);
      if (!r.bedrooms.some((b) => (wanted >= 5 ? b >= 5 : b === wanted))) return false;
    }
    if (q && !`${r.name} ${r.locality} ${r.zone} ${r.city} ${r.tagline} ${r.type}`.toLowerCase().includes(q)) return false;
    return true;
  });

  // Priced on request sorts after every priced project, and no announced date after every known one.
  const unpricedLast = (a, b) => Number(hasPrice(b)) - Number(hasPrice(a));
  const possessionKey = (r) => (r.possession === null ? '9999' : (r.possession ?? '0000'));
  const sorters = {
    featured: (a, b) =>
      Number(b.status === 'ongoing') - Number(a.status === 'ongoing') ||
      Number(b.featured) - Number(a.featured) ||
      Number(b.flagship ?? 0) - Number(a.flagship ?? 0),
    'price-asc': (a, b) => unpricedLast(a, b) || a.price - b.price,
    'price-desc': (a, b) => unpricedLast(a, b) || b.price - a.price,
    'area-desc': (a, b) => b.area[1] - a.area[1],
    possession: (a, b) => possessionKey(a).localeCompare(possessionKey(b)),
  };
  return [...list].sort(sorters[filters.sort] ?? sorters.featured);
}
