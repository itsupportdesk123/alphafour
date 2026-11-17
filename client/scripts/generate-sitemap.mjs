#!/usr/bin/env node
/**
 * Generates public/sitemap.xml and public/robots.txt before every build.
 * Site URL comes from VITE_SITE_URL (falls back to http://localhost:5200).
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readEnv = () => {
  for (const file of ['.env.production.local', '.env.production', '.env.local', '.env']) {
    try {
      const match = readFileSync(path.join(root, file), 'utf8').match(/^VITE_SITE_URL=(.+)$/m);
      if (match) return match[1].trim();
    } catch {
      /* file not present */
    }
  }
  return undefined;
};
const siteUrl = (process.env.VITE_SITE_URL || readEnv() || 'http://localhost:5200').replace(/\/$/, '');

const data = readFileSync(path.join(root, 'src/data/residences.js'), 'utf8');
const slugs = [...data.matchAll(/slug: '([a-z0-9-]+)'/g)].map((m) => m[1]);

// Blog articles: one Markdown file each, dated in its front matter.
const blogDir = path.join(root, 'src/content/blogs');
const articles = readdirSync(blogDir)
  .filter((file) => file.endsWith('.md'))
  .map((file) => ({ slug: file.slice(0, -3), date: /^date:\s*(\d{4}-\d{2}-\d{2})/m.exec(readFileSync(path.join(blogDir, file), 'utf8'))?.[1] }));

const today = new Date().toISOString().slice(0, 10);
const pages = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/residences', priority: '0.9', changefreq: 'weekly' },
  ...slugs.map((slug) => ({ loc: `/residences/${slug}`, priority: '0.8', changefreq: 'monthly' })),
  { loc: '/virtual-tour', priority: '0.7', changefreq: 'monthly' },
  { loc: '/gallery', priority: '0.6', changefreq: 'monthly' },
  { loc: '/about', priority: '0.5', changefreq: 'yearly' },
  { loc: '/directors', priority: '0.5', changefreq: 'yearly' },
  { loc: '/blogs', priority: '0.7', changefreq: 'weekly' },
  ...articles.map((a) => ({ loc: `/blogs/${a.slug}`, priority: '0.6', changefreq: 'monthly', lastmod: a.date })),
  { loc: '/contact', priority: '0.6', changefreq: 'yearly' },
  { loc: '/privacy', priority: '0.2', changefreq: 'yearly' },
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map((p) => `  <url><loc>${siteUrl}${p.loc}</loc><lastmod>${p.lastmod ?? today}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`)
  .join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Disallow: /residences/*/brochure

Sitemap: ${siteUrl}/sitemap.xml
`;

writeFileSync(path.join(root, 'public/sitemap.xml'), xml);
writeFileSync(path.join(root, 'public/robots.txt'), robots);
console.log(`sitemap.xml (${pages.length} urls) and robots.txt written for ${siteUrl}`);
