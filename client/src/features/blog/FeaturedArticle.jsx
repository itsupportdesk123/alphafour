import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Reveal } from '@/components/common/Reveal';
import { Eyebrow, Section } from '@/components/common/Section';
import { Button } from '@/components/ui/button';
import { ArticleImage, ArticleMeta, CategoryTag } from '@/features/blog/BlogCard';
import { fadeUp, stagger, viewportOnce } from '@/lib/motion';

/** Editor's pick: a large photograph beside the story, split like a magazine spread. */
export function FeaturedArticle({ article }) {
  const href = `/blogs/${article.slug}`;
  return (
    <Section id="featured" aria-labelledby="featured-title" className="scroll-mt-0">
      <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16 xl:gap-20">
        <Reveal>
          <Link to={href} tabIndex={-1} aria-hidden className="group relative block overflow-hidden rounded-[2rem] shadow-luxe" data-cursor="Read">
            <ArticleImage
              article={article}
              alt=""
              ratio={16 / 11}
              sizes="(min-width: 1024px) 55vw, 100vw"
              widths={[768, 1080, 1600]}
              imgClassName="transition-transform [transition-duration:1600ms] ease-luxe group-hover:scale-[1.05]"
            />
            <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-gold/20" />
          </Link>
        </Reveal>
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <motion.div variants={fadeUp}>
            <Eyebrow>Featured article</Eyebrow>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center gap-4">
            <CategoryTag category={article.category} />
            <ArticleMeta article={article} />
          </motion.div>
          <motion.h2 variants={fadeUp} id="featured-title" className="mt-6 text-balance text-display-lg">
            {article.title}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {article.excerpt}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-9">
            <Button asChild size="lg">
              <Link to={href}>
                Read more
                <span className="sr-only">: {article.title}</span>
                <ArrowRight className="transition-transform duration-500 ease-luxe group-hover/btn:translate-x-1" aria-hidden />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}
