/**
 * TUMSET SMART KIOS - Service Worker for Offline POS Support
 */

const CACHE_NAME = 'tumset-kios-cache-v1';

const STATIC_ASSETS = [
  '/',
  '/pos',
  '/products',
  '/categories',
  '/inventory',
  '/debts',
  '/transactions',
  '/expenses',
  '/reports',
  '/manifest.webmanifest',
  '/icons/icon.svg',
];

// Install Event - Pre-cache core routes
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network First with Cache Fallback for Pages, Cache First for Static Assets
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignore non-GET or cross-origin requests
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
    return;
  }

  // Next.js static files & assets -> Cache First
  if (
    request.url.includes('/_next/static/') ||
    request.url.includes('/icons/') ||
    request.url.endsWith('.svg') ||
    request.url.endsWith('.png') ||
    request.url.endsWith('.css')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // HTML Page Navigation -> Network First, fall back to Cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // If offline, retrieve from cache or return cached /pos or /
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          return caches.match('/pos') || caches.match('/');
        })
    );
    return;
  }

  // Default Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
