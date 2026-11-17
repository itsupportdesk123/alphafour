import { Link } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { site } from '@/config/site';
import { cn } from '@/lib/utils';

/**
 * Label + control + error, wired for accessibility.
 * Children is a render function receiving { id, 'aria-invalid', 'aria-describedby' }.
 */
export function Field({ id, label, error, hint, optional, className, children }) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <Label htmlFor={id}>
          {label}
          {optional && <span className="ml-1 font-normal normal-case tracking-normal">(optional)</span>}
        </Label>
      )}
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs opacity-70">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-destructive [[data-tone=dark]_&]:text-[#FCA5A5]">
          {error}
        </p>
      )}
    </div>
  );
}

/** Invisible to people, irresistible to bots. */
export function Honeypot({ register }) {
  return (
    <div aria-hidden className="absolute left-[-10000px] top-auto size-px overflow-hidden">
      <label>
        Company
        <input type="text" tabIndex={-1} autoComplete="off" {...register('company')} />
      </label>
    </div>
  );
}

export function ConsentCheckbox({ id, register, error, tone = 'light' }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm leading-snug">
        <input
          id={id}
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 cursor-pointer rounded accent-[#C9A24B]"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...register('consent')}
        />
        <span className={tone === 'dark' ? 'text-ivory/80' : 'text-muted-foreground'}>
          I agree to be contacted by {site.name} and accept the{' '}
          <Link to="/privacy" className="underline decoration-gold underline-offset-4 hover:text-gold">
            privacy policy
          </Link>
          .
        </span>
      </label>
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-destructive [[data-tone=dark]_&]:text-[#FCA5A5]">
          {error}
        </p>
      )}
    </div>
  );
}
