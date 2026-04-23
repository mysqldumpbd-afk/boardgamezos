// ── Service Worker — BOARDGAMEZ OS v3 ───────────────────────────
// Simple network-first for CDN, cache-first for local JSX files.
// No addAll on install — avoids crashing on CDN failures.

const VERSION = 'bgos-v4';
const LOCAL_FILES = [
  '/boardgamezos/styles.css',
  '/boardgamezos/app.js',
  '/boardgamezos/config-interpreter.js',
  '/boardgamezos/engine-schema.js',
  '/boardgamezos/schema-utils.js',
  '/boardgamezos/runtime-resolver.js',
  '/boardgamezos/official-presets.js',
  '/boardgamezos/tools.jsx',
  '/boardgamezos/strike.jsx',
  '/boardgamezos/generic.jsx',
  '/boardgamezos/runtime.jsx',
  '/boardgamezos/components.jsx',
  '/boardgamezos/builder.jsx',
  '/boardgamezos/builder-vnext.jsx',
];

// Install: open cache only, don't pre-fetch (avoids addAll failures)
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(() => self.skipWaiting()));
});

// Activate: clear old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch strategy:
// - CDN (Firebase, React, Babel, Google Fonts, animejs) → network only
// - Local JSX/JS/CSS → cache-first, cache on miss
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Skip non-GET
  if (e.request.method !== 'GET') return;

  // Skip CDN requests — let them go straight to network
  const cdnHosts = ['gstatic.com','unpkg.com','cdnjs.cloudflare.com','fonts.googleapis.com','fonts.gstatic.com','firebaseio.com','googleapis.com'];
  if (cdnHosts.some(h => url.includes(h))) return;

  // Local files: cache-first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type !== 'opaque') {
          const clone = res.clone();
          caches.open(VERSION).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached || new Response('', { status: 503 }));
    })
  );
});
