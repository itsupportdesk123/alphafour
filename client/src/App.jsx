import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider } from 'react-router-dom';
import { IntroFilm } from '@/features/intro/IntroFilm';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { router } from '@/router';

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
        {/* Outside the router so it covers the site from the very first render (and the route loader). */}
        <IntroFilm />
      </ThemeProvider>
    </HelmetProvider>
  );
}
