import { cn } from '@/lib/utils';

/**
 * Alphafour mark (public/assets/alphalogo-removebg-preview.png, transparent) + wordmark.
 * The wordmark is live text in currentColor, so it reads on the dark hero, the light navbar and the navy footer.
 */
export function Logo({ className, showWordmark = true, tone = 'current' }) {
  return (
    <span className={cn('inline-flex items-center gap-3', tone === 'light' && 'text-ivory', className)}>
      <img src="/assets/alphalogo-removebg-preview.png" alt="" width={80} height={78} decoding="async" className="h-11 w-auto shrink-0 md:h-12" />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-[1.05rem] font-extrabold uppercase tracking-[0.28em]">Alphafour</span>
          <span className="mt-1.5 text-[0.5rem] font-semibold uppercase tracking-[0.18em] opacity-75">Infrastructure Pvt Ltd</span>
        </span>
      )}
    </span>
  );
}
