const CACHE_NAME = 'skilldash-cache-v1';
const urlsToCache = [
  '/',              // Home
  '/offline.html',  // Offline fallback
  '/favicon.ico',   // Essential assets
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png'
];

// Pre-cache key assets during install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Serve cached files for requests, network fallback, then offline.html
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(
      response => response ||
        fetch(event.request).catch(() => caches.match('/offline.html'))
    )
  );
});
