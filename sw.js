// ── Service Worker — BOARDGAMEZ OS ──────────────────────────────
// Cache JSX files after first load for faster subsequent loads.
// Cache-busting: increment VERSION to force refresh on deploy.

const VERSION = 'bgos-v2';
const STATIC = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/config-interpreter.js',
  '/tools.jsx',
  '/strike.jsx',
  '/generic.jsx',
  '/runtime.jsx',
  '/components.jsx',
  // builder is heavy — cache it too
  '/builder.jsx',
];

// Install: pre-cache static assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

// Activate: clear old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for static, network-first for Firebase
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Skip Firebase and external CDN — always network
  if (url.hostname !== location.hostname) return;

  // Cache-first strategy for local files
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(VERSION).then(c => c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});
