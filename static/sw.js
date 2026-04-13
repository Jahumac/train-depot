/**
 * Train Depot - Service Worker
 * Caches static assets for offline-capable PWA experience
 */

const CACHE_NAME = 'train-depot-v1.2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/reference-db.js',
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

// Fetch: network-first for API, cache-first for static assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always go to network for API requests and auth
  if (url.pathname.startsWith('/api/') || url.pathname === '/login.html') {
    return event.respondWith(fetch(event.request));
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
