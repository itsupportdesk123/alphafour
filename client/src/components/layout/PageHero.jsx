import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container, Eyebrow } from '@/components/common/Section';
import { SmartImage } from '@/components/common/SmartImage';
import { Parallax } from '@/components/common/Reveal';
import { EASE_LUXE } from '@/lib/motion';

/**
 * Dark cinematic page header used by every inner page: a full-screen photograph, as on the Blogs page,
 * with the title at the bottom. Pass `photo` (Unsplash id) or `image` (local file).
 */
export function PageHero({ eyebrow, title, description, photo, image, breadcrumbs = [], children }) {
  return (
    <section data-tone="dark" data-nav-dark className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-navy text-ivory">
      {(photo || image) && (
        <div aria-hidden className="absolute inset-0 -z-10">
          <Parallax speed={0.1} className="absolute inset-[-10%_0]">
            <SmartImage photo={photo} src={image} alt="" ratio={undefined} className="size-full" sizes="100vw" priority />
          </Parallax>
          {/* Same shading as the Blogs header: the photograph reads clearly, the text keeps its contrast. */}
          <div className="absolute inset-0 bg-gradient-to-b from-navy/75 via-navy/40 to-navy" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/85 via-navy/35 to-transparent" />
        </div>
      )}
      <Container className="flex flex-1 flex-col justify-end pb-12 pt-32 md:pb-16 md:pt-40">
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-xs text-ivory/70">
              <li>
                <Link to="/" className="hover:text-gold">
                  Home
                </Link>
              </li>
              {breadcrumbs.map((crumb) => (
                <li key={crumb.label} className="flex items-center gap-2">
                  <ChevronRight className="size-3" aria-hidden />
                  {crumb.href ? (
                    <Link to={crumb.href} className="hover:text-gold">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-ivory">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: EASE_LUXE, delay: 0.2 }}>
          {eyebrow && <Eyebrow tone="dark">{eyebrow}</Eyebrow>}
          <h1 className="mt-6 max-w-4xl text-balance text-display-xl">{title}</h1>
          {description && <p className="mt-6 max-w-2xl text-lg text-ivory/80 md:text-xl">{description}</p>}
          {children}
        </motion.div>
      </Container>
    </section>
  );
}
