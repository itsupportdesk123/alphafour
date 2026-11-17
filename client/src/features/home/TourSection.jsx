import { motion } from 'framer-motion';
import { Rotate3d } from 'lucide-react';
import { lazy, useState } from 'react';
import { Link } from 'react-router-dom';
import { LazyMount } from '@/components/common/LazyMount';
import { Section, SectionHeading } from '@/components/common/Section';
import { Spotlight } from '@/components/effects/Spotlight';
import { Button } from '@/components/ui/button';
import { TOUR_SCENES } from '@/data/tour';
import { EASE_LUXE } from '@/lib/motion';

const PanoramaViewer = lazy(() => import('@/features/tour/PanoramaViewer'));

/** 360° virtual tour: click-to-start (keeps the page light), then a full room-to-room tour. */
export function TourSection() {
  const [started, setStarted] = useState(false);
  const first = TOUR_SCENES[0];

  return (
    <Section id="virtual-tour" tone="navy">
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-40" />
      <SectionHeading
        eyebrow="360° virtual tour"
        title={
          <>
            Walk through before you <em className="italic text-gold">walk in</em>
          </>
        }
        description="Seven photographic rooms, linked like the real residence. Drag to look around, follow the gold arrows from room to room, or go full screen."
        actions={
          <Button asChild variant="outline-light">
            <Link to="/virtual-tour">Open full tour</Link>
          </Button>
        }
      />
      {started ? (
        <LazyMount minHeight="62vh">
          <PanoramaViewer />
        </LazyMount>
      ) : (
        <motion.button
          type="button"
          onClick={() => setStarted(true)}
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.6, ease: EASE_LUXE }}
          className="group relative block h-[62vh] min-h-[380px] w-full overflow-hidden rounded-[1.75rem] border border-gold/25 text-left shadow-luxe"
          aria-label="Start the 360° virtual tour"
          data-cursor="Start"
        >
          <img src={first.panorama} alt="" loading="lazy" className="absolute inset-0 size-full scale-110 object-cover object-[50%_45%] transition-transform [transition-duration:2400ms] ease-luxe group-hover:scale-125" />
          <span className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-navy/10" />
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-ivory">
            <span className="relative inline-flex size-24 items-center justify-center rounded-full bg-gold-foil text-navy shadow-gold-glow">
              <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-full border border-gold" />
              <Rotate3d className="size-10" strokeWidth={1.25} aria-hidden />
            </span>
            <span className="font-display text-3xl">Start the 360° tour</span>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
              {TOUR_SCENES.length} rooms · fullscreen · gyroscope ready
            </span>
          </span>
        </motion.button>
      )}
    </Section>
  );
}
