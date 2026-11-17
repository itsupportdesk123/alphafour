import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { Container, Section, SectionHeading } from '@/components/common/Section';
import { Seo } from '@/components/common/Seo';
import { Button } from '@/components/ui/button';
import { site } from '@/config/site';
import { adjacentArticles, categoryLabel, coverUrl, getArticle, relatedArticles } from '@/data/blogs';
import { ArticleBody } from '@/features/blog/ArticleBody';
import { parseArticle } from '@/features/blog/parseArticle';
import { ArticleToc } from '@/features/blog/ArticleToc';
import { ArticleImage, ArticleMeta, BlogCard, CategoryTag } from '@/features/blog/BlogCard';
import { ShareArticle } from '@/features/blog/ShareArticle';
import { EASE_LUXE } from '@/lib/motion';
import { cn } from '@/lib/utils';
import NotFoundPage from '@/pages/NotFoundPage';

function AdjacentLink({ article, label, next = false }) {
  return (
    <Link
      to={`/blogs/${article.slug}`}
      rel={next ? 'next' : 'prev'}
      className={cn('group flex items-center gap-5 rounded-[1.5rem] border border-gold/15 p-4 transition-[border-color,box-shadow] duration-500 hover:border-gold/45 hover:shadow-luxe', next && 'md:flex-row-reverse md:text-right')}
    >
      <ArticleImage article={article} alt="" ratio={1} sizes="6rem" widths={[240]} className="size-20 shrink-0 rounded-2xl" imgClassName="transition-transform [transition-duration:1400ms] ease-luxe group-hover:scale-110" />
      <span className="min-w-0">
        <span className={cn('inline-flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold-ink dark:text-gold', next && 'md:flex-row-reverse')}>
          {next ? <ArrowRight className="size-3.5" aria-hidden /> : <ArrowLeft className="size-3.5" aria-hidden />}
          {label}
        </span>
        <span className="mt-2 line-clamp-2 block font-display text-xl leading-tight">{article.title}</span>
      </span>
    </Link>
  );
}

export default function BlogArticlePage() {
  const { slug } = useParams();
  const reduce = useReducedMotion();
  const article = getArticle(slug);
  const blocks = useMemo(() => (article ? parseArticle(article.body) : []), [article]);
  if (!article) return <NotFoundPage />;

  const headings = blocks.filter((b) => b.type === 'h2');
  const { previous, next } = adjacentArticles(article.slug);
  const related = relatedArticles(article, 3);
  const url = `${site.url}/blogs/${article.slug}`;
  const section = categoryLabel(article.category);
  const rise = (delay) => (reduce ? {} : { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 }, transition: { duration: 1, ease: EASE_LUXE, delay } });

  const postingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    image: [coverUrl(article, site.url)],
    datePublished: article.date,
    dateModified: article.date,
    articleSection: section,
    wordCount: article.words,
    inLanguage: 'en-IN',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Organization', name: site.name, url: site.url },
    publisher: { '@type': 'Organization', name: site.name, url: site.url, logo: { '@type': 'ImageObject', url: `${site.url}/apple-touch-icon.png` } },
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
      { '@type': 'ListItem', position: 2, name: 'Blogs', item: `${site.url}/blogs` },
      { '@type': 'ListItem', position: 3, name: article.title, item: url },
    ],
  };

  return (
    <>
      <Seo title={article.seoTitle} description={article.description} path={`/blogs/${article.slug}`} image={coverUrl(article, site.url)} type="article" jsonLd={[postingSchema, breadcrumbSchema]} />
      <Helmet>
        <meta property="article:published_time" content={`${article.date}T09:00:00+05:30`} />
        <meta property="article:section" content={section} />
      </Helmet>

      <article aria-labelledby="article-title">
        <header data-tone="dark" data-nav-dark className="relative isolate overflow-hidden bg-navy text-ivory">
          <motion.div className="absolute inset-0 -z-10" {...(reduce ? {} : { initial: { scale: 1.12 }, animate: { scale: 1 }, transition: { duration: 2.2, ease: EASE_LUXE } })}>
            <ArticleImage article={article} ratio={null} className="size-full" sizes="100vw" widths={[768, 1080, 1600, 2200]} priority />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-navy/75 via-navy/45 to-navy" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-navy/70 to-transparent" />
          </motion.div>
          <Container className="flex min-h-[78svh] flex-col justify-end pb-14 pt-36 md:pb-20">
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex flex-wrap items-center gap-2 text-xs text-ivory/70">
                <li>
                  <Link to="/" className="hover:text-gold">
                    Home
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3" aria-hidden />
                  <Link to="/blogs" className="hover:text-gold">
                    Blogs
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3" aria-hidden />
                  <Link to={`/blogs?category=${article.category}`} className="hover:text-gold">
                    {section}
                  </Link>
                </li>
              </ol>
            </nav>
            <motion.div {...rise(0.2)}>
              <CategoryTag category={article.category} className="border-gold/50 bg-navy/30 backdrop-blur-md" />
            </motion.div>
            <motion.h1 id="article-title" className="mt-6 max-w-5xl text-balance text-display-xl" {...rise(0.35)}>
              {article.title}
            </motion.h1>
            <motion.div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3" {...rise(0.55)}>
              <ArticleMeta article={article} className="text-sm" />
              <span className="text-sm text-ivory/70">By the Alphafour Journal team</span>
            </motion.div>
          </Container>
        </header>

        <Container className="py-16 md:py-24">
          <div className="grid gap-12 xl:grid-cols-[12rem_minmax(0,46rem)_12rem] xl:justify-center">
            <aside className="hidden xl:block">
              <div className="sticky top-32 space-y-10">
                <ArticleToc headings={headings} />
                <ShareArticle title={article.title} url={url} />
              </div>
            </aside>

            <div className="mx-auto w-full min-w-0 max-w-[46rem]">
              <p className="text-balance font-display text-[1.6rem] leading-snug text-foreground sm:text-[2rem]">{article.excerpt}</p>

              <div className="my-10 space-y-6 border-y border-gold/15 py-6 xl:hidden">
                {headings.length > 0 && (
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-[0.68rem] font-semibold uppercase tracking-[0.2em] [&::-webkit-details-marker]:hidden">
                      In this article · {headings.length} sections
                      <ChevronDown className="size-4 transition-transform duration-300 group-open:rotate-180" aria-hidden />
                    </summary>
                    <ArticleToc headings={headings} className="mt-5 [&>p]:sr-only" />
                  </details>
                )}
                <ShareArticle title={article.title} url={url} />
              </div>
              <div aria-hidden className="hairline my-12 hidden xl:block" />

              <ArticleBody blocks={blocks} />

              <footer className="mt-16 flex flex-col gap-8 border-t border-gold/15 pt-10 sm:flex-row sm:items-center sm:justify-between">
                <ShareArticle title={article.title} url={url} />
                <Button asChild variant="outline">
                  <Link to="/blogs">
                    <ArrowLeft aria-hidden /> Back to Blogs
                  </Link>
                </Button>
              </footer>
            </div>
          </div>
        </Container>
      </article>

      {(previous || next) && (
        <nav aria-label="Previous and next articles" className="border-t border-gold/15">
          <Container className="grid gap-5 py-12 md:grid-cols-2">
            {previous ? <AdjacentLink article={previous} label="Previous article" /> : <span className="hidden md:block" />}
            {next && <AdjacentLink article={next} label="Next article" next />}
          </Container>
        </nav>
      )}

      {related.length > 0 && (
        <Section tone="surface" aria-labelledby="related-title">
          <SectionHeading
            id="related-title"
            eyebrow="Keep reading"
            title="Related articles"
            actions={
              <Button asChild variant="outline">
                <Link to="/blogs">All articles</Link>
              </Button>
            }
          />
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <BlogCard article={item} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
