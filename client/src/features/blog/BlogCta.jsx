import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Parallax } from '@/components/common/Reveal';
import { Container, Eyebrow } from '@/components/common/Section';
import { SmartImage } from '@/components/common/SmartImage';
import { Button } from '@/components/ui/button';
import { PHOTOS } from '@/lib/media';
import { fadeUp, stagger, viewportOnce } from '@/lib/motion';

/** Closing call to action over a construction photograph, leading to the projects. */
export function BlogCta() {
  return (
    <section data-tone="dark" data-nav-dark aria-labelledby="blogs-cta-title" className="relative isolate overflow-hidden bg-navy text-ivory">
      <div aria-hidden className="absolute inset-0 -z-10">
        <Parallax speed={0.12} className="absolute inset-[-12%_0]">
          <SmartImage photo={PHOTOS.craneDusk} alt="" className="size-full" sizes="100vw" />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-b from-navy/85 via-navy/70 to-navy/90" />
      </div>
      <Container>
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={viewportOnce} className="mx-auto flex max-w-3xl flex-col items-center py-28 text-center md:py-40">
          <motion.div variants={fadeUp}>
            <Eyebrow tone="dark" withRule={false}>
              Our projects
            </Eyebrow>
          </motion.div>
          <motion.h2 variants={fadeUp} id="blogs-cta-title" className="mt-6 text-balance text-display-lg">
            Building Tomorrow Starts With Better <em className="italic text-gold">Perspectives.</em>
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-6 max-w-xl text-pretty text-lg text-ivory/75">
            Discover how ALPHAFOUR transforms ideas into meaningful developments.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10">
            <Button asChild size="lg">
              <Link to="/residences">
                Explore Our Projects
                <ArrowRight className="transition-transform duration-500 ease-luxe group-hover/btn:translate-x-1" aria-hidden />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
