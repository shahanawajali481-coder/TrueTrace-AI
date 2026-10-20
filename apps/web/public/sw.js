const CACHE_NAME = 'truetrace-static-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/shield.svg',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Cache only safe static assets, never cache /api/ calls or sensitive user reports!
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strictly skip caching for API calls, private tokens, or scans
  if (url.pathname.startsWith('/api/') || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).catch(() => {
          // If offline and requesting navigation, return index
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        })
      );
    })
  );
});
