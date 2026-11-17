import { ArrowUpRight, Clock, Mail, MapPin, Phone, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { GoldDivider } from '@/components/common/Section';
import { SocialIcon } from '@/components/common/SocialIcons';
import { NewsletterForm } from '@/components/forms/LeadForms';
import { footerNav, site } from '@/config/site';
import { useIntroStore } from '@/features/intro/introStore';

export function Footer() {
  const playIntro = useIntroStore((s) => s.play);
  return (
    <footer data-tone="dark" className="relative overflow-hidden bg-navy-depth text-ivory print:hidden">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo className="text-ivory" />
            <p className="mt-6 max-w-sm font-display text-3xl leading-tight">
              Join the private list for <em className="text-gold">first access</em> to new launches.
            </p>
            <NewsletterForm className="mt-6 max-w-md" source="footer/newsletter" />
            <div className="mt-8 flex gap-3">
              {Object.entries(site.social).map(([name, url]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${site.name} on ${name}`}
                  className="inline-flex size-10 items-center justify-center rounded-full border border-gold/30 text-champagne transition-colors hover:border-gold hover:bg-gold hover:text-navy"
                >
                  <SocialIcon name={name} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {footerNav.map((column) => (
              <div key={column.title}>
                <p className="text-micro uppercase text-gold">{column.title}</p>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.href} className="link-luxe text-sm text-ivory/75 hover:text-ivory">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <GoldDivider className="my-12" />

        <div className="grid gap-8 text-sm text-ivory/75 md:grid-cols-2 lg:grid-cols-[1.25fr_0.8fr_1.35fr_1fr]">
          <a href={site.address.mapsUrl} target="_blank" rel="noreferrer" className="flex gap-3 hover:text-ivory">
            <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
            <span>
              {site.address.line1}
              <br />
              {site.address.line2}, {site.address.city} {site.address.postalCode}
            </span>
          </a>
          <a href={site.contact.phoneHref} className="flex gap-3 hover:text-ivory">
            <Phone className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
            {site.contact.phone}
          </a>
          <a href={`mailto:${site.contact.email}`} className="flex min-w-0 gap-3 [overflow-wrap:anywhere] hover:text-ivory">
            <Mail className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
            {site.contact.email}
          </a>
          <p className="flex gap-3">
            <Clock className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
            {site.contact.hours}
          </p>
        </div>

        <GoldDivider className="my-10" />

        <div className="space-y-4 text-xs leading-relaxed text-ivory/60">
          <div className="flex flex-col justify-between gap-3 pt-4 sm:flex-row">
            <p>
              © {new Date().getFullYear()} {site.name}. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <button type="button" onClick={playIntro} className="inline-flex items-center gap-1.5 hover:text-ivory">
                <Play className="size-3" aria-hidden /> Play intro film
              </button>
              <Link to="/privacy" className="hover:text-ivory">
                Privacy policy
              </Link>
              <Link to="/contact?tab=feedback" className="hover:text-ivory">
                Feedback
              </Link>
              <Link to="/contact" className="hover:text-ivory">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
