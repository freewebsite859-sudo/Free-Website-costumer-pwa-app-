import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: [
          'favicon.ico',
          'favicon-16x16.png',
          'favicon-32x32.png',
          'apple-touch-icon.png',
        ],
        manifest: {
          name: 'Nexora - Luxury Salon & Spa Booking',
          short_name: 'Nexora',
          description:
            'Book premium salon and spa treatments near you: real-time slots, curated stylists, loyalty rewards and appointment reminders.',
          theme_color: '#e6007e',
          background_color: '#fff8f8',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          lang: 'en-IN',
          categories: ['lifestyle', 'health', 'beauty'],
          icons: [
            {src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any'},
            {src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any'},
            {
              src: 'pwa-maskable-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: 'pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          shortcuts: [
            {name: 'My Bookings', short_name: 'Bookings', url: '/?screen=bookings'},
            {name: 'Find Salons', short_name: 'Search', url: '/?screen=search'},
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          cleanupOutdatedCaches: true,
          navigateFallbackDenylist: [/^\/api/],
          runtimeCaching: [
            {
              // Google Fonts stylesheets change rarely; serve fast, refresh in background.
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {cacheName: 'google-fonts-stylesheets'},
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365},
                cacheableResponse: {statuses: [0, 200]},
              },
            },
            {
              // Remote salon imagery.
              urlPattern: /^https:\/\/(lh3\.googleusercontent\.com|images\.unsplash\.com)\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'salon-images',
                expiration: {maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30},
                cacheableResponse: {statuses: [0, 200]},
              },
            },
            {
              // Read-only catalog data can be served from cache while revalidating.
              urlPattern: ({url}: {url: URL}) =>
                url.pathname.includes('/rest/v1/salons') ||
                url.pathname.includes('/rest/v1/services') ||
                url.pathname.includes('/rest/v1/staff'),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-catalog',
                networkTimeoutSeconds: 5,
                expiration: {maxEntries: 40, maxAgeSeconds: 60 * 60 * 24},
                cacheableResponse: {statuses: [0, 200]},
              },
            },
            {
              // Never cache auth or per-user writes - always hit the network.
              urlPattern: ({url}: {url: URL}) =>
                url.pathname.includes('/auth/v1') || url.pathname.includes('/realtime/v1'),
              handler: 'NetworkOnly',
            },
          ],
        },
        devOptions: {
          // Keep the SW out of the way during development.
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Split heavy vendors so the initial bundle is not one 660 kB chunk.
          manualChunks: {
            react: ['react', 'react-dom'],
            motion: ['framer-motion'],
            supabase: ['@supabase/supabase-js'],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
