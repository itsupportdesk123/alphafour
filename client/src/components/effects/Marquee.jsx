import { cn } from '@/lib/utils';

/**
 * Infinite marquee (Magic UI style). Content is repeated `repeat` times;
 * pauses on hover and stops entirely for reduced-motion users (global CSS).
 * Only the first copy reaches assistive tech. Children may be a function of `{ hidden }`, so links in
 * the repeated copies stay clickable but leave the tab order (`tabIndex={hidden ? -1 : undefined}`).
 * While a keyboard user is inside, the row stops at its start and scrolls each focused link clear of the
 * edge fade; it resets and runs again once focus leaves.
 */
export function Marquee({
  children,
  reverse = false,
  pauseOnHover = true,
  vertical = false,
  repeat = 3,
  duration = '40s',
  gap = '1.5rem',
  className,
  onFocus,
  onBlur,
  ...props
}) {
  return (
    <div
      {...props}
      onFocus={(event) => {
        onFocus?.(event);
        const target = event.target;
        if (target === event.currentTarget || !target.matches(':focus-visible')) return;
        // scrollIntoView lays the stopped row out first, so the link lands clear of the edge fade (scroll-padding).
        target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }}
      onBlur={(event) => {
        onBlur?.(event);
        if (event.currentTarget.contains(event.relatedTarget)) return;
        event.currentTarget.scrollLeft = 0;
        event.currentTarget.scrollTop = 0;
      }}
      style={{ '--duration': duration, '--gap': gap }}
      className={cn(
        'group flex overflow-hidden [gap:var(--gap)]',
        vertical ? 'flex-col' : 'flex-row [scroll-padding-inline:8%] has-[:focus-visible]:px-[8%]',
        className,
      )}
    >
      {Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          aria-hidden={i > 0 || undefined}
          className={cn(
            'flex shrink-0 justify-around [gap:var(--gap)]',
            vertical ? 'animate-marquee-vertical flex-col' : 'animate-marquee flex-row',
            pauseOnHover && 'group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]',
            'group-has-[:focus-visible]:[animation:none]',
            reverse && '[animation-direction:reverse]',
          )}
        >
          {typeof children === 'function' ? children({ hidden: i > 0 }) : children}
        </div>
      ))}
    </div>
  );
}
