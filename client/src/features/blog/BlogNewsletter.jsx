import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { Eyebrow, Section } from '@/components/common/Section';
import { NewsletterForm } from '@/components/forms/LeadForms';
import { fadeUp, stagger, viewportOnce } from '@/lib/motion';

/** Sign-up for the journal. It uses the site's existing newsletter form and service, tagged so the team knows where it came from. */
export function BlogNewsletter() {
  return (
    <Section id="newsletter" aria-labelledby="newsletter-title">
      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="glass relative mx-auto grid max-w-5xl gap-10 overflow-hidden rounded-[2.25rem] p-8 sm:p-12 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-14 lg:p-16"
      >
        <span aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-gold/15 blur-3xl" />
        <div className="relative">
          <motion.div variants={fadeUp}>
            <Eyebrow>Stay updated</Eyebrow>
          </motion.div>
          <motion.h2 variants={fadeUp} id="newsletter-title" className="mt-5 text-balance text-display-md">
            Stay Ahead of What Shapes <em className="italic text-gold-ink dark:text-gold">Tomorrow.</em>
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-5 text-pretty leading-relaxed text-muted-foreground">
            Get the latest perspectives on real estate, architecture, construction, and infrastructure.
          </motion.p>
        </div>
        <motion.div variants={fadeUp} className="relative">
          <span aria-hidden className="mb-5 inline-flex size-12 items-center justify-center rounded-full bg-gold-foil text-navy">
            <Mail className="size-5" />
          </span>
          <NewsletterForm tone="light" source="blogs/newsletter" />
        </motion.div>
      </motion.div>
    </Section>
  );
}
