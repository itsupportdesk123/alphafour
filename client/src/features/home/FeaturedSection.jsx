import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Section, SectionHeading } from '@/components/common/Section';
import { Reveal } from '@/components/common/Reveal';
import { Button } from '@/components/ui/button';
import { RESIDENCES } from '@/data/residences';
import { ResidenceCard } from '@/features/residences/ResidenceCard';
import { SearchBar } from '@/features/residences/SearchBar';

/** Featured residences grid + the smart search bar. */
export function FeaturedSection() {
  const featured = RESIDENCES.filter((r) => r.featured).slice(0, 6);
  return (
    <Section id="residences" tone="surface">
      <SectionHeading
        eyebrow="Featured projects"
        title={
          <>
            Addresses that need <em className="italic text-gold-ink dark:text-gold">no introduction</em>
          </>
        }
        description="Sea-facing sky residences, garden mansions and duplex penthouses across Chennai’s most coveted neighbourhoods."
        actions={
          <Button asChild variant="outline">
            <Link to="/residences">
              View all projects <ArrowUpRight aria-hidden />
            </Link>
          </Button>
        }
      />

      <Reveal className="relative z-10 -mt-4 mb-14">
        <h3 className="sr-only">Search projects</h3>
        <SearchBar />
      </Reveal>

      <ul className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
        {featured.map((residence, index) => (
          <Reveal as="li" key={residence.slug} delay={(index % 3) * 0.1} className="h-full">
            <ResidenceCard residence={residence} />
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
