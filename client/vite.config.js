import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.API_PROXY_TARGET || 'http://localhost:4083';
  // index.html reads these through %VITE_…% placeholders, so they must always be set.
  process.env.VITE_SITE_URL = (env.VITE_SITE_URL || 'https://itsupportdesk123.github.io/alphafour').trim().replace(/\/+$/, '');
  process.env.VITE_INTRO_MODE = env.VITE_INTRO_MODE || 'session';

  return {
    plugins: [react()],
    base: '/alphafour/',
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5200,
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
      },
    },
    preview: { port: 4173 },
    optimizeDeps: {
      // Lazy-loaded features: pre-bundle so the dev server never reloads mid-session.
      include: [
        'yet-another-react-lightbox',
        'yet-another-react-lightbox/plugins/zoom',
        'yet-another-react-lightbox/plugins/thumbnails',
        'yet-another-react-lightbox/plugins/captions',
        'yet-another-react-lightbox/plugins/fullscreen',
        'react-leaflet',
        'leaflet',
        '@photo-sphere-viewer/core',
        '@photo-sphere-viewer/markers-plugin',
        '@photo-sphere-viewer/virtual-tour-plugin',
        '@photo-sphere-viewer/autorotate-plugin',
        '@photo-sphere-viewer/gyroscope-plugin',
        'react-zoom-pan-pinch',
        '@react-three/fiber',
        '@react-three/drei',
        '@react-three/postprocessing',
        'postprocessing',
        'three',
      ],
    },
    build: {
      target: 'es2020',
      sourcemap: false,
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Shared with the app shell: otherwise Rollup hoists these into the lazy 'three' chunk and every page preloads three.js.
            if (id.includes('vite/preload-helper') || /[\\/](zustand|use-sync-external-store|@babel[\\/]runtime)[\\/]/.test(id)) return 'react';
            if (!id.includes('node_modules')) return undefined;
            if (/[\\/](three|@react-three|postprocessing|three-stdlib|maath|n8ao|camera-controls|troika|@monogrid)[\\/]/.test(id)) {
              return 'three';
            }
            if (id.includes('@photo-sphere-viewer')) return 'panorama';
            if (/[\\/](leaflet|react-leaflet|@react-leaflet)[\\/]/.test(id)) return 'map';
            if (/[\\/](gsap|lenis)[\\/]/.test(id)) return 'scroll';
            if (id.includes('framer-motion')) return 'motion';
            if (/[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return 'react';
            return undefined;
          },
        },
      },
    },
  };
});
