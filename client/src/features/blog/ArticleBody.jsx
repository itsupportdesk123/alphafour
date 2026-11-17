import { Link } from 'react-router-dom';
import { SmartImage } from '@/components/common/SmartImage';
import { resolvePhoto } from '@/data/blogs';
import { cn } from '@/lib/utils';

/** Sizes of the local images articles may use, so the page reserves their space before they load. */
const LOCAL_SIZES = {
  '/assets/projects/av-ramana-towers/night.webp': [1024, 1024],
  '/assets/projects/av-ramana-towers/day.webp': [1024, 1024],
  '/assets/projects/av-ramana-towers/plan-typical.webp': [3832, 2416],
  '/assets/projects/av-ramana-towers/plan-stilt.webp': [3832, 2416],
};

const INLINE = String.raw`\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)`;
const linkClass = 'font-medium text-gold-ink underline decoration-gold/40 underline-offset-4 transition-colors hover:decoration-gold dark:text-gold';

/** **bold**, *italic* and [links](/path), rendered as elements (never as HTML). */
export function Inline({ text }) {
  const pattern = new RegExp(INLINE, 'g');
  const parts = [];
  let last = 0;
  let m;
  while ((m = pattern.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const key = m.index;
    if (m[1] !== undefined) {
      parts.push(
        <strong key={key} className="font-semibold text-foreground">
          <Inline text={m[1]} />
        </strong>,
      );
    } else if (m[2] !== undefined) {
      parts.push(<em key={key}>{m[2]}</em>);
    } else {
      const href = m[4];
      parts.push(
        href.startsWith('/') ? (
          <Link key={key} to={href} className={linkClass}>
            <Inline text={m[3]} />
          </Link>
        ) : (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
            <Inline text={m[3]} />
          </a>
        ),
      );
    }
    last = pattern.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function Figure({ src: key, alt, caption }) {
  const src = resolvePhoto(key);
  if (!src) return null;
  const local = src.startsWith('/');
  const [width, height] = LOCAL_SIZES[src] ?? [];
  return (
    <figure className="my-12 lg:-mx-10">
      {local ? (
        <img
          src={src}
          width={width}
          height={height}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={cn('mx-auto block h-auto w-auto max-w-full rounded-[1.5rem] border border-gold/20', src.includes('/plan-') ? 'w-full bg-white' : 'max-h-[34rem]')}
        />
      ) : (
        <SmartImage photo={src} alt={alt} ratio={16 / 10} sizes="(min-width: 1024px) 52rem, 100vw" widths={[480, 768, 1080, 1600]} className="rounded-[1.5rem]" />
      )}
      {caption && (
        <figcaption className="mt-4 flex gap-3 text-sm leading-relaxed text-muted-foreground lg:px-10">
          <span aria-hidden className="mt-2.5 h-px w-6 shrink-0 bg-gold" />
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** The article text, typeset for long reading in both themes. */
export function ArticleBody({ blocks }) {
  let firstParagraph = true;
  return (
    <div className="text-[1.0625rem] leading-[1.85] text-foreground/85 sm:text-lg">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'h2':
            return (
              <h2 key={index} id={block.id} className="mb-5 mt-16 scroll-mt-32 text-balance font-display text-[2rem] leading-tight text-foreground sm:text-[2.35rem]">
                {block.text}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={index} id={block.id} className="mb-3 mt-10 scroll-mt-32 font-display text-2xl leading-snug text-foreground">
                {block.text}
              </h3>
            );
          case 'ul':
            return (
              <ul key={index} className="my-7 space-y-3">
                {block.items.map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <span aria-hidden className="mt-[0.8em] size-1.5 shrink-0 rotate-45 bg-gold" />
                    <span>
                      <Inline text={item} />
                    </span>
                  </li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={index} className="my-8 space-y-5">
                {block.items.map((item, i) => (
                  <li key={i} className="flex gap-5">
                    <span aria-hidden className="w-8 shrink-0 pt-0.5 font-display text-2xl leading-none text-gold-ink lining-nums dark:text-gold">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>
                      <Inline text={item} />
                    </span>
                  </li>
                ))}
              </ol>
            );
          case 'quote':
            return (
              <blockquote key={index} className="my-12 border-l-2 border-gold py-1 pl-6 font-display text-[1.75rem] italic leading-snug text-foreground sm:pl-8 sm:text-[2.1rem]">
                <Inline text={block.text} />
              </blockquote>
            );
          case 'figure':
            return <Figure key={index} {...block} />;
          default: {
            const lead = firstParagraph;
            firstParagraph = false;
            return (
              <p
                key={index}
                className={cn(
                  'mb-6',
                  lead &&
                    'first-letter:float-left first-letter:mr-3 first-letter:mt-1.5 first-letter:font-display first-letter:text-[4.6rem] first-letter:leading-[0.78] first-letter:text-gold-ink dark:first-letter:text-gold',
                )}
              >
                <Inline text={block.text} />
              </p>
            );
          }
        }
      })}
    </div>
  );
}
