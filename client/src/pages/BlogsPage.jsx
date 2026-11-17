import { Seo } from '@/components/common/Seo';
import { site } from '@/config/site';
import { ARTICLES, coverUrl, FEATURED_ARTICLE, LATEST_ARTICLE } from '@/data/blogs';
import { ArticleExplorer } from '@/features/blog/ArticleExplorer';
import { BlogCta } from '@/features/blog/BlogCta';
import { BlogHero } from '@/features/blog/BlogHero';
import { BlogNewsletter } from '@/features/blog/BlogNewsletter';
import { FeaturedArticle } from '@/features/blog/FeaturedArticle';
import { IndustryInsights } from '@/features/blog/IndustryInsights';
import { PHOTOS, unsplash } from '@/lib/media';

const DESCRIPTION = 'The Alphafour Journal: articles on real estate, architecture, construction and infrastructure, with a focus on Chennai and Tamil Nadu.';

export default function BlogsPage() {
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Alphafour Journal',
    description: DESCRIPTION,
    url: `${site.url}/blogs`,
    inLanguage: 'en-IN',
    publisher: { '@type': 'Organization', name: site.name, url: site.url },
    blogPost: ARTICLES.map((article) => ({
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.description,
      url: `${site.url}/blogs/${article.slug}`,
      datePublished: article.date,
      image: coverUrl(article, site.url),
    })),
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
      { '@type': 'ListItem', position: 2, name: 'Blogs', item: `${site.url}/blogs` },
    ],
  };

  return (
    <>
      <Seo title="Blogs & Insights" description={DESCRIPTION} path="/blogs" image={unsplash(PHOTOS.glassTowersGold, { w: 1200, h: 630 })} jsonLd={[blogSchema, breadcrumbSchema]} />
      <BlogHero teaser={LATEST_ARTICLE} />
      {FEATURED_ARTICLE && (
        <>
          <FeaturedArticle article={FEATURED_ARTICLE} />
          <ArticleExplorer articles={ARTICLES} />
          <IndustryInsights />
        </>
      )}
      <BlogNewsletter />
      <BlogCta />
    </>
  );
}
