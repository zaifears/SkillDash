// SkillDash Service Worker for Caching Optimization
const CACHE_NAME = 'skilldash-v1.0.0';
const STATIC_CACHE = 'skilldash-static-v1.0.0';
const DYNAMIC_CACHE = 'skilldash-dynamic-v1.0.0';

// ✅ OPTIMIZED: Cache static assets
const STATIC_ASSETS = [
  '/',
  '/auth',
  '/discover',
  '/learn-skill',
  '/opportunities',
  '/profile',
  '/resume-feedback',
  '/about-us',
  '/_next/static/css/',
  '/_next/static/chunks/',
  '/manifest.json'
];

// ✅ OPTIMIZED: API routes to cache
const CACHE_API_ROUTES = [
  '/api/resume-feedback',
  '/api/discover-chat'
];

// ✅ OPTIMIZED: External resources to cache
const EXTERNAL_RESOURCES = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdn.contentful.com'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('SkillDash Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('SkillDash Service Worker activated');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE && 
                     cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ✅ OPTIMIZED: Different strategies for different types of requests
  
  // Strategy 1: Cache-first for static assets
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'font' ||
      url.pathname.includes('/_next/static/')) {
    
    event.respondWith(cacheFirst(request));
    return;
  }

  // Strategy 2: Network-first for API calls with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  // Strategy 3: Stale-while-revalidate for pages
  if (request.destination === 'document') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Strategy 4: Cache-first for images and other assets
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Strategy 5: Network-first for everything else
  event.respondWith(networkFirst(request));
});

// ✅ OPTIMIZED: Cache-first strategy
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache-first strategy failed:', error);
    return new Response('Offline - content not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// ✅ OPTIMIZED: Network-first with cache fallback
async function networkFirstWithCache(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      // Only cache successful API responses, not errors
      if (networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(JSON.stringify({
      error: 'Network unavailable and no cached data',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ✅ OPTIMIZED: Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  return cachedResponse || fetchPromise;
}

// ✅ OPTIMIZED: Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// ✅ OPTIMIZED: Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'resume-feedback-sync') {
    event.waitUntil(syncResumeData());
  }
});

async function syncResumeData() {
  // Handle offline resume feedback submissions
  console.log('Syncing resume feedback data...');
  // Implementation would depend on your offline storage strategy
}

// ✅ OPTIMIZED: Push notifications (future enhancement)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: data.url
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});
