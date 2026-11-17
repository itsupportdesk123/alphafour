/**
 * Brand & contact configuration. Contact details, address and social links come from the
 * original Alphafour site; replace the WhatsApp number (VITE_WHATSAPP_NUMBER) and the RERA
 * details before going live.
 */
const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919800000000';

export const site = {
  name: 'Alphafour Infrastructure Pvt Ltd',
  shortName: 'Alphafour',
  tagline: 'Where Elevation Meets Elegance',
  description:
    'Ultra-luxury sea-facing residences, penthouses and villas: Italian marble, private lifts, a sky deck with an infinity pool and concierge living at Chennai’s most coveted addresses.',
  url: (import.meta.env.VITE_SITE_URL || 'http://localhost:5202').replace(/\/$/, ''),
  contact: {
    phone: '+91 94443 14567',
    phoneHref: 'tel:+919444314567',
    email: 'sales@alpha4infra.com',
    whatsapp: whatsappNumber,
    hours: 'Monday – Saturday · 9:30 AM – 6:00 PM',
  },
  address: {
    line1: 'Dadha Chambers, 5th & 7th Floor',
    line2: 'New No: 250, Old No: 268, V.P. Raman Road, Royapettah',
    city: 'Chennai',
    region: 'Tamil Nadu',
    postalCode: '600014',
    country: 'India',
    // Royapettah neighbourhood centre (OpenStreetMap); mapsUrl searches the full street address.
    coordinates: [13.0555, 80.264],
    mapsUrl: 'https://maps.google.com/?q=Dadha+Chambers,+V.P.+Raman+Road,+Royapettah,+Chennai+600014',
  },
  offices: [
    {
      city: 'Chennai',
      label: 'Head Office',
      address: 'Dadha Chambers, 5th & 7th Floor, V.P. Raman Road, Royapettah, Chennai 600014',
      phone: '+91 94443 14567 · +91 94442 54567',
      coordinates: [13.0555, 80.264],
    },
  ],
  /** Always-on, labelled markers on every map. Coordinates are approximate; verify before launch. */
  mapHighlights: [
    { name: 'Alphafour Head Office', note: 'Dadha Chambers, V.P. Raman Road, Royapettah', coordinates: [13.0555, 80.264] },
    // Same point as the project's listing in data/residences.js.
    { name: 'AV Ramana Towers', note: 'Prakasam Street, T. Nagar, Chennai', coordinates: [13.0506, 80.2455] },
  ],
  social: {
    instagram: 'https://instagram.com/alphafour.in',
    linkedin: 'https://linkedin.com/company/alphafour-infrastructure',
    facebook: 'https://facebook.com/alphafourinfra',
  },
  rera: {
    authority: 'TNRERA',
    number: 'TN/01/Building/0852/2025',
    website: 'https://www.rera.tn.gov.in',
    /** Only printed for a project that has a registration number. */
    registration: 'The project is registered with the Tamil Nadu Real Estate Regulatory Authority (TNRERA).',
    disclaimer:
      'Images are artistic impressions for representation only. Specifications, amenities and prices are indicative and subject to change. This website does not constitute an offer or contract.',
  },
};

export const whatsappUrl = (message = 'Hello Alphafour Infrastructure Pvt Ltd, I would like to know more about your projects.') =>
  `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;

/** Sections switched off for now. Their code and data are all still here: set a flag to true to bring one back. */
export const FEATURES = {
  /** The sample floor plans on the home page and project pages, and the footer link to them. A project's own `planDrawings` always show. */
  floorPlans: false,
};

export const mainNav = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Directors', href: '/directors' },
  { label: 'Projects', href: '/residences' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'Contact Us', href: '/contact' },
];

export const footerNav = [
  {
    title: 'Projects',
    links: [
      { label: 'All projects', href: '/residences' },
      { label: 'Ongoing projects', href: '/residences?status=ongoing' },
      { label: 'Penthouses', href: '/residences?type=penthouse' },
      { label: 'Villas', href: '/residences?type=villa' },
      { label: 'New launches', href: '/residences?status=new-launch' },
      { label: 'Saved projects', href: '/residences?saved=1' },
    ],
  },
  {
    title: 'Experience',
    links: [
      { label: '360° virtual tour', href: '/virtual-tour' },
      { label: 'Gallery', href: '/gallery' },
      { label: 'Amenities', href: '/#amenities' },
      ...(FEATURES.floorPlans ? [{ label: 'Floor plans', href: '/#floor-plans' }] : []),
      { label: 'EMI calculator', href: '/#emi' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Alphafour Infrastructure Pvt Ltd', href: '/about' },
      { label: 'Our directors', href: '/directors' },
      { label: 'Blogs & insights', href: '/blogs' },
      { label: 'Contact & visit', href: '/contact' },
      { label: 'Share feedback', href: '/contact?tab=feedback' },
      { label: 'Privacy policy', href: '/privacy' },
    ],
  },
];
