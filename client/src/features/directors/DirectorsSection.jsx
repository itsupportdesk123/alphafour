import { Reveal } from '@/components/common/Reveal';
import { GoldDivider, Section } from '@/components/common/Section';
import { DIRECTORS } from '@/data/team';
import { DirectorGallery } from '@/features/directors/DirectorGallery';

/** The directors' gallery: an ornament, the heading and the two alcoves on an ivory wall (navy at night). */
export function DirectorsSection() {
  return (
    <Section tone="light" aria-labelledby="directors-heading" className="bg-cream-glow dark:bg-none">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(55%_45%_at_50%_58%,rgba(201,162,75,0.09),transparent)] dark:block"
      />
      <Reveal className="relative flex flex-col items-center text-center">
        <GoldDivider variant="ornament" />
        <h2 id="directors-heading" className="mt-6 text-balance text-display-lg">
          Meet Our <em className="italic text-gold-ink dark:text-gold">Directors</em>
        </h2>
      </Reveal>
      <DirectorGallery directors={DIRECTORS} />
    </Section>
  );
}
