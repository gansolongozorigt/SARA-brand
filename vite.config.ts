import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Existing static assets in /public that aren't import-referenced — precache them.
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'og-image.png'],
      manifest: {
        name: 'SARA — Luxury skincare & perfume',
        short_name: 'SARA',
        description: 'SARA — Luxury skincare & perfume. Crafted by a Mongolian woman.',
        lang: 'mn',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#2A2A2A',
        theme_color: '#2A2A2A',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Fonts (woff/woff2) intentionally excluded from precache — they're the
        // @fontsource CJK bulk (~35 MB). Served offline via runtimeCaching below.
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // Ensure returning visitors get the corrected worker promptly and old
        // precache buckets are cleared (registerType 'autoUpdate' already implies
        // skipWaiting/clientsClaim; stated explicitly for clarity).
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // SPA fallback — unknown routes resolve to index.html (keeps /about, /contact, /checkout working offline).
        navigateFallback: '/index.html',
        // ...but NEVER serve the SPA shell for /api/* — those are server endpoints
        // (the WooCommerce read proxy). Without this, navigating to /api/woo/*
        // returns the cached index.html instead of the JSON. The proxy responses
        // are cached by the edge CDN (s-maxage=300); the SW must not touch them.
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Self-hosted @fontsource fonts.
            urlPattern: /\.(?:woff2?|ttf|otf|eot)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'sara-fonts',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Product / brand images (jpg/png/webp/etc).
            urlPattern: /\.(?:png|jpe?g|webp|gif|avif|svg)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'sara-images',
              expiration: { maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
