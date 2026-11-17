import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';

/** Last-resort error screen (e.g. a page chunk failed to load after a deploy). */
export function RouteError() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main className="grid min-h-screen place-items-center bg-royal-night px-6 text-center text-ivory">
      <div className="max-w-lg">
        <Logo className="justify-center text-ivory" />
        <h1 className="mt-10 font-display text-display-md">{notFound ? 'This page doesn’t exist' : 'Something went wrong'}</h1>
        <p className="mt-4 text-ivory/75">
          {notFound
            ? 'The page you’re looking for has moved or never existed.'
            : 'Please refresh the page. If the problem continues, our concierge is one call away.'}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="h-11 rounded-full bg-gold-foil px-6 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-navy"
          >
            Refresh
          </button>
          <Link
            to="/"
            className="inline-flex h-11 items-center rounded-full border border-ivory/40 px-6 text-[0.72rem] font-semibold uppercase tracking-[0.18em]"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
