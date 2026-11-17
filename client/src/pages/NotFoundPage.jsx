import { ArrowRight, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/common/Seo';
import { Particles } from '@/components/effects/Particles';
import { Button } from '@/components/ui/button';
import { RESIDENCES } from '@/data/residences';

export default function NotFoundPage() {
  const suggestions = RESIDENCES.filter((r) => r.featured).slice(0, 3);
  return (
    <>
      <Seo title="Page not found" description="The page you are looking for has moved." path="/404" />
      <section data-tone="dark" className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-navy-depth px-6 text-center text-ivory">
        <Particles quantity={45} />
        <div className="relative max-w-2xl">
          <Compass className="mx-auto size-10 text-gold" strokeWidth={1.25} aria-hidden />
          <p className="mt-8 font-display text-[clamp(6rem,18vw,12rem)] leading-none text-gold-foil">404</p>
          <h1 className="mt-4 font-display text-display-md">This floor doesn’t exist</h1>
          <p className="mt-4 text-ivory/75">The page you’re looking for has moved or was never built. Let us take you somewhere beautiful instead.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/">Back to the lobby</Link>
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <Link to="/residences">Explore projects</Link>
            </Button>
          </div>
          <ul className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ivory/70">
            {suggestions.map((r) => (
              <li key={r.slug}>
                <Link to={`/residences/${r.slug}`} className="link-luxe hover:text-gold">
                  {r.name} <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
