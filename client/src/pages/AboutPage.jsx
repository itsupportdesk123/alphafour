import { ArrowUpRight, Bot, Briefcase, Building2, GraduationCap, Lightbulb, Rocket, Sparkles, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Reveal, SplitReveal } from '@/components/common/Reveal';
import { Eyebrow, GlassCard, Section, SectionHeading } from '@/components/common/Section';
import { Seo } from '@/components/common/Seo';
import { SmartImage } from '@/components/common/SmartImage';
import { NumberTicker } from '@/components/effects/NumberTicker';
import { Particles } from '@/components/effects/Particles';
import { PageHero } from '@/components/layout/PageHero';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { LEADERS } from '@/data/team';
import { GroupSection } from '@/features/home/MoreSections';
import { PHOTOS } from '@/lib/media';

const ABOUT_STATS = [
  { value: 25, suffix: '+', label: 'Years of leadership experience' },
  { value: 2.5, decimals: 1, suffix: 'M+', label: 'Sq.ft developed in Chennai' },
  { value: 5000, prefix: '₹', suffix: '+', label: 'Crores in business turnover led' },
  { value: 6, suffix: '+', label: 'Companies led' },
];

const EXPERIENCES = [
  {
    title: 'Managing Director, Alphafour Infrastructure Pvt Ltd',
    text: 'As the Managing Director of Alphafour Infrastructure Pvt Ltd, Mr Parthiban A.P. has led the development of over 2.5 million square feet of infrastructure in Chennai. His exceptional project management skills and strategic vision have ensured the successful completion of large-scale projects, significantly enhancing the region’s infrastructure landscape.',
  },
  {
    title: 'Director, Enexio Power Cooling Solutions India Private Limited',
    text: 'ENEXIO Power Cooling Solutions India Pvt Ltd is steered by Mr. Parthiban A.P., a seasoned expert in the power cooling industry. As Director, Mr. Parthiban A.P. is dedicated to driving innovation, upholding operational excellence, and delivering superior solutions to meet the changing demands of clients. With a strong focus on customer satisfaction, he oversees both the strategic direction and daily operations of the company, ensuring that ENEXIO remains at the forefront of the cooling solutions market.',
  },
  {
    title: 'Director, BGR NEO Limited',
    text: 'Mr Parthiban A.P. also serves as a Director at BGR NEO Limited, a company specializing in robotics and automation solutions for the FMCG sector worldwide. His role involves guiding the strategic direction and operational excellence of BGR NEO Limited, contributing to its global expansion and innovation in the field of robotics.',
  },
  {
    title: 'Director, Swadhika Foods LLP',
    text: 'Swadhika Foods LLP is steered by Mr. Parthiban A.P., a visionary Director dedicated to preserving the natural taste and health benefits of food. With decades of experience, Mr. Parthiban A.P. emphasizes innovation, quality, and freshness, ensuring that all products are free from preservatives and synthetic colors. His mission is to establish a global benchmark in product excellence and build trust-based partnerships with clients.',
  },
  {
    title: 'Finance Director, Nanoax',
    text: 'In his current role as Finance Director at Nanoax, Mr. Parthiban A.P. oversees financial strategies and operations for the company. Nanoax specializes in low-code/no-code technology solutions catering to the fintech sector globally. His financial acumen and leadership have been instrumental in driving Nanoax’s growth and establishing it as a global fintech leader.',
  },
  {
    title: 'IoT Platform Expertise with STROBS USA',
    text: 'Mr Parthiban A.P. has deep expertise in the Internet of Things (IoT), working with STROBS USA to introduce niche IoT products across various sectors, including life sciences, hospitality, and education. His innovative solutions have been implemented in Texas, USA, China, India, and Sri Lanka, significantly improving operational efficiencies and opening new business opportunities across these platforms.',
  },
  {
    title: 'Entrepreneurial Ventures',
    text: 'A dedicated entrepreneur, Mr. Parthiban A.P. has served as a business analyst for numerous startups. His strategic insights and comprehensive business analysis have helped many emerging businesses overcome challenges and achieve sustainable growth. His commitment to innovation and entrepreneurship has made him a sought-after advisor in the startup community.',
  },
];

const PROFILE_NOTES = [
  {
    icon: GraduationCap,
    title: 'Educational Background',
    text: 'Mr Parthiban A.P. holds a postgraduate degree in Finance and Management, which has provided him with a strong foundation to excel in various business environments and leadership roles.',
  },
  {
    icon: Sparkles,
    title: 'Personal Attributes',
    text: 'Mr Parthiban A.P. is recognized for his entrepreneurial mindset and strategic thinking. His dedication to innovation and excellence has made him a respected figure in the infrastructure, technology, fintech, and robotics sectors.',
  },
];

const PURPOSE = [
  {
    title: 'Our Mission',
    text: 'To transform the real estate landscape by providing innovative, high-quality, and sustainable construction solutions that exceed client expectations and set new benchmarks in the industry.',
  },
  {
    title: 'Our Vision',
    text: 'To be a global leader in construction, known for our commitment to excellence, integrity, and customer satisfaction.',
  },
];

const EXPERTISE = [
  { icon: Building2, title: 'Infrastructure Management', text: 'Proven track record in managing and delivering large-scale infrastructure projects, including the development of over 2.5 million square feet in Chennai.' },
  { icon: Wifi, title: 'IoT Integration', text: 'Expertise in implementing IoT-based niche products across diverse sectors such as life sciences, hospitality, and education in multiple countries.' },
  { icon: Rocket, title: 'Startup Consultancy', text: 'Skilled in providing strategic business analysis and support to startups, fostering their growth and sustainability.' },
  { icon: Briefcase, title: 'Financial Leadership', text: 'Experienced in formulating and executing financial strategies as the Finance Director at Nanoax, a global fintech innovator.' },
  { icon: Bot, title: 'Robotics & Automation', text: 'Strategic leadership in robotics and automation solutions for the FMCG sector as a Director at BGR NEO Limited.' },
  { icon: Lightbulb, title: 'Innovation Strategy', text: 'Cross-sector innovation and strategic business analysis with a focus on emerging technologies and market opportunities.' },
];

export default function AboutPage() {
  return (
    <>
      <Seo
        title="About Alphafour Infrastructure Pvt Ltd"
        description="Alphafour Infrastructure Pvt Ltd redefines construction with innovation, integrity and excellence, led by seasoned professionals across buildings, commercial spaces and infrastructure."
        path="/about"
      />
      <PageHero
        eyebrow="Discover Alphafour Infrastructure Pvt Ltd"
        title={
          <>
            Discover <em className="italic text-gold">us</em>
          </>
        }
        description="Excellence in Infrastructure & Innovation"
        photo={PHOTOS.towerLookUp}
        breadcrumbs={[{ label: 'About' }]}
      />

      <Section tone="light">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Eyebrow>About us</Eyebrow>
            <SplitReveal as="h2" className="mt-6 text-display-lg" text="About Alphafour Infrastructure Pvt Ltd" />
            <Reveal delay={0.1}>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Welcome to Alphafour Infrastructure Pvt Ltd, where we redefine construction experiences with innovation, integrity, and
                excellence. Our company is committed to transforming the way people buy, sell, rent, and invest in properties, offering personalized
                services and cutting-edge solutions tailored to meet our clients’ diverse needs.
              </p>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                Alphafour Infrastructure Pvt Ltd is a leading upcoming construction company spearheaded by a team of seasoned professionals and
                highly experienced management experts who have effectively overseen numerous businesses with turnovers exceeding{' '}
                <strong className="font-semibold text-foreground">Rs 5,000 crores</strong> across multiple countries.
              </p>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                Our primary focus is on delivering top-notch construction services for buildings, commercial spaces, and infrastructure projects, aiming
                to establish new standards for quality, innovation, and client satisfaction on a global scale.
              </p>
            </Reveal>
          </div>
          <Reveal className="grid grid-cols-2 gap-4">
            <SmartImage photo={PHOTOS.architectPlans} alt="Architect drafting plans" ratio={3 / 4} className="rounded-[1.75rem]" sizes="25vw" />
            <SmartImage photo={PHOTOS.stairWood} alt="Timber staircase detail" ratio={3 / 4} className="mt-12 rounded-[1.75rem]" sizes="25vw" />
          </Reveal>
        </div>
      </Section>

      <Section tone="dark">
        <Particles quantity={40} />
        <dl className="relative grid grid-cols-2 gap-10 lg:grid-cols-4">
          {ABOUT_STATS.map((s) => (
            <div key={s.label} className="text-center">
              <dd className="font-display text-5xl font-light text-gold-foil sm:text-6xl">
                <NumberTicker value={s.value} decimals={s.decimals ?? 0} prefix={s.prefix} suffix={s.suffix} />
              </dd>
              <dt className="mt-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-ivory/75">{s.label}</dt>
            </div>
          ))}
        </dl>
      </Section>

      <Section tone="surface">
        <SectionHeading eyebrow="Leadership team" title="Meet the visionary leaders driving innovation and excellence" align="center" />
        <div className="space-y-8">
          {LEADERS.map((leader) => (
            <Reveal key={leader.name}>
              <GlassCard as="article" className="grid gap-8 p-6 sm:p-9 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-4">
                  <SmartImage src={leader.photo} alt={leader.name} ratio={1} className="mx-auto max-w-sm rounded-[1.75rem]" />
                </div>
                <div className="lg:col-span-8">
                  <Eyebrow>{leader.role}</Eyebrow>
                  <h3 className="mt-4 font-display text-4xl sm:text-5xl">{leader.name}</h3>
                  <p className="mt-5 leading-relaxed text-muted-foreground">{leader.summary}</p>
                  <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-gold/20 py-6">
                    {leader.highlights.map((h) => (
                      <div key={h.label}>
                        <dd className="font-display text-2xl text-gold-ink dark:text-gold sm:text-4xl">{h.value}</dd>
                        <dt className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{h.label}</dt>
                      </div>
                    ))}
                  </dl>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="profile" className="border-b-0">
                      <AccordionTrigger>View full profile</AccordionTrigger>
                      <AccordionContent className="pr-0 sm:pr-12">
                        <p className="font-display text-2xl text-foreground">{leader.fullName}</p>
                        <p className="mt-1 text-micro uppercase text-eyebrow">{leader.fullTitle}</p>
                        {leader.bio.map((block, i) => (
                          <div key={block.heading ?? i} className="mt-5 space-y-4">
                            {block.heading && <h4 className="pt-2 font-display text-xl text-foreground">{block.heading}</h4>}
                            {block.paragraphs.map((text) => (
                              <p key={text}>{text}</p>
                            ))}
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/directors">
              Meet our directors <ArrowUpRight aria-hidden />
            </Link>
          </Button>
        </div>
      </Section>

      <Section tone="light">
        <SectionHeading eyebrow="Mr. Parthiban A.P." title="Professional experiences" />
        <ol className="relative ml-3 border-l border-gold/40">
          {EXPERIENCES.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 0.06} className="relative pb-12 pl-10 last:pb-0">
              <span aria-hidden className="absolute -left-[7px] top-2 size-3.5 rotate-45 border border-gold bg-ivory dark:bg-navy" />
              <p className="font-display text-4xl text-gold-ink dark:text-gold">{String(i + 1).padStart(2, '0')}</p>
              <p className="mt-1 font-display text-2xl">{item.title}</p>
              <p className="mt-2 max-w-3xl leading-relaxed text-muted-foreground">{item.text}</p>
            </Reveal>
          ))}
        </ol>
        <ul className="mt-16 grid gap-6 md:grid-cols-2">
          {PROFILE_NOTES.map(({ icon: Icon, title, text }, i) => (
            <Reveal as="li" key={title} delay={i * 0.08}>
              <GlassCard className="h-full p-7">
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-navy text-gold">
                  <Icon className="size-5" strokeWidth={1.5} aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-2xl">{title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{text}</p>
              </GlassCard>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section tone="dark">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Eyebrow>Our mission &amp; vision</Eyebrow>
            <SplitReveal as="h2" className="mt-6 text-display-lg" text="Revolutionizing the construction industry with a blend of modern technology" />
            <div className="mt-10 space-y-5">
              {PURPOSE.map(({ title, text }, i) => (
                <Reveal key={title} delay={0.1 + i * 0.08}>
                  <GlassCard className="p-7">
                    <h3 className="font-display text-2xl text-gold">{title}</h3>
                    <p className="mt-2 leading-relaxed text-ivory/75">{text}</p>
                  </GlassCard>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal>
            <SmartImage
              src="/assets/AlphaPark.png"
              alt="Alphafour Infrastructure Pvt Ltd residential development"
              ratio={525 / 690}
              className="mx-auto max-w-md rounded-[2rem] shadow-luxe"
            />
          </Reveal>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading eyebrow="Areas of expertise" title="Comprehensive expertise across multiple industries and technologies" align="center" />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {EXPERTISE.map(({ icon: Icon, title, text }, i) => (
            <Reveal as="li" key={title} delay={(i % 3) * 0.08}>
              <GlassCard interactive className="h-full p-7">
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-navy text-gold">
                  <Icon className="size-5" strokeWidth={1.5} aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-2xl">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </GlassCard>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section tone="navy">
        <SectionHeading
          title="Curious what we’re building next?"
          className="mb-0 md:mb-0"
          actions={
            <Button asChild size="lg">
              <Link to="/residences">
                See our projects <ArrowUpRight aria-hidden />
              </Link>
            </Button>
          }
        />
      </Section>
      <GroupSection />
    </>
  );
}
