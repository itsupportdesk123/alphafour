import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { lazy, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LazyMount } from '@/components/common/LazyMount';
import { Container, Eyebrow, Section, SectionHeading } from '@/components/common/Section';
import { Seo } from '@/components/common/Seo';
import { CallbackForm, EnquiryForm, FeedbackForm, SiteVisitForm } from '@/components/forms/LeadForms';
import { PageHero } from '@/components/layout/PageHero';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { site, whatsappUrl } from '@/config/site';
import { FAQS } from '@/data/faqs';
import { PHOTOS } from '@/lib/media';
import { scrollToTarget, useLenis } from '@/providers/SmoothScrollProvider';

const LocationMap = lazy(() => import('@/features/map/LocationMap'));

const TABS = [
  { value: 'enquiry', label: 'Enquiry' },
  { value: 'visit', label: 'Site visit' },
  { value: 'callback', label: 'Call-back' },
  { value: 'feedback', label: 'Feedback' },
];

export default function ContactPage() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab');
  const [tab, setTab] = useState(TABS.some((t) => t.value === requested) ? requested : 'enquiry');
  const [office, setOffice] = useState(null);
  const lenis = useLenis();

  // A link to a particular form (such as "Share feedback": ?tab=feedback) brings that form into view,
  // since the full-screen header would otherwise leave the visitor looking at the photograph.
  // Only on arrival: changing tabs on the page afterwards must not scroll.
  const [arrivedWithTab] = useState(() => TABS.some((t) => t.value === requested));
  useEffect(() => {
    if (!arrivedWithTab || !lenis) return undefined;
    const timer = setTimeout(() => scrollToTarget(lenis, '#contact-form', { offset: -96 }), 600);
    return () => clearTimeout(timer);
  }, [arrivedWithTab, lenis]);

  const changeTab = (value) => {
    setTab(value);
    setParams(value === 'enquiry' ? {} : { tab: value }, { replace: true, preventScrollReset: true });
  };

  const channels = [
    { icon: Phone, label: 'Call the concierge', value: site.contact.phone, href: site.contact.phoneHref },
    { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with an advisor', href: whatsappUrl() },
    { icon: Mail, label: 'Email', value: site.contact.email, href: `mailto:${site.contact.email}` },
    { icon: Clock, label: 'Hours', value: site.contact.hours },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
  };

  return (
    <>
      <Seo title="Contact & visit" description="Speak with an advisor at Alphafour Infrastructure Pvt Ltd, book a private viewing, request a call-back or share feedback." path="/contact" jsonLd={faqSchema} />
      <PageHero
        eyebrow="Contact"
        title={
          <>
            We’d love to <em className="italic text-gold">hear from you</em>
          </>
        }
        description="Enquiries, private viewings, call-backs and feedback all reach a real person on our private client team."
        photo={PHOTOS.officeLounge}
        breadcrumbs={[{ label: 'Contact' }]}
      />

      <Container id="contact-form" className="section-pad scroll-mt-24">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="glass rounded-[2rem] p-6 sm:p-10">
            <Tabs value={tab} onValueChange={changeTab}>
              <TabsList aria-label="How can we help?">
                {TABS.map((t) => (
                  <TabsTrigger key={t.value} value={t.value}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="enquiry">
                <h2 className="font-display text-display-sm">Send an enquiry</h2>
                <p className="mb-8 mt-2 text-sm text-muted-foreground">An advisor will reply within one business day.</p>
                <EnquiryForm source="contact/enquiry" />
              </TabsContent>
              <TabsContent value="visit">
                <h2 className="font-display text-display-sm">Book a private viewing</h2>
                <p className="mb-8 mt-2 text-sm text-muted-foreground">Viewings every day, 10 am – 6 pm. You’ll receive a calendar invite by email.</p>
                <SiteVisitForm source="contact/site-visit" />
              </TabsContent>
              <TabsContent value="callback">
                <h2 className="font-display text-display-sm">Request a call-back</h2>
                <p className="mb-8 mt-2 text-sm text-muted-foreground">Choose a time and we’ll call you.</p>
                <CallbackForm source="contact/callback" />
              </TabsContent>
              <TabsContent value="feedback">
                <h2 className="font-display text-display-sm">Share your feedback</h2>
                <p className="mb-8 mt-2 text-sm text-muted-foreground">Every note is read by our leadership team, whether it’s praise or something we can do better.</p>
                <FeedbackForm source="contact/feedback" />
              </TabsContent>
            </Tabs>
          </div>

          <aside className="space-y-6" aria-label="Contact details">
            <ul className="space-y-3">
              {channels.map(({ icon: Icon, label, value, href }) => {
                const content = (
                  <>
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-navy text-gold">
                      <Icon className="size-5" strokeWidth={1.5} aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
                      <span className="block break-words font-medium">{value}</span>
                    </span>
                  </>
                );
                return (
                  <li key={label}>
                    {href ? (
                      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="glass flex items-center gap-4 rounded-2xl p-4 transition-colors hover:border-gold/50">
                        {content}
                      </a>
                    ) : (
                      <div className="glass flex items-center gap-4 rounded-2xl p-4">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
            <div>
              <Eyebrow>Visit us</Eyebrow>
              <ul className="mt-4 space-y-3">
                {site.offices.map((o) => (
                  <li key={o.city}>
                    <button type="button" onClick={() => setOffice(o.label)} onMouseEnter={() => setOffice(o.label)} className="flex w-full items-start gap-3 rounded-2xl border border-gold/20 p-4 text-left transition-colors hover:border-gold/50">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-gold-ink dark:text-gold" aria-hidden />
                      <span>
                        <span className="block font-semibold">
                          {o.city} · {o.label}
                        </span>
                        <span className="block text-sm text-muted-foreground">{o.address}</span>
                        <span className="block text-sm text-muted-foreground">{o.phone}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <LazyMount minHeight="28rem" className="mt-12 overflow-hidden rounded-[2rem] border border-gold/25 shadow-luxe">
          <LocationMap
            center={site.offices[0].coordinates}
            label={`${site.name} · ${site.offices[0].label}`}
            landmarks={site.offices.slice(1).map((o) => ({ name: o.label, coordinates: o.coordinates, distance: o.city, time: o.phone }))}
            active={office}
            onSelect={setOffice}
            zoom={site.offices.length > 1 ? 4 : 14}
            className="h-[28rem]"
          />
        </LazyMount>
      </Container>

      <Section tone="surface">
        <SectionHeading eyebrow="FAQ" title="Questions we’re often asked" align="center" />
        <Accordion type="single" collapsible className="mx-auto max-w-3xl">
          {FAQS.map((f) => (
            <AccordionItem key={f.question} value={f.question}>
              <AccordionTrigger>{f.question}</AccordionTrigger>
              <AccordionContent>{f.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>
    </>
  );
}
