import { Briefcase, HardHat, Hourglass, MapPin, MapPinned, Ruler } from 'lucide-react';
import { RESIDENCES } from '@/data/residences';

/**
 * The banner under the EMI calculator, also at the foot of the About page. The figures and companies
 * come from the About and Directors pages (data/team.js). The project entries are worked out from
 * data/residences.js, so they follow the portfolio. Nanoax is left out: only one director lists it,
 * as Finance Director, so it is not clearly a group company.
 */
const chennaiProjects = RESIDENCES.filter((r) => r.city === 'Chennai');
const neighbourhoods = new Set(chennaiProjects.map((r) => r.locality)).size;

export const CHENNAI_FACTS = [
  { icon: MapPin, value: 'Royapettah', note: 'Head office, Chennai' },
  { icon: Ruler, value: '2.5M+ sq.ft', note: 'Developed in Chennai' },
  ...chennaiProjects
    .filter((r) => r.status === 'ongoing')
    .map((r) => ({ icon: HardHat, value: r.name, note: `Now rising in ${r.locality}` })),
  ...(neighbourhoods > 1 ? [{ icon: MapPinned, value: `${neighbourhoods} neighbourhoods`, note: 'Our projects across Chennai' }] : []),
  { icon: Hourglass, value: '25+ years', note: 'In infrastructure & construction' },
  { icon: Briefcase, value: '₹5,000 Cr+', note: 'Business turnover led by our directors' },
];

/**
 * Each opens the company's own website in a new tab. Sectors follow those sites, and the logos are each
 * site's own (public/assets/group, taken November 2026): the full Alphafour logo (from assets/Alphafour Logo_4x.png),
 * Enexio's header wordmark, the Enexio Connect logo
 * from enexioservices.com, the BGR NEO mark in its light-theme colours, and Swadhika's header logo.
 */
export const GROUP_COMPANIES = [
  {
    name: 'Alphafour Infrastructure Pvt Ltd',
    sector: 'Infrastructure & real estate',
    href: 'https://alpha4infra.com/',
    logo: { src: '/assets/group/alphafour.png', width: 125, height: 85 },
  },
  {
    name: 'Enexio Power Cooling Solutions India Pvt Ltd',
    sector: 'Power cooling solutions',
    href: 'https://enexio.com/',
    logo: { src: '/assets/group/enexio.png', width: 230, height: 50 },
  },
  {
    name: 'Enexio Spares & Services',
    sector: 'Cooling plant spares & service',
    href: 'https://enexioservices.com/',
    logo: { src: '/assets/group/enexio-services.webp', width: 307, height: 240 },
  },
  {
    name: 'BGR NEO Limited',
    sector: 'Robotics & automation',
    href: 'https://bgrneo.com/',
    logo: { src: '/assets/group/bgr-neo.svg', width: 137, height: 154 },
  },
  {
    name: 'Swadhika Foods LLP',
    sector: 'Frozen & freeze-dried produce',
    href: 'https://swadhika.com/',
    logo: { src: '/assets/group/swadhika.webp', width: 270, height: 105 },
  },
];
