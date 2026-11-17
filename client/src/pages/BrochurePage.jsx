import { ArrowLeft, Printer } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { Container } from '@/components/common/Section';
import { Seo } from '@/components/common/Seo';
import { Button } from '@/components/ui/button';
import { site } from '@/config/site';
import { AMENITIES } from '@/data/amenities';
import { buildPriceBreakdown, getResidence, hasPrice, STATUS_META } from '@/data/residences';
import { brochureKey } from '@/features/residences/brochure';
import { BrochureForm } from '@/features/residences/DetailParts';
import { formatArea, formatBhk, formatINR, formatPossession, formatPriceRange } from '@/lib/format';
import { unsplash } from '@/lib/media';
import NotFoundPage from '@/pages/NotFoundPage';

const unlocked = (slug) => {
  try {
    return sessionStorage.getItem(brochureKey(slug)) === '1';
  } catch {
    return false;
  }
};

/** Print-ready brochure (Save as PDF from the print dialog). Gated by the lead form. */
export default function BrochurePage() {
  const { slug } = useParams();
  const residence = getResidence(slug);
  const [open, setOpen] = useState(() => unlocked(slug));
  if (!residence) return <NotFoundPage />;

  if (!open) {
    return (
      <Container size="narrow" className="pb-24 pt-36">
        <Seo title={`${residence.name} brochure`} path={`/residences/${slug}/brochure`} />
        <p className="eyebrow">Brochure</p>
        <h1 className="mt-4 text-display-md">{residence.name}</h1>
        <p className="mt-3 text-muted-foreground">Share your details to unlock the brochure. A copy of your request goes to our concierge.</p>
        <div className="glass mt-10 rounded-[2rem] p-6 sm:p-9">
          <BrochureForm residence={residence} onDone={() => setOpen(true)} />
        </div>
      </Container>
    );
  }

  const priced = hasPrice(residence);
  const commercial = residence.bedrooms.length === 0;
  const breakdown = priced ? buildPriceBreakdown(residence) : [];
  const total = breakdown.reduce((s, i) => s + i.amount, 0);
  const { contact } = residence;
  const facts = [
    ['Price', priced ? formatPriceRange(residence.price, residence.priceMax) : 'On request'],
    commercial ? ['Type', residence.type] : ['Homes', formatBhk(residence.bedrooms)],
    [residence.areaLabel ?? 'Carpet area', `${formatArea(residence.area[0])}${residence.area[1] > residence.area[0] ? '+' : ''}`],
    residence.possession === null ? ['Status', STATUS_META[residence.status].label] : ['Possession', formatPossession(residence.possession)],
  ];

  return (
    <div className="bg-ivory pb-24 pt-28 text-charcoal print:bg-white print:p-0">
      <Seo title={`${residence.name} brochure`} path={`/residences/${slug}/brochure`} />
      <Container size="narrow" className="mb-8 flex items-center justify-between gap-4 print:hidden">
        <Button asChild variant="ghost" size="sm">
          <Link to={`/residences/${slug}`}>
            <ArrowLeft aria-hidden /> Back to project
          </Link>
        </Button>
        <Button size="sm" onClick={() => window.print()}>
          <Printer aria-hidden /> Print / save as PDF
        </Button>
      </Container>

      <article className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-gold/30 bg-white shadow-luxe print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        <header className="relative h-[26rem] overflow-hidden bg-navy text-ivory print:h-[22rem]">
          <img src={unsplash(residence.images[0], { w: 1600, q: 80 })} alt="" className="absolute inset-0 size-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
          <div className="relative flex h-full flex-col justify-between p-10">
            <Logo className="text-ivory" />
            <div>
              <p className="text-micro uppercase text-gold">
                {residence.locality}, {residence.city}
              </p>
              <h1 className="mt-3 font-display text-6xl">{residence.name}</h1>
              <p className="mt-2 text-lg text-ivory/80">{residence.tagline}</p>
            </div>
          </div>
        </header>

        <div className="space-y-12 p-10">
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {facts.map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-gold/25 p-4">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-taupe-ink">{label}</p>
                <p className="mt-1 font-display text-xl">{value}</p>
              </div>
            ))}
          </section>

          <section>
            <h2 className="font-display text-3xl">{commercial ? 'The project' : 'The residence'}</h2>
            {residence.description.split('\n\n').map((p) => (
              <p key={p.slice(0, 16)} className="mt-4 leading-relaxed text-taupe-ink">
                {p}
              </p>
            ))}
            {residence.sections?.map((s) => (
              <div key={s.id} className="mt-6">
                <h3 className="font-display text-2xl">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-taupe-ink">{s.body}</p>
              </div>
            ))}
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {residence.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-sm">
                  <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rotate-45 bg-gold" /> {h}
                </li>
              ))}
            </ul>
          </section>

          {residence.idealFor && (
            <section className="break-inside-avoid">
              <h2 className="font-display text-3xl">Ideal for</h2>
              <p className="mt-4 text-sm text-taupe-ink">{residence.idealFor.join(' · ')}</p>
            </section>
          )}

          {commercial && (
            <section className="break-inside-avoid">
              <h2 className="font-display text-3xl">Details</h2>
              <table className="mt-4 w-full text-sm">
                <tbody>
                  <tr className="border-b border-gold/20">
                    <th scope="row" className="py-3 text-left font-medium">Address</th>
                    <td className="py-3 text-right text-taupe-ink">{residence.address}</td>
                  </tr>
                  {residence.specs.map((s) => (
                    <tr key={s.label} className="border-b border-gold/20">
                      <th scope="row" className="py-3 text-left font-medium">{s.label}</th>
                      <td className="py-3 text-right text-taupe-ink">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {residence.configurations.length > 0 && (
            <section className="break-inside-avoid">
              <h2 className="font-display text-3xl">Configurations</h2>
              <table className="mt-4 w-full text-sm">
                <tbody>
                  {residence.configurations.map((c) => (
                    <tr key={c.label} className="border-b border-gold/20">
                      <th scope="row" className="py-3 text-left font-medium">{c.label}</th>
                      <td className="py-3 text-taupe-ink">{formatArea(c.area)}</td>
                      <td className="py-3 text-right font-semibold">{formatINR(c.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <section className="break-inside-avoid">
            <h2 className="font-display text-3xl">Amenities</h2>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
              {residence.amenities.map((key) => (
                <li key={key} className="rounded-xl border border-gold/20 px-3 py-2">
                  {AMENITIES[key]?.label ?? key}
                </li>
              ))}
            </ul>
          </section>

          {priced && (
            <section className="break-inside-avoid">
              <h2 className="font-display text-3xl">Indicative cost sheet</h2>
              <table className="mt-4 w-full text-sm">
                <tbody>
                  {breakdown.map((item) => (
                    <tr key={item.label} className="border-b border-gold/20">
                      <th scope="row" className="py-2.5 text-left font-medium">{item.label}</th>
                      <td className="py-2.5 text-right tabular-nums">{item.amount ? formatINR(item.amount, { compact: false }) : '—'}</td>
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" className="py-3 text-left font-semibold">All-inclusive (indicative)</th>
                    <td className="py-3 text-right font-display text-xl text-gold-ink">{formatINR(total, { compact: false })}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          )}

          <footer className="rounded-2xl bg-navy p-8 text-ivory">
            <p className="font-display text-2xl">Arrange a private viewing</p>
            <p className="mt-2 text-sm text-ivory/75">
              {contact
                ? `${contact.name}, ${contact.title} · ${contact.phone} · ${contact.email} · ${contact.address}`
                : `${site.contact.phone} · ${site.contact.email} · ${site.address.line1}, ${site.address.line2}, ${site.address.city}`}
            </p>
            <p className="mt-4 text-[0.65rem] leading-relaxed text-ivory/55">
              {residence.rera && `${site.rera.authority} Reg. No. ${residence.rera}. ${site.rera.registration} `}
              {site.rera.disclaimer}
            </p>
          </footer>
        </div>
      </article>
    </div>
  );
}
