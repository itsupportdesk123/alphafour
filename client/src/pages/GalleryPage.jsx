import { Rotate3d } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Section } from '@/components/common/Section';
import { Seo } from '@/components/common/Seo';
import { PageHero } from '@/components/layout/PageHero';
import { Button } from '@/components/ui/button';
import { GALLERY, GALLERY_FILTERS } from '@/data/gallery';
import MasonryGallery from '@/features/gallery/MasonryGallery';
import { PHOTOS } from '@/lib/media';

export default function GalleryPage() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('category');
  const initial = GALLERY_FILTERS.some((f) => f.value === requested) ? requested : 'all';

  return (
    <>
      <Seo title="Gallery" description="Photographs of residences, interiors, amenities and views by Alphafour Infrastructure Pvt Ltd." path="/gallery" />
      <PageHero
        eyebrow="Gallery"
        title={
          <>
            Light, stone and <em className="italic text-gold">silence</em>
          </>
        }
        description="Exteriors at golden hour, interiors in morning light, amenities after dark and the views that come with every home."
        photo={PHOTOS.poolPalmsDusk}
        breadcrumbs={[{ label: 'Gallery' }]}
      />
      <Section tone="navy" className="!pt-14">
        <MasonryGallery
          items={GALLERY}
          initialFilter={initial}
          onFilterChange={(value) => setParams(value === 'all' ? {} : { category: value }, { replace: true, preventScrollReset: true })}
        />
        <div className="glass-dark mt-16 flex flex-col items-center justify-between gap-6 rounded-[2rem] p-8 text-ivory sm:flex-row">
          <div className="flex items-center gap-5">
            <span className="inline-flex size-14 items-center justify-center rounded-full bg-gold-foil text-navy">
              <Rotate3d className="size-7" strokeWidth={1.25} aria-hidden />
            </span>
            <div>
              <p className="font-display text-2xl">Prefer to look around?</p>
              <p className="text-sm text-ivory/70">Walk seven photographic rooms in our 360° virtual tour.</p>
            </div>
          </div>
          <Button asChild>
            <Link to="/virtual-tour">Start the tour</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
