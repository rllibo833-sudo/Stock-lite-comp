/**
 * STOCKLITE Service Worker
 * Offline-first PWA service worker untuk app inventory management
 * Caches app shell dan memungkinkan penggunaan tanpa internet
 */

const CACHE_NAME = 'stocklite-v1';
const RUNTIME_CACHE = 'stocklite-runtime-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/icon.svg',
  '/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png'
];

// Install event - cache app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell...');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('[SW] Install error:', err))
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
      .catch(err => console.error('[SW] Activate error:', err))
  );
});

// Fetch event - Network first, fallback to cache, then offline page
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external APIs and CDNs
  if (!url.origin.includes(self.location.origin) && !url.hostname.includes('fonts')) {
    return;
  }

  // For app assets and navigation
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // Return cached response if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Try network
        return fetch(request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clone and cache successful response
            const responseToCache = response.clone();
            const isDocument = request.mode === 'navigate' || 
                              request.headers.get('accept')?.includes('text/html');
            const cacheToUse = isDocument ? CACHE_NAME : RUNTIME_CACHE;

            caches.open(cacheToUse)
              .then(cache => {
                cache.put(request, responseToCache);
              })
              .catch(err => console.error('[SW] Cache put error:', err));

            return response;
          })
          .catch(err => {
            console.error('[SW] Fetch error:', err);
            
            // Return cached version if available
            return caches.match(request)
              .then(cachedResponse => {
                if (cachedResponse) {
                  return cachedResponse;
                }

                // For navigation requests, return cached index.html
                if (request.mode === 'navigate') {
                  return caches.match('/index.html');
                }

                // Return empty response for other requests
                return new Response('Offline', {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: new Headers({
                    'Content-Type': 'text/plain'
                  })
                });
              });
          });
      })
      .catch(err => {
        console.error('[SW] Error in fetch handler:', err);
        // Last resort: return offline response
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('Offline', { status: 503 });
      })
  );
});

// Message handler untuk update checking
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker loaded');
