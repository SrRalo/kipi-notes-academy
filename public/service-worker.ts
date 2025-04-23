/// <reference lib="webworker" />

const CACHE_NAME = 'kipi-v1';
const OFFLINE_URL = '/offline.html';
const OFFLINE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  // Archivos CSS y JS principales
  '/index.css',
  '/src/main.tsx',
  // Fuentes
  '/fonts/Aeonik-Regular.woff2',
  '/fonts/Aeonik-Medium.woff2',
  '/fonts/Aeonik-Bold.woff2'
];

// Install event - cache static assets
self.addEventListener('install', ((event) => {
  (event as ExtendableEvent).waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Cache offline page and static assets
      await cache.addAll(OFFLINE_ASSETS);
    })()
  );
  // Force service worker activation
  void (self as unknown as ServiceWorkerGlobalScope).skipWaiting();
}) as EventListener);

// Activate event - cleanup old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      // Enable navigation preload if available
      if ((self as unknown as ServiceWorkerGlobalScope).registration.navigationPreload) {
        await (self as unknown as ServiceWorkerGlobalScope).registration.navigationPreload.enable();
      }

      // Clear old caches
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );

      // Take control of all pages immediately
      await (self as unknown as ServiceWorkerGlobalScope).clients.claim();
    })()
  );
});

// Fetch event - implement stale-while-revalidate strategy
self.addEventListener('fetch', (event: FetchEvent) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Handle API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      (async () => {
        try {
          // Try network first for API requests
          const networkResponse = await fetch(event.request);
          if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }
          throw new Error('Network response was not ok');
        } catch (error) {
          // If network fails, try cache
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;
          
          // If no cache, return offline JSON response
          return new Response(
            JSON.stringify({ error: 'Currently offline' }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 503,
              statusText: 'Service Unavailable',
            }
          );
        }
      })()
    );
    return;
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try to use navigation preload response if available
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) return preloadResponse;

          // Otherwise try network
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // If offline, try cache
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(event.request);
          if (cachedResponse) return cachedResponse;

          // If no cache, return offline page
          return cache.match(OFFLINE_URL);
        }
      })()
    );
    return;
  }

  // For other requests use stale-while-revalidate
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Try cache first
      const cachedResponse = await cache.match(event.request);
      
      // Revalidate cache in background
      const networkResponsePromise = fetch(event.request).then(
        (networkResponse) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        }
      );

      // Return cached response or wait for network
      return cachedResponse || networkResponsePromise;
    })()
  );
});