/**
 * Train Depot - Service Worker
 * Caches static assets for offline-capable PWA experience
 */

const CACHE_NAME = 'train-depot-v1.4';
// Only precache assets that are versioned via ?v=N query-strings or rarely change.
// index.html is intentionally omitted — it uses network-first so HTML updates
// (new buttons, cache-bust bumps) propagate on the next load.
const STATIC_ASSETS = [
  '/manifest.json'
];

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy:
//   - API and auth: always network (no cache)
//   - HTML documents (index.html, /): network-first, cache fallback
//     (so new UI — new buttons, markup changes — ships immediately on reload)
//   - Other static assets (css, js, images): cache-first with background refresh
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always go to network for API requests and auth
  if (url.pathname.startsWith('/api/') || url.pathname === '/login.html') {
    return event.respondWith(fetch(event.request));
  }

  // Network-first for HTML documents — keeps markup fresh
  const isHtmlDoc = event.request.destination === 'document'
    || url.pathname === '/'
    || url.pathname.endsWith('.html');
  if (isHtmlDoc) {
    return event.respondWith(
      fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match(event.request).then(c => c || caches.match('/index.html')))
    );
  }

  // Cache-first for static assets, with network fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Return cache, but also update in background
        fetch(event.request).then(response => {
          if (response.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, response));
          }
        }).catch(() => {});
        return cached;
      }
      // Not in cache — fetch from network
      return fetch(event.request).then(response => {
        // Cache successful GET responses for static files
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      // Offline fallback
      if (event.request.destination === 'document') {
        return caches.match('/index.html');
      }
    })
  );
});
