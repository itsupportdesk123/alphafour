import { Seo } from '@/components/common/Seo';
import { HeroScroll } from '@/features/hero/HeroScroll';
import { FeaturedSection } from '@/features/home/FeaturedSection';
import { IntroSection } from '@/features/home/IntroSection';
import {
  AmenitiesSection,
  EmiSection,
  FloorPlansSection,
  GallerySection,
  GroupSection,
  LocationSection,
  SiteVisitSection,
  TestimonialsSection,
} from '@/features/home/MoreSections';
import { StatsSection } from '@/features/home/StatsSection';
import { TourSection } from '@/features/home/TourSection';
import { FLAGSHIP } from '@/data/residences';
import { organizationSchema } from '@/lib/seo';
import { FEATURES, site } from '@/config/site';

const flagshipSchema = {
  '@context': 'https://schema.org',
  '@type': 'Residence',
  name: FLAGSHIP.name,
  description: FLAGSHIP.description.split('\n')[0],
  address: { '@type': 'PostalAddress', streetAddress: FLAGSHIP.address, addressLocality: FLAGSHIP.city, addressCountry: 'IN' },
  geo: { '@type': 'GeoCoordinates', latitude: FLAGSHIP.coordinates[0], longitude: FLAGSHIP.coordinates[1] },
  url: `${site.url}/residences/${FLAGSHIP.slug}`,
};

export default function HomePage() {
  return (
    <>
      <Seo jsonLd={[organizationSchema(), flagshipSchema]} />
      <HeroScroll />
      <IntroSection />
      <StatsSection />
      <FeaturedSection />
      <TourSection />
      <AmenitiesSection />
      {FEATURES.floorPlans && <FloorPlansSection />}
      <GallerySection />
      <LocationSection />
      <TestimonialsSection />
      <EmiSection />
      <GroupSection />
      <SiteVisitSection />
    </>
  );
}
