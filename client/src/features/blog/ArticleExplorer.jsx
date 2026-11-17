import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Section, SectionHeading } from '@/components/common/Section';
import { Button } from '@/components/ui/button';
import { BLOG_CATEGORIES } from '@/data/blogs';
import { BlogCard } from '@/features/blog/BlogCard';
import { EASE_LUXE } from '@/lib/motion';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 6;

/** Category filters and the article grid. The chosen category lives in ?category= so a filtered view can be shared. */
export function ArticleExplorer({ articles }) {
  const reduce = useReducedMotion();
  const [params, setParams] = useSearchParams();
  const requested = params.get('category');
  const category = BLOG_CATEGORIES.some((c) => c.value === requested) ? requested : 'all';
  const [limit, setLimit] = useState(PAGE_SIZE);

  const filtered = useMemo(() => (category === 'all' ? articles : articles.filter((a) => a.category === category)), [articles, category]);
  const shown = filtered.slice(0, limit);
  const counts = useMemo(() => Object.fromEntries(BLOG_CATEGORIES.map((c) => [c.value, c.value === 'all' ? articles.length : articles.filter((a) => a.category === c.value).length])), [articles]);

  const choose = (value) => {
    setLimit(PAGE_SIZE);
    setParams(value === 'all' ? {} : { category: value }, { replace: true, preventScrollReset: true });
  };

  return (
    <Section id="articles" tone="surface" aria-labelledby="articles-title">
      <SectionHeading
        id="articles-title"
        eyebrow="Explore categories"
        title={
          <>
            Latest <em className="italic text-gold-ink dark:text-gold">articles</em>
          </>
        }
        description="Real estate, architecture, construction and infrastructure, written from Chennai for people who build, buy and invest."
      />

      <div role="group" aria-label="Filter articles by category" className="no-scrollbar -mx-5 mb-12 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {BLOG_CATEGORIES.map((option) => {
          const active = option.value === category;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => choose(option.value)}
              className={cn(
                'relative inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-500',
                active ? 'border-transparent text-navy' : 'border-gold/30 text-foreground/80 hover:border-gold hover:text-gold-ink dark:hover:text-gold',
              )}
            >
              {active && (
                <motion.span
                  layoutId="blog-category-pill"
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-gold-foil shadow-gold-glow"
                  transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 34 }}
                />
              )}
              <span className="relative">{option.label}</span>
              <span className={cn('relative text-[0.6rem]', active ? 'text-navy' : 'opacity-60')}>{counts[option.value]}</span>
            </button>
          );
        })}
      </div>

      {/* A new list per category (as on the gallery page): the old one fades out, the new one rises in. Load more adds to the current list. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.ul
          key={category}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_LUXE } }}
          exit={reduce ? undefined : { opacity: 0, transition: { duration: 0.25 } }}
          className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
        >
          {shown.map((article, i) => (
            <motion.li
              key={article.slug}
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.8, ease: EASE_LUXE, delay: (i % PAGE_SIZE % 3) * 0.08 }}
            >
              <BlogCard article={article} />
            </motion.li>
          ))}
        </motion.ul>
      </AnimatePresence>

      <div className="mt-14 flex flex-col items-center gap-5">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          Showing {shown.length} of {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
        </p>
        {shown.length < filtered.length && (
          <Button variant="outline" size="lg" onClick={() => setLimit((n) => n + PAGE_SIZE)}>
            Load more articles
          </Button>
        )}
      </div>
    </Section>
  );
}
