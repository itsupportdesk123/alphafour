import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Section, SectionHeading } from '@/components/common/Section';
import { SmartImage } from '@/components/common/SmartImage';
import { getArticle, INSIGHT_TOPICS } from '@/data/blogs';
import { EASE_LUXE, fadeUp, stagger, viewportOnce } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Four themes in an editorial index: on wide screens a single photograph follows the theme
 * being read or pointed at; on phones each theme carries its own photograph.
 */
export function IndustryInsights() {
  const topics = INSIGHT_TOPICS.map((topic) => ({ ...topic, article: getArticle(topic.slug) })).filter((t) => t.article);
  const [active, setActive] = useState(0);
  const current = topics[active] ?? topics[0];
  if (!current) return null;

  return (
    <Section id="insights" tone="navy" data-nav-dark aria-labelledby="insights-title">
      <SectionHeading
        id="insights-title"
        eyebrow="Industry insights"
        title={
          <>
            The ideas shaping how we <em className="italic text-gold">build</em>
          </>
        }
        description="Four themes we follow closely, and the articles that explore each of them."
      />
      <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <div className="hidden lg:block">
          <div className="sticky top-28 overflow-hidden rounded-[2rem] border border-gold/20 shadow-glass-dark">
            <div className="relative aspect-[4/5]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={current.slug}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: EASE_LUXE }}
                >
                  <SmartImage photo={current.photo} alt={current.alt} className="size-full" sizes="40vw" widths={[768, 1080, 1600]} />
                </motion.div>
              </AnimatePresence>
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent" />
              <p aria-hidden className="absolute bottom-6 left-7 font-display text-7xl leading-none text-ivory/90 lining-nums">
                {String(active + 1).padStart(2, '0')}
                <span className="text-2xl text-gold"> / {String(topics.length).padStart(2, '0')}</span>
              </p>
            </div>
          </div>
        </div>

        <motion.ol variants={stagger(0.12)} initial="hidden" whileInView="show" viewport={viewportOnce} className="border-b border-white/15">
          {topics.map((topic, i) => (
            <motion.li
              key={topic.slug}
              variants={fadeUp}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className="group border-t border-white/15 py-9 first:pt-0 first:border-t-0 lg:first:pt-9 lg:first:border-t"
            >
              <SmartImage photo={topic.photo} alt={topic.alt} ratio={16 / 9} sizes="100vw" widths={[480, 768, 1080]} className="mb-7 rounded-[1.5rem] lg:hidden" />
              <div className="flex gap-6">
                <span aria-hidden className={cn('font-display text-3xl leading-none lining-nums transition-colors duration-500 sm:text-4xl', i === active ? 'text-gold' : 'text-ivory/35')}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className={cn('font-display text-display-sm transition-colors duration-500', i === active ? 'lg:text-ivory' : 'lg:text-ivory/70')}>{topic.title}</h3>
                  <p className="mt-4 max-w-xl text-pretty leading-relaxed text-ivory/70">{topic.body}</p>
                  <Link to={`/blogs/${topic.slug}`} className="link-luxe mt-6 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gold">
                    Read: {topic.article.title}
                    <ArrowUpRight className="size-4 shrink-0" aria-hidden />
                  </Link>
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </Section>
  );
}
