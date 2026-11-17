import { Container } from '@/components/common/Section';
import { Seo } from '@/components/common/Seo';
import { PageHero } from '@/components/layout/PageHero';
import { site } from '@/config/site';
import { PHOTOS } from '@/lib/media';

const SECTIONS = [
  {
    title: 'Who we are',
    body: `${site.name} (“${site.shortName}”, “we”) develops and sells luxury residences in India. This policy explains how we handle the personal data you share with us through this website, in line with India’s Digital Personal Data Protection Act, 2023.`,
  },
  {
    title: 'What we collect',
    body: 'When you send an enquiry, book a site visit, request a call-back, share feedback or join our newsletter, we collect the details you enter (such as your name, email address, phone number, preferred residence, visit date and message). We also receive basic technical information (browser type and the page you used) to protect the website against abuse.',
  },
  {
    title: 'How we use it',
    body: 'Only to respond to your request: to contact you, arrange and confirm visits, share information about projects you asked about, and, if you subscribed, send our newsletter. We do not sell your data, and we never share it with third parties for their own marketing.',
  },
  {
    title: 'How it is processed',
    body: 'Form submissions are delivered by email to our sales and concierge team through our mail provider. This website does not store your submissions in a database. Emails are retained in our business mailboxes for as long as needed to serve you and to meet legal obligations, typically no longer than 36 months after our last interaction.',
  },
  {
    title: 'Your choices and rights',
    body: `You can ask us to access, correct or erase your personal data, or withdraw consent, at any time by writing to ${site.contact.email}. To stop newsletter emails, use the unsubscribe link in any newsletter or email us, and we will act within 48 hours.`,
  },
  {
    title: 'Cookies and local storage',
    body: 'We do not use advertising cookies. Your browser stores your theme preference and the projects you save as favourites locally on your device; this never leaves your device.',
  },
  {
    title: 'Contact & grievances',
    body: `For any privacy question or complaint, contact our Grievance Officer at ${site.contact.email} or ${site.contact.phone}, ${site.address.line1}, ${site.address.line2}, ${site.address.city} ${site.address.postalCode}. We respond within 30 days.`,
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Seo title="Privacy policy" description={`How ${site.name} handles your personal data.`} path="/privacy" />
      <PageHero
        eyebrow="Legal"
        title="Privacy policy"
        description="Your trust matters more to us than any sale. Here is exactly what happens to the information you share."
        photo={PHOTOS.abstractCurves}
        breadcrumbs={[{ label: 'Privacy policy' }]}
      />
      <Container size="narrow" className="section-pad">
        <p className="text-sm text-muted-foreground">Last updated: 23 October 2026</p>
        <div className="mt-10 space-y-12">
          {SECTIONS.map((section, index) => (
            <section key={section.title} aria-labelledby={`privacy-${index}`}>
              <h2 id={`privacy-${index}`} className="font-display text-display-sm">
                <span className="mr-3 text-gold-ink dark:text-gold">{String(index + 1).padStart(2, '0')}</span>
                {section.title}
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
