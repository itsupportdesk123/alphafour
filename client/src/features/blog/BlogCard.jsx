import { ArrowUpRight, CalendarDays, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SmartImage } from '@/components/common/SmartImage';
import { categoryLabel, formatArticleDate } from '@/data/blogs';
import { cn } from '@/lib/utils';

const isPhotoId = (cover) => !cover.startsWith('/');

/** A cover from either source: an Unsplash id (responsive srcset) or a file in public/. Pass alt="" inside a link that already names the article. */
export function ArticleImage({ article, alt = article.coverAlt, className, imgClassName, ratio = 4 / 3, sizes, widths, priority }) {
  return (
    <SmartImage
      photo={isPhotoId(article.cover) ? article.cover : undefined}
      src={isPhotoId(article.cover) ? undefined : article.cover}
      alt={alt}
      ratio={ratio}
      sizes={sizes}
      widths={widths}
      priority={priority}
      className={className}
      imgClassName={imgClassName}
    />
  );
}

/** Date and reading time. */
export function ArticleMeta({ article, className }) {
  return (
    <p className={cn('flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground [[data-tone=dark]_&]:text-ivory/70', className)}>
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="size-3.5 text-gold-ink dark:text-gold [[data-tone=dark]_&]:text-gold" aria-hidden />
        <time dateTime={article.date}>{formatArticleDate(article.date)}</time>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock className="size-3.5 text-gold-ink dark:text-gold [[data-tone=dark]_&]:text-gold" aria-hidden />
        {article.minutes} min read
      </span>
    </p>
  );
}

export function CategoryTag({ category, className }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border border-gold/35 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-gold-ink dark:text-gold [[data-tone=dark]_&]:text-gold', className)}>
      {categoryLabel(category)}
    </span>
  );
}

/** Article card: the whole card is one link (the title), with the image zooming on hover. */
export function BlogCard({ article, headingLevel: Heading = 'h3', className }) {
  return (
    <article
      className={cn(
        'group relative flex h-full flex-col rounded-[1.75rem] border border-gold/15 bg-card p-3 transition-[transform,box-shadow,border-color] duration-700 ease-luxe hover:-translate-y-1 hover:border-gold/40 hover:shadow-luxe focus-within:border-gold/50',
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-[1.35rem]">
        <ArticleImage
          article={article}
          sizes="(min-width: 1280px) 26rem, (min-width: 640px) 50vw, 100vw"
          widths={[480, 768, 1080]}
          imgClassName="transition-transform [transition-duration:1400ms] ease-luxe group-hover:scale-[1.06]"
        />
        <span className="absolute left-3 top-3 rounded-full border border-white/25 bg-navy/75 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-ivory backdrop-blur-md">
          {categoryLabel(article.category)}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-6">
        <ArticleMeta article={article} />
        <Heading className="mt-3 text-balance font-display text-[1.6rem] leading-[1.15]">
          <Link
            to={`/blogs/${article.slug}`}
            className="transition-colors after:absolute after:inset-0 after:rounded-[1.75rem] after:content-[''] hover:text-gold-ink focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring dark:hover:text-gold"
          >
            {article.title}
          </Link>
        </Heading>
        <p className="mt-3 line-clamp-3 text-[0.95rem] leading-relaxed text-muted-foreground">{article.excerpt}</p>
        <span aria-hidden className="mt-auto inline-flex items-center gap-2 pt-6 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gold-ink dark:text-gold">
          Read article
          <ArrowUpRight className="size-4 transition-transform duration-500 ease-luxe group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
