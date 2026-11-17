import { Maximize, Minus, Plus, RotateCcw } from 'lucide-react';
import { useId, useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FLOOR_PLANS } from '@/data/floorPlans';
import { formatArea, formatINR } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/ui';

const FILL = {
  room: 'fill-ivory dark:fill-navy-800',
  wet: 'fill-[#EEF2F4] dark:fill-[#15264a]',
  core: 'fill-sand/80 dark:fill-navy-700',
  deck: 'fill-[url(#deck-hatch)]',
  pool: 'fill-[#7cc7d9] dark:fill-[#2a6f86]',
};

/** Procedural architectural plan: walls, rooms, labels, doors, compass and scale. */
export function FloorPlanSvg({ plan }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg viewBox="-2 -2 104 70" className="h-full w-full" role="img" aria-label={`${plan.name} floor plan`}>
      <defs>
        <pattern id="deck-hatch" width="2" height="2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="2" height="2" className="fill-[#efe4cc] dark:fill-[#1d2c4f]" />
          <line x1="0" y1="0" x2="0" y2="2" className="stroke-gold/40" strokeWidth="0.35" />
        </pattern>
        <linearGradient id={`wall-${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor="#A8833A" />
          <stop offset="0.5" stopColor="#E6D3A3" />
          <stop offset="1" stopColor="#A8833A" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="64" fill="none" stroke={`url(#wall-${uid})`} strokeWidth="1.2" />
      {plan.rooms.map((room) => {
        const [x, y, w, h] = room.rect;
        const kind = room.kind ?? 'room';
        const small = w < 14 || h < 10;
        return (
          <g key={room.name}>
            <rect x={x} y={y} width={w} height={h} className={cn(FILL[kind], 'stroke-charcoal/70 dark:stroke-champagne/60')} strokeWidth="0.45" />
            <text
              x={x + w / 2}
              y={y + h / 2 - (small ? 0.4 : 1)}
              textAnchor="middle"
              className="fill-charcoal font-sans uppercase dark:fill-ivory"
              style={{ fontSize: small ? 1.55 : 2.05, letterSpacing: 0.25, fontWeight: 700 }}
            >
              {room.name}
            </text>
            <text x={x + w / 2} y={y + h / 2 + (small ? 1.9 : 2.4)} textAnchor="middle" className="fill-taupe-ink font-sans dark:fill-champagne" style={{ fontSize: small ? 1.4 : 1.75 }}>
              {room.dims}
            </text>
          </g>
        );
      })}
      {plan.doors.map(([x, y], i) => (
        <path key={i} d={`M ${x} ${y} a 4 4 0 0 1 4 4`} fill="none" className="stroke-gold-dark" strokeWidth="0.4" strokeDasharray="0.8 0.6" />
      ))}
      <g transform="translate(95 58)" aria-hidden>
        <circle r="3" className="fill-none stroke-gold" strokeWidth="0.3" />
        <path d="M0 -2.6 L0.9 0.6 L0 0 L-0.9 0.6 Z" className="fill-gold" />
        <text y="-3.6" textAnchor="middle" className="fill-gold-ink dark:fill-gold" style={{ fontSize: 1.8, fontWeight: 700 }}>
          N
        </text>
      </g>
      <g transform="translate(2 66.5)" aria-hidden>
        <line x1="0" x2="10" y1="0" y2="0" className="stroke-charcoal dark:stroke-ivory" strokeWidth="0.3" />
        <text x="11" y="0.6" className="fill-taupe-ink dark:fill-champagne" style={{ fontSize: 1.5 }}>
          10 ft
        </text>
      </g>
    </svg>
  );
}

function ZoomControls({ zoomIn, zoomOut, resetTransform, className = 'absolute right-4 top-4 z-10 flex-col' }) {
  const button = 'inline-flex size-10 items-center justify-center rounded-full border border-gold/30 bg-background/80 backdrop-blur transition-colors hover:bg-gold hover:text-navy';
  return (
    <div className={cn('flex gap-2', className)}>
      <button type="button" className={button} onClick={() => zoomIn()} aria-label="Zoom in">
        <Plus className="size-4" aria-hidden />
      </button>
      <button type="button" className={button} onClick={() => zoomOut()} aria-label="Zoom out">
        <Minus className="size-4" aria-hidden />
      </button>
      <button type="button" className={button} onClick={() => resetTransform()} aria-label="Reset zoom">
        <RotateCcw className="size-4" aria-hidden />
      </button>
    </div>
  );
}

function PlanDrawing({ plan }) {
  // Until the drawing is zoomed, a finger on it must scroll the page instead of panning nothing.
  const [zoomed, setZoomed] = useState(false);
  return (
    <div className="overflow-hidden rounded-[2rem] border border-gold/25 shadow-luxe" data-cursor={zoomed ? 'Drag' : undefined}>
      <TransformWrapper
        minScale={1}
        maxScale={6}
        wheel={{ step: 0.15, activationKeys: ['Control', 'Meta'] }}
        doubleClick={{ step: 0.8 }}
        panning={{ disabled: !zoomed }}
        onTransformed={(_, state) => setZoomed(state.scale > 1.01)}
      >
        {(controls) => (
          <>
            <TransformComponent wrapperClass="!w-full" contentClass="!w-full">
              {/* White in both themes: the drawing is black lines on white. */}
              <img src={plan.image} width={plan.width} height={plan.height} alt={plan.alt} loading="lazy" decoding="async" draggable={false} className="w-full bg-white" />
            </TransformComponent>
            {/* Below the drawing rather than over it, so no dimension label is ever covered. On phones the buttons go left, clear of the floating call buttons. */}
            <div className="flex flex-row-reverse items-center justify-between gap-4 border-t border-gold/15 bg-surface px-5 py-3 lg:flex-row">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Maximize className="size-3.5 shrink-0" aria-hidden /> Pinch or double-tap to zoom
              </p>
              <ZoomControls {...controls} className="shrink-0" />
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}

/** A project's own architectural drawings, as tabs with a zoomable image and a short summary. */
export function PlanDrawings({ residence, plans }) {
  const openDialog = useUiStore((s) => s.openDialog);
  return (
    <Tabs defaultValue={plans[0].id}>
      <TabsList aria-label="Floor plan level">
        {plans.map((plan) => (
          <TabsTrigger key={plan.id} value={plan.id}>
            {plan.title}
          </TabsTrigger>
        ))}
      </TabsList>
      {plans.map((plan) => (
        <TabsContent key={plan.id} value={plan.id}>
          <div className="grid gap-8 xl:grid-cols-[2fr_1fr]">
            <PlanDrawing plan={plan} />
            <div className="flex flex-col">
              <p className="eyebrow">{plan.eyebrow}</p>
              <h3 className="mt-3 font-display text-display-sm">{plan.title}</h3>
              <p className="mt-4 leading-relaxed text-muted-foreground">{plan.summary}</p>
              <dl className="mt-6 grid grid-cols-3 gap-3">
                {plan.facts.map(([label, value]) => (
                  <div key={label} className="glass rounded-2xl p-3 text-center">
                    <dt className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
                    <dd className="mt-1 font-display text-2xl leading-tight lining-nums">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={() => openDialog('enquiry', { residence, source: `floor-plan/${plan.id}` })}>Request brochure & pricing</Button>
                <Button variant="outline" onClick={() => openDialog('site-visit', { residence, source: `floor-plan/${plan.id}` })}>
                  Book a viewing
                </Button>
              </div>
              <p className="mt-6 text-xs text-muted-foreground">From the November 2025 project brochure. Indicative and subject to change.</p>
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

/** Tabs (3 BHK / 4 BHK / Penthouse) with a zoomable plan and an area table. */
export function FloorPlans({ residence = 'Alphafour Altitude', ids = ['3bhk', '4bhk', 'penthouse'] }) {
  const openDialog = useUiStore((s) => s.openDialog);
  const plans = FLOOR_PLANS.filter((plan) => ids.includes(plan.id));
  if (plans.length === 0) return null;
  return (
    <Tabs defaultValue={plans[0].id}>
      <TabsList aria-label="Floor plan type">
        {plans.map((plan) => (
          <TabsTrigger key={plan.id} value={plan.id}>
            {plan.tab}
          </TabsTrigger>
        ))}
      </TabsList>
      {plans.map((plan) => (
        <TabsContent key={plan.id} value={plan.id}>
          <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            <div className="relative overflow-hidden rounded-[2rem] border border-gold/25 bg-ivory shadow-luxe dark:bg-navy-900" data-cursor="Drag">
              <TransformWrapper minScale={1} maxScale={4} wheel={{ step: 0.15, activationKeys: ['Control', 'Meta'] }} doubleClick={{ step: 0.8 }}>
                {(controls) => (
                  <>
                    <ZoomControls {...controls} />
                    <TransformComponent wrapperClass="!w-full" contentClass="!w-full">
                      <div className="aspect-[104/70] w-full p-4 sm:p-6">
                        <FloorPlanSvg plan={plan} />
                      </div>
                    </TransformComponent>
                  </>
                )}
              </TransformWrapper>
              <p className="pointer-events-none absolute bottom-4 left-5 flex items-center gap-2 text-xs text-muted-foreground">
                <Maximize className="size-3.5" aria-hidden /> Pinch, double-tap or use the buttons to zoom
              </p>
            </div>
            <div className="flex flex-col">
              <p className="eyebrow">{plan.view}</p>
              <h3 className="mt-3 font-display text-display-sm">{plan.name}</h3>
              <dl className="mt-6 grid grid-cols-3 gap-3">
                {[
                  ['Carpet', formatArea(plan.carpet)],
                  ['Super area', formatArea(plan.superArea)],
                  ['From', formatINR(plan.priceFrom)],
                ].map(([label, value]) => (
                  <div key={label} className="glass rounded-2xl p-3 text-center">
                    <dt className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
                    <dd className="mt-1 font-display text-lg leading-tight">{value}</dd>
                  </div>
                ))}
              </dl>
              {/* Scrollable, so it must be reachable from the keyboard (WCAG 2.1.1) */}
              <div
                role="region"
                aria-label={`Room dimensions for ${plan.name}`}
                tabIndex={0}
                className="mt-6 max-h-72 overflow-y-auto rounded-2xl border border-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                data-lenis-prevent
              >
                <table className="w-full text-sm">
                  <caption className="sr-only">Room dimensions for {plan.name}</caption>
                  <thead className="sticky top-0 bg-surface text-left text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">Room</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Size</th>
                      <th scope="col" className="px-4 py-3 text-right font-semibold">Sq.ft</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.rooms.map((room) => (
                      <tr key={room.name} className="border-t border-gold/10">
                        <th scope="row" className="px-4 py-2.5 text-left font-medium">{room.name}</th>
                        <td className="px-4 py-2.5 text-muted-foreground">{room.dims}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums">{room.area}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={() => openDialog('enquiry', { residence, source: `floor-plan/${plan.id}` })}>Request brochure & pricing</Button>
                <Button variant="outline" onClick={() => openDialog('site-visit', { residence, source: `floor-plan/${plan.id}` })}>
                  Book a viewing
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
