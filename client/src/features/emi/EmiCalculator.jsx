import { motion } from 'framer-motion';
import { useId, useMemo, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { calculateEmi, EMI_LIMITS } from '@/lib/emi';
import { formatINR } from '@/lib/format';
import { EASE_LUXE } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/ui';

function Donut({ principal, interest }) {
  const total = principal + interest;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const principalShare = total > 0 ? principal / total : 0;
  return (
    <svg viewBox="0 0 180 180" className="size-full -rotate-90" role="img" aria-label={`Principal ${Math.round(principalShare * 100)}%, interest ${Math.round((1 - principalShare) * 100)}%`}>
      <circle cx="90" cy="90" r={radius} fill="none" stroke="#1E3A8A" strokeWidth="18" />
      <motion.circle
        cx="90"
        cy="90"
        r={radius}
        fill="none"
        stroke="url(#emi-gold)"
        strokeWidth="18"
        strokeLinecap="round"
        strokeDasharray={circumference}
        animate={{ strokeDashoffset: circumference * (1 - principalShare) }}
        transition={{ duration: 0.8, ease: EASE_LUXE }}
      />
      <defs>
        <linearGradient id="emi-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B8892F" />
          <stop offset="50%" stopColor="#F3DFA2" />
          <stop offset="100%" stopColor="#B8892F" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SliderField({ id, label, value, display, min, max, step, onChange }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label id={id} className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </label>
        <output aria-live="polite" className="font-display text-2xl">
          {display}
        </output>
      </div>
      <Slider aria-labelledby={id} min={min} max={max} step={step} value={[value]} onValueChange={([v]) => onChange(v)} thumbLabels={[label]} />
    </div>
  );
}

/** Interactive home-loan EMI calculator with a principal / interest donut. */
export function EmiCalculator({ defaultPrice = 125_000_000, className }) {
  const uid = useId();
  const openDialog = useUiStore((s) => s.openDialog);
  const [price, setPrice] = useState(defaultPrice);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const principal = Math.max(0, price * (1 - downPct / 100));
  const result = useMemo(() => calculateEmi({ principal, annualRatePct: rate, tenureYears: tenure }), [principal, rate, tenure]);

  return (
    <div className={cn('grid gap-8 lg:grid-cols-[1.15fr_1fr]', className)}>
      <div className="glass space-y-7 rounded-[2rem] p-6 sm:p-9">
        <SliderField
          id={`${uid}-price`}
          label="Property price"
          value={price}
          display={formatINR(price)}
          min={EMI_LIMITS.price.min}
          max={EMI_LIMITS.price.max}
          step={EMI_LIMITS.price.step}
          onChange={setPrice}
        />
        <SliderField
          id={`${uid}-down`}
          label="Down payment"
          value={downPct}
          display={`${downPct}% · ${formatINR(price * (downPct / 100))}`}
          min={EMI_LIMITS.downPaymentPct.min}
          max={EMI_LIMITS.downPaymentPct.max}
          step={EMI_LIMITS.downPaymentPct.step}
          onChange={setDownPct}
        />
        <SliderField
          id={`${uid}-rate`}
          label="Interest rate (p.a.)"
          value={rate}
          display={`${rate.toFixed(2)}%`}
          min={EMI_LIMITS.rate.min}
          max={EMI_LIMITS.rate.max}
          step={EMI_LIMITS.rate.step}
          onChange={setRate}
        />
        <SliderField
          id={`${uid}-tenure`}
          label="Loan tenure"
          value={tenure}
          display={`${tenure} years`}
          min={EMI_LIMITS.tenure.min}
          max={EMI_LIMITS.tenure.max}
          step={EMI_LIMITS.tenure.step}
          onChange={setTenure}
        />
      </div>

      <div data-tone="dark" className="relative flex flex-col justify-between gap-8 overflow-hidden rounded-[2rem] bg-royal-night p-6 text-ivory shadow-luxe sm:p-9">
        <div aria-hidden className="absolute -right-20 -top-20 size-64 rounded-full bg-gold/15 blur-3xl" />
        <div className="relative flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative size-44 shrink-0">
            <Donut principal={principal} interest={result.totalInterest} />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-champagne">Monthly EMI</span>
              <span className="mt-1 font-display text-2xl">{formatINR(result.emi, { compact: false })}</span>
            </div>
          </div>
          <dl className="w-full space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <dt className="flex items-center gap-2 text-ivory/75">
                <span aria-hidden className="size-2.5 rounded-full bg-gold-foil" /> Loan amount
              </dt>
              <dd className="font-semibold">{formatINR(principal)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <dt className="flex items-center gap-2 text-ivory/75">
                <span aria-hidden className="size-2.5 rounded-full bg-royal ring-1 ring-ivory/40" /> Total interest
              </dt>
              <dd className="font-semibold">{formatINR(result.totalInterest)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ivory/75">Total payable</dt>
              <dd className="font-semibold text-gold">{formatINR(result.totalPayment)}</dd>
            </div>
          </dl>
        </div>
        <div className="relative space-y-4">
          <p className="text-xs leading-relaxed text-ivory/60">
            Indicative only. Final EMI depends on your lender’s terms, credit profile and applicable charges.
          </p>
          <Button className="w-full" onClick={() => openDialog('callback', { source: 'emi-calculator' })}>
            Talk to a home-loan specialist
          </Button>
        </div>
      </div>
    </div>
  );
}
