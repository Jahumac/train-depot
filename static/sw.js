/**
 * Train Depot - Service Worker
 * Caches static assets, API data, and uploaded images for a fast PWA experience.
 */

const CACHE_NAME = 'train-depot-v1.7';
const DATA_CACHE = 'train-depot-data-v1';

const STATIC_ASSETS = [
  '/manifest.json'
];

// API paths that should be cached (network-first, cache fallback)
const CACHEABLE_API = [
  '/api/items',
  '/api/stats',
  '/api/categories',
  '/api/tags',
  '/api/settings'
];

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches (both static + data)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== DATA_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy:
//   - Auth endpoints: always network (never cache)
//   - Cacheable API (items, stats, categories, tags): network-first, cache fallback
//   - Uploaded images (/uploads/): cache-first (images rarely change)
//   - HTML documents: network-first, cache fallback
//   - Other static assets (css, js, fonts): cache-first + background refresh
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;

  // Auth and mutation endpoints — always network, never cache
  if (url.pathname.startsWith('/api/auth/') || url.pathname === '/login.html') {
    return event.respondWith(fetch(event.request));
  }

  // Cacheable API data — network-first, stash in DATA_CACHE, fall back on offline
  const isApiData = CACHEABLE_API.some(p => url.pathname === p || url.pathname.startsWith(p + '?') || url.pathname.startsWith(p + '/'));
  if (isApiData) {
    return event.respondWith(
      fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(DATA_CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match(event.request))
    );
  }

  // Non-cacheable API (export, import, share, etc.) — always network
  if (url.pathname.startsWith('/api/')) {
    return event.respondWith(fetch(event.request));
  }

  // Uploaded images — cache-first (once an image is uploaded it doesn't change)
  if (url.pathname.startsWith('/uploads/')) {
    return event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
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

  // Cache-first for static assets, with network fallback + background refresh
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
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      if (event.request.destination === 'document') {
        return caches.match('/index.html');
      }
    })
  );
});
