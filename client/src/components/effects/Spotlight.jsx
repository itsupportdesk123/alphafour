import { cn } from '@/lib/utils';

/** Aceternity-style soft spotlight sweeping in from the top-left. */
export function Spotlight({ className, fill = '#E6D3A3' }) {
  return (
    <svg
      aria-hidden
      className={cn(
        'pointer-events-none absolute z-0 h-[169%] w-[138%] animate-spotlight-in opacity-0 lg:w-[84%]',
        className,
      )}
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter="url(#spotlight-blur)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill}
          fillOpacity="0.16"
        />
      </g>
      <defs>
        <filter id="spotlight-blur" x="0.860352" y="0.838989" width="3785.16" height="2840.26" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  );
}

/** Thin animated gold lines drifting across a dark background. */
export function BeamLines({ className }) {
  return (
    <svg aria-hidden className={cn('pointer-events-none absolute inset-0 size-full', className)} preserveAspectRatio="none" viewBox="0 0 1200 600">
      <defs>
        <linearGradient id="beam-gold" x1="0" x2="1">
          <stop offset="0%" stopColor="#C9A24B" stopOpacity="0" />
          <stop offset="50%" stopColor="#F3DFA2" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#C9A24B" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[90, 210, 330, 450].map((y, i) => (
        <path
          key={y}
          d={`M-100 ${y} C 300 ${y - 80}, 700 ${y + 80}, 1300 ${y - 40}`}
          stroke="url(#beam-gold)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="320 1400"
          style={{ animation: `beam-dash ${10 + i * 3}s linear ${i * -2}s infinite` }}
        />
      ))}
      <style>{'@keyframes beam-dash { to { stroke-dashoffset: -1720; } }'}</style>
    </svg>
  );
}
