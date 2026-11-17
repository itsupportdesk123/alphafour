import { Search } from 'lucide-react';
import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RESIDENCE_TYPES, ZONES } from '@/data/residences';
import { cn } from '@/lib/utils';
import { BUDGET_RANGE } from '@/features/residences/filters';


const BHK = ['any', '2', '3', '4', '5'];

const areaOptions = [{ value: 'all', label: 'All of Chennai' }, ...ZONES.map((z) => ({ value: z, label: z }))];
const typeOptions = [{ value: 'all', label: 'All types' }, ...RESIDENCE_TYPES.map((t) => ({ value: t.toLowerCase(), label: t }))];

/**
 * Smart search: location, type, budget (dual slider, ₹ crore) and BHK.
 * Submits to /residences with URL filters (shared with the listing page).
 */
export function SearchBar({ initial = {}, tone = 'light', onSubmit, className }) {
  const uid = useId();
  const navigate = useNavigate();
  const [area, setArea] = useState(initial.area ?? 'all');
  const [type, setType] = useState(initial.type ?? 'all');
  const [budget, setBudget] = useState([initial.min ?? BUDGET_RANGE.min, initial.max ?? BUDGET_RANGE.max]);
  const [bhk, setBhk] = useState(initial.bhk ?? 'any');

  const submit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (area !== 'all') params.set('area', area);
    if (type !== 'all') params.set('type', type);
    if (budget[0] > BUDGET_RANGE.min) params.set('min', String(budget[0]));
    if (budget[1] < BUDGET_RANGE.max) params.set('max', String(budget[1]));
    if (bhk !== 'any') params.set('bhk', bhk);
    const query = params.toString();
    if (onSubmit) onSubmit(params);
    else navigate(`/residences${query ? `?${query}` : ''}`);
  };

  const dark = tone === 'dark';

  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label="Search projects"
      className={cn(
        'grid gap-4 rounded-[2rem] p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.35fr_auto_auto] xl:items-end',
        dark ? 'glass-dark text-ivory' : 'glass',
        className,
      )}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${uid}-area`}>Location</Label>
        <Select id={`${uid}-area`} tone={dark ? 'dark' : 'light'} value={area} onValueChange={setArea} options={areaOptions} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${uid}-type`}>Project type</Label>
        <Select id={`${uid}-type`} tone={dark ? 'dark' : 'light'} value={type} onValueChange={setType} options={typeOptions} />
      </div>
      <div className="flex flex-col gap-1 md:col-span-2 xl:col-span-1">
        <div className="flex items-center justify-between">
          <Label id={`${uid}-budget`}>Budget</Label>
          <span className="text-sm font-semibold" aria-live="polite">
            ₹{budget[0]} Cr – ₹{budget[1]}
            {budget[1] >= BUDGET_RANGE.max ? '+' : ''} Cr
          </span>
        </div>
        <Slider
          aria-labelledby={`${uid}-budget`}
          tone={dark ? 'dark' : 'light'}
          min={BUDGET_RANGE.min}
          max={BUDGET_RANGE.max}
          step={BUDGET_RANGE.step}
          minStepsBetweenThumbs={2}
          value={budget}
          onValueChange={setBudget}
          thumbLabels={['Minimum budget in crore', 'Maximum budget in crore']}
        />
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] opacity-80">BHK</legend>
        <div className="flex gap-1.5">
          {BHK.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={bhk === value}
              onClick={() => setBhk(value)}
              className={cn(
                'h-12 min-w-11 rounded-xl border px-3 text-sm font-semibold transition-all duration-300',
                bhk === value
                  ? 'border-transparent bg-gold-foil text-navy shadow-gold-glow'
                  : dark
                    ? 'border-white/15 hover:border-gold'
                    : 'border-input bg-white/60 hover:border-gold dark:bg-navy-800/60',
              )}
            >
              {value === 'any' ? 'Any' : `${value}${value === '5' ? '+' : ''}`}
            </button>
          ))}
        </div>
      </fieldset>
      <Button type="submit" size="lg" className="h-12 w-full xl:w-auto">
        <Search aria-hidden /> Search
      </Button>
    </form>
  );
}
