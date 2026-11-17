import { site } from '@/config/site';

/** JSON-LD for the brand (RealEstateAgent / Organization). */
export const organizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: site.name,
  url: site.url,
  logo: `${site.url}/favicon.svg`,
  image: `${site.url}/og-image.jpg`,
  telephone: site.contact.phone,
  email: site.contact.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${site.address.line1}, ${site.address.line2}`,
    addressLocality: site.address.city,
    addressRegion: site.address.region,
    postalCode: site.address.postalCode,
    addressCountry: 'IN',
  },
  geo: { '@type': 'GeoCoordinates', latitude: site.address.coordinates[0], longitude: site.address.coordinates[1] },
  openingHours: 'Mo-Su 10:00-19:00',
  sameAs: Object.values(site.social),
});
