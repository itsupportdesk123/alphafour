import { PHOTOS, unsplash } from '@/lib/media';

/**
 * Blogs. Each article is one Markdown file in src/content/blogs/<slug>.md: the file name is the URL slug,
 * the front matter (title, category, date, cover, coverAlt, excerpt, seoTitle, description, optional featured)
 * describes it, and the body uses a small Markdown subset (##, ###, paragraphs, - and 1. lists, > quote,
 * ![alt](photo "caption"), **bold**, *italic*, [link](/path)). Add a file and it appears on /blogs.
 * cover and image keys are names from PHOTOS (lib/media.js) or paths to files in public/.
 */
const FILES = import.meta.glob('/src/content/blogs/*.md', { query: '?raw', import: 'default', eager: true });

export const BLOG_CATEGORIES = [
  { value: 'all', label: 'All Articles' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'architecture-design', label: 'Architecture & Design' },
  { value: 'construction-engineering', label: 'Construction & Engineering' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'sustainable-development', label: 'Sustainable Development' },
  { value: 'property-investment', label: 'Property & Investment' },
  { value: 'industry-insights', label: 'Industry Insights' },
];

const CATEGORY_LABELS = Object.fromEntries(BLOG_CATEGORIES.map((c) => [c.value, c.label]));
export const categoryLabel = (value) => CATEGORY_LABELS[value] ?? value;

/** A PHOTOS key, or a path to a file in public/. Unknown keys resolve to undefined. */
export const resolvePhoto = (key) => (key?.startsWith('/') ? key : PHOTOS[key]);

const REQUIRED = ['title', 'category', 'date', 'cover', 'coverAlt', 'excerpt', 'description'];
const WORDS_PER_MINUTE = 220;

function parseFile(path, raw) {
  const slug = path.split('/').pop().replace(/\.md$/, '');
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  const meta = {};
  for (const line of (match?.[1] ?? '').split(/\r?\n/)) {
    const colon = line.indexOf(':');
    if (colon > 0) meta[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  const problems = REQUIRED.filter((key) => !meta[key]);
  if (meta.category && !CATEGORY_LABELS[meta.category]) problems.push(`unknown category "${meta.category}"`);
  if (meta.cover && !resolvePhoto(meta.cover)) problems.push(`unknown cover "${meta.cover}"`);
  if (meta.date && Number.isNaN(Date.parse(meta.date))) problems.push(`bad date "${meta.date}"`);
  if (!match || problems.length) {
    // A broken file is left out rather than breaking the page; this says why during development.
    if (import.meta.env.DEV) console.error(`Blog article "${slug}" skipped: ${match ? problems.join(', ') : 'no front matter'}`);
    return null;
  }
  const body = match[2].trim();
  // Reading time counts the words a reader sees: no image lines, link targets or Markdown marks.
  const words = body
    .replace(/^!\[.*$/gm, '')
    .replace(/\]\([^)]*\)/g, ' ')
    .replace(/[#>*[\]]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return {
    slug,
    title: meta.title,
    category: meta.category,
    date: meta.date,
    featured: meta.featured === 'true',
    cover: resolvePhoto(meta.cover),
    coverAlt: meta.coverAlt,
    excerpt: meta.excerpt,
    seoTitle: meta.seoTitle || meta.title,
    description: meta.description,
    body,
    words,
    minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
  };
}

/** Newest first. */
export const ARTICLES = Object.entries(FILES)
  .map(([path, raw]) => parseFile(path, raw))
  .filter(Boolean)
  .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));

export const getArticle = (slug) => ARTICLES.find((a) => a.slug === slug);

export const FEATURED_ARTICLE = ARTICLES.find((a) => a.featured) ?? ARTICLES[0];

/** The newest article that is not the featured one, for the teaser in the page header. */
export const LATEST_ARTICLE = ARTICLES.find((a) => a !== FEATURED_ARTICLE) ?? FEATURED_ARTICLE;

/** Same category first, then the nearest in date. */
export function relatedArticles(article, count = 3) {
  const others = ARTICLES.filter((a) => a.slug !== article.slug);
  const distance = (a) => Math.abs(Date.parse(a.date) - Date.parse(article.date));
  return [...others].sort((a, b) => (b.category === article.category) - (a.category === article.category) || distance(a) - distance(b)).slice(0, count);
}

/** Neighbours in the listing order: previous is the one above it (newer), next the one below (older). */
export function adjacentArticles(slug) {
  const index = ARTICLES.findIndex((a) => a.slug === slug);
  return { previous: ARTICLES[index - 1], next: ARTICLES[index + 1] };
}

/** Cover as a URL for sharing (Open Graph, JSON-LD): a 1200 × 630 crop for photos, the file itself for local images. */
export const coverUrl = (article, siteUrl) => (article.cover.startsWith('/') ? `${siteUrl}${article.cover}` : unsplash(article.cover, { w: 1200, h: 630 }));

export const formatArticleDate = (date) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));

/** The editorial "Industry insights" band: four themes, each leading to the article that explores it. */
export const INSIGHT_TOPICS = [
  {
    title: 'The Future of Urban Real Estate',
    body: 'Cities are growing around transit, mixed-use streets and shared public space. That changes what a good address means: less about distance from the old centre, more about how easily daily life connects.',
    photo: PHOTOS.towersFog,
    alt: 'Glass towers rising into fog, seen from street level',
    slug: 'urban-development-transforming-modern-cities',
  },
  {
    title: 'Smart Buildings and Modern Infrastructure',
    body: 'Buildings now run on sensors, efficient services and controls that keep running costs down. Around them, drainage, power and mobility decide whether a neighbourhood works in the monsoon as well as it does in May.',
    photo: PHOTOS.plantRoom,
    alt: 'Pumps and pipework in a building’s plant room',
    slug: 'smarter-infrastructure-better-cities',
  },
  {
    title: 'Sustainable Construction Practices',
    body: 'Durable materials, passive cooling and water-wise design do more than any label. Rainwater harvesting has been mandatory for buildings in Tamil Nadu since 2003; the next step is designing for heat and humidity from the first sketch.',
    photo: PHOTOS.solarRows,
    alt: 'Rows of solar panels under a bright sky',
    slug: 'sustainable-construction',
  },
  {
    title: 'Architectural Innovation in India',
    body: 'The best new Indian architecture borrows from what came before: courtyards, deep verandahs and shaded thresholds that kept homes cool long before air-conditioning, now working at the scale of towers and offices.',
    photo: PHOTOS.curvedStripes,
    alt: 'A curved building with blue and white horizontal bands',
    slug: 'evolution-of-modern-architectural-design',
  },
];
