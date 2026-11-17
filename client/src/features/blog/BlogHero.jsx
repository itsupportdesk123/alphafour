import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Parallax } from '@/components/common/Reveal';
import { Container, Eyebrow } from '@/components/common/Section';
import { SmartImage } from '@/components/common/SmartImage';
import { ArticleImage, ArticleMeta } from '@/features/blog/BlogCard';
import { PHOTOS } from '@/lib/media';
import { EASE_LUXE } from '@/lib/motion';
import { scrollToTarget, useLenis } from '@/providers/SmoothScrollProvider';

const HEADLINE = ['Perspectives', 'That', 'Shape'];

/** Full-height editorial header: the photograph opens out, the headline rises word by word. */
export function BlogHero({ teaser }) {
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const rise = (delay) => (reduce ? {} : { initial: { y: '110%' }, animate: { y: '0%' }, transition: { duration: 1.1, ease: EASE_LUXE, delay } });
  const fade = (delay) => (reduce ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 1, ease: EASE_LUXE, delay } });

  return (
    <section data-tone="dark" data-nav-dark aria-labelledby="blogs-title" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-navy text-ivory">
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10"
        {...(reduce
          ? {}
          : {
              initial: { clipPath: 'inset(14% 10% 14% 10% round 2.5rem)', scale: 1.08 },
              animate: { clipPath: 'inset(0% 0% 0% 0% round 0rem)', scale: 1 },
              transition: { duration: 1.8, ease: EASE_LUXE },
            })}
      >
        <Parallax speed={0.1} className="absolute inset-[-10%_0]">
          <SmartImage photo={PHOTOS.glassTowersGold} alt="" className="size-full" sizes="100vw" priority />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-b from-navy/75 via-navy/40 to-navy" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/85 via-navy/35 to-transparent" />
      </motion.div>

      <Container className="flex flex-1 flex-col justify-end pb-12 pt-32 md:pb-16 md:pt-40">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-xs text-ivory/70">
            <li>
              <Link to="/" className="hover:text-gold">
                Home
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="size-3" aria-hidden />
              <span aria-current="page" className="text-ivory">
                Blogs
              </span>
            </li>
          </ol>
        </nav>
        <motion.div {...fade(0.3)}>
          <Eyebrow tone="dark">Alphafour Journal</Eyebrow>
        </motion.div>
        <h1 id="blogs-title" className="mt-6 max-w-5xl text-display-2xl">
          {/* Plain spaces between the word masks, so the headline can still wrap on narrow screens. */}
          {HEADLINE.map((word, i) => (
            <Fragment key={word}>
              <span className="inline-block overflow-hidden pb-[0.06em] align-bottom">
                <motion.span className="inline-block" {...rise(0.45 + i * 0.09)}>
                  {word}
                </motion.span>
              </span>{' '}
            </Fragment>
          ))}
          <span className="inline-block overflow-hidden pb-[0.12em] pr-[0.08em] align-bottom">
            <motion.em className="inline-block italic text-gold" {...rise(0.45 + HEADLINE.length * 0.09)}>
              Tomorrow.
            </motion.em>
          </span>
        </h1>
        <motion.p className="mt-7 max-w-2xl text-pretty text-lg text-ivory/80 md:text-xl" {...fade(0.95)}>
          Explore ideas, innovations, and insights shaping the future of real estate, architecture, construction, and infrastructure.
        </motion.p>

        <motion.div className="mt-12 flex flex-col-reverse gap-10 md:mt-16 lg:flex-row lg:items-end lg:justify-between" {...fade(1.2)}>
          <a
            href="#featured"
            onClick={(event) => {
              event.preventDefault();
              scrollToTarget(lenis, '#featured', { offset: -24 });
            }}
            className="group inline-flex items-center gap-4 self-start text-micro uppercase text-ivory/75 transition-colors hover:text-gold"
          >
            <span aria-hidden className="relative h-14 w-px overflow-hidden bg-ivory/25">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-cue bg-gold" />
            </span>
            Scroll to explore
          </a>

          {teaser && (
            <Link
              to={`/blogs/${teaser.slug}`}
              className="glass-dark group flex w-full max-w-xl items-center gap-5 rounded-[1.75rem] p-3 pr-5 transition-[border-color,box-shadow] duration-500 hover:border-gold/50 hover:shadow-gold-glow sm:p-4 sm:pr-6"
            >
              <ArticleImage
                article={teaser}
                alt=""
                ratio={1}
                sizes="7rem"
                widths={[240, 480]}
                className="size-20 shrink-0 rounded-2xl sm:size-24"
                imgClassName="transition-transform [transition-duration:1400ms] ease-luxe group-hover:scale-110"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-gold">Latest article</span>
                <span className="mt-1.5 line-clamp-2 block font-display text-xl leading-tight sm:text-2xl">{teaser.title}</span>
                <ArticleMeta article={teaser} className="mt-2 hidden sm:flex" />
              </span>
              <span className="hidden shrink-0 items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold sm:inline-flex">
                <span className="sr-only">Read article</span>
                <span aria-hidden className="inline-flex size-11 items-center justify-center rounded-full bg-gold-foil text-navy transition-transform duration-500 ease-luxe group-hover:translate-x-1">
                  <ArrowRight className="size-4" />
                </span>
              </span>
            </Link>
          )}
        </motion.div>
      </Container>
    </section>
  );
}
