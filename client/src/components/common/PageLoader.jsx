import { cn } from '@/lib/utils';

/** Gold progress ring. Determinate when `progress` (0–100) is given. */
export function GoldRing({ progress, size = 72, label, className }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const determinate = typeof progress === 'number';
  return (
    <div className={cn('flex flex-col items-center gap-4', className)} role="status" aria-live="polite">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={cn(!determinate && 'animate-spin')}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(201,162,75,.18)" strokeWidth="2" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#C9A24B"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={determinate ? circumference * (1 - progress / 100) : circumference * 0.72}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset .4s cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      {label && <span className="text-micro uppercase text-gold">{label}</span>}
      {!label && <span className="sr-only">Loading</span>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-background">
      <GoldRing />
    </div>
  );
}
