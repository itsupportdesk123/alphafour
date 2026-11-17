import { createBrowserRouter } from 'react-router-dom';
import { PageLoader } from '@/components/common/PageLoader';
import { RouteError } from '@/components/common/RouteError';
import { RootLayout } from '@/components/layout/RootLayout';

/** Code-split pages: each route downloads only when visited. */
const page = (loader) => async () => {
  const module = await loader();
  return { Component: module.default };
};

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <RootLayout />,
      errorElement: <RouteError />,
      HydrateFallback: PageLoader,
      children: [
        { index: true, lazy: page(() => import('@/pages/HomePage')) },
        { path: 'residences', lazy: page(() => import('@/pages/ResidencesPage')) },
        { path: 'residences/:slug', lazy: page(() => import('@/pages/ResidenceDetailPage')) },
        { path: 'residences/:slug/brochure', lazy: page(() => import('@/pages/BrochurePage')) },
        { path: 'virtual-tour', lazy: page(() => import('@/pages/VirtualTourPage')) },
        { path: 'gallery', lazy: page(() => import('@/pages/GalleryPage')) },
        { path: 'about', lazy: page(() => import('@/pages/AboutPage')) },
        { path: 'directors', lazy: page(() => import('@/pages/DirectorsPage')) },
        { path: 'blogs', lazy: page(() => import('@/pages/BlogsPage')) },
        { path: 'blogs/:slug', lazy: page(() => import('@/pages/BlogArticlePage')) },
        { path: 'contact', lazy: page(() => import('@/pages/ContactPage')) },
        { path: 'privacy', lazy: page(() => import('@/pages/PrivacyPage')) },
        { path: '*', lazy: page(() => import('@/pages/NotFoundPage')) },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  },
);
