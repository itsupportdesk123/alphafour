import { Hand, MousePointerClick, Rotate3d, Smartphone } from 'lucide-react';
import { lazy } from 'react';
import { LazyMount } from '@/components/common/LazyMount';
import { Container } from '@/components/common/Section';
import { Seo } from '@/components/common/Seo';
import { Button } from '@/components/ui/button';
import { TOUR_SCENES } from '@/data/tour';
import { useUiStore } from '@/store/ui';

const PanoramaViewer = lazy(() => import('@/features/tour/PanoramaViewer'));

const TIPS = [
  { icon: Hand, title: 'Drag to look', text: 'Click and drag, or swipe, to turn around the room.' },
  { icon: MousePointerClick, title: 'Follow the gold arrows', text: 'Each arrow takes you to the next room.' },
  { icon: Rotate3d, title: 'Tap the gold dots', text: 'Hotspots reveal finishes and details.' },
  { icon: Smartphone, title: 'Tilt your phone', text: 'Use the gyroscope button to look around by moving.' },
];

export default function VirtualTourPage() {
  const openDialog = useUiStore((s) => s.openDialog);
  return (
    <>
      <Seo title="360° virtual tour" description="Walk through Alphafour Altitude in 360°: grand atrium, living room, master suite, spa bath, clubhouse and sky lounge." path="/virtual-tour" />
      <section data-tone="dark" data-nav-dark className="bg-navy-depth pb-20 pt-32 text-ivory">
        <Container size="wide">
          <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="flex items-center gap-3 text-micro uppercase text-gold">
                <span className="h-px w-8 bg-gold/80" /> 360° virtual tour
              </p>
              <h1 className="mt-5 text-display-xl">
                Walk through before you <em className="italic text-gold">walk in</em>
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-ivory/75">
                {TOUR_SCENES.length} photographic rooms, linked like the real residence. Use fullscreen for the most immersive view.
              </p>
            </div>
            <Button size="lg" onClick={() => openDialog('site-visit', { residence: 'Alphafour Altitude', source: 'virtual-tour' })}>
              See it in person
            </Button>
          </div>
          <LazyMount minHeight="62vh" rootMargin="0px">
            <PanoramaViewer />
          </LazyMount>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TIPS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="glass-dark rounded-2xl p-5">
                <Icon className="size-6 text-gold" strokeWidth={1.5} aria-hidden />
                <p className="mt-3 font-display text-xl">{title}</p>
                <p className="mt-1 text-sm text-ivory/70">{text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
