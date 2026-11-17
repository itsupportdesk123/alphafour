import { Helmet } from 'react-helmet-async';
import { site } from '@/config/site';

/** Per-page title, description, canonical, Open Graph and JSON-LD. */
export function Seo({ title, description = site.description, path = '/', image = '/og-image.jpg', type = 'website', jsonLd }) {
  const fullTitle = title ? `${title} · ${site.name}` : `${site.name} · ${site.tagline}`;
  const url = `${site.url}${path}`;
  const imageUrl = image.startsWith('http') ? image : `${site.url}${image}`;
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
