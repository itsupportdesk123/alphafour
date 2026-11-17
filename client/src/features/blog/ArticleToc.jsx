import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { scrollToTarget, useLenis } from '@/providers/SmoothScrollProvider';

/** "In this article": the section headings, with the one being read highlighted. */
export function ArticleToc({ headings, className }) {
  const lenis = useLenis();
  const [active, setActive] = useState(headings[0]?.id);

  useEffect(() => {
    const elements = headings.map((h) => document.getElementById(h.id)).filter(Boolean);
    if (elements.length === 0) return undefined;
    const update = () => {
      // The last heading that has passed the upper third of the screen is the one being read.
      const line = window.innerHeight * 0.33;
      let current = elements[0].id;
      for (const el of elements) if (el.getBoundingClientRect().top <= line) current = el.id;
      setActive(current);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [headings]);

  if (headings.length === 0) return null;
  return (
    <nav aria-label="In this article" className={className}>
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">In this article</p>
      <ol className="mt-4 space-y-1 border-l border-gold/20">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={active === heading.id ? 'location' : undefined}
              onClick={(event) => {
                event.preventDefault();
                scrollToTarget(lenis, `#${heading.id}`, { offset: -110 });
                // Keep the router's history state; only the hash changes.
                window.history.replaceState(window.history.state, '', `#${heading.id}`);
              }}
              className={cn(
                '-ml-px block border-l-2 py-1.5 pl-4 text-sm leading-snug transition-colors duration-300',
                active === heading.id ? 'border-gold text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
