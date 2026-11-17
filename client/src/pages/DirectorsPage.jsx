import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Section } from '@/components/common/Section';
import { Seo } from '@/components/common/Seo';
import { PageHero } from '@/components/layout/PageHero';
import { Button } from '@/components/ui/button';
import { DirectorsSection } from '@/features/directors/DirectorsSection';

/** Directors page: the leadership hero, the directors' gallery and a slim close that points to the projects. */
export default function DirectorsPage() {
  return (
    <>
      <Seo
        title="Directors"
        description="Meet the directors of Alphafour Infrastructure Pvt Ltd: Parthiban Perumal, Managing Director & Founder, and Swarnamugi Raghupathy, Director."
        path="/directors"
      />
      <PageHero
        eyebrow="Leadership"
        title={
          <>
            The people who sign off on <em className="italic text-gold">every specification.</em>
          </>
        }
        // description="AlphaFour is run by four directors who each still walk their own sites. Here’s who they are."
        image="/assets/directorHero.avif"
        breadcrumbs={[{ label: 'Directors' }]}
      />

      <DirectorsSection />

      <Section tone="surface" className="border-t border-gold/20 py-14 md:py-16 lg:py-16">
        <div className="flex flex-col items-center gap-7 text-center md:flex-row md:justify-between md:text-left">
          <h2 className="text-balance text-display-md">Curious what we’re building next?</h2>
          <Button asChild size="lg">
            <Link to="/residences">
              See our projects <ArrowUpRight aria-hidden />
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
