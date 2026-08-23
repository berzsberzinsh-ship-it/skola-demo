const CACHE_NAME = 'SKOLA-DEMO-v2';
const urlsToCache = [
  '/index.html',
  '/styles.css',
  '/script.js',
  '/public.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.png',
  '/darkmode.gif',
  '/lightmode.gif',
  '/hamsterwheel.gif',
  '/js/i18n.js',
  '/js/demo-guide.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell');
        // Cache files individually to handle failures gracefully
        return Promise.allSettled(
          urlsToCache.map((url) =>
            cache.add(url).catch((error) => {
              console.warn(`Failed to cache ${url}:`, error);
            })
          )
        );
      })
      .then((results) => {
        const successful = results.filter(
          (r) => r.status === 'fulfilled'
        ).length;
        const failed = results.filter((r) => r.status === 'rejected').length;
        console.log(
          `Cached ${successful} files successfully, ${failed} failed`
        );
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const requestUrl = event.request.url;
  // Never cache Vercel insights/analytics or API calls
  if (
    requestUrl.includes('/api/') ||
    requestUrl.includes('/_vercel/') ||
    requestUrl.includes('/insights/')
  ) {
    event.respondWith(
      fetch(event.request)
        .then((fetchResponse) => {
          // Always try network first for API calls
          return fetchResponse;
        })
        .catch(() => {
          // For API calls, don't fallback to cache - let the app handle offline state
          return new Response(
            JSON.stringify({ error: 'Offline - no cached data available' }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
    );
  } else {
    // Cache-first strategy for other assets (app shell, images, etc.)
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).then((fetchResponse) => {
            if (
              !fetchResponse ||
              fetchResponse.status !== 200 ||
              fetchResponse.type !== 'basic'
            ) {
              return fetchResponse;
            }
            const responseToCache = fetchResponse.clone();

            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return fetchResponse;
          });
        })
        .catch((error) => {
          console.error('Fetch error:', error);
          return caches.match('/index.html');
        })
    );
  }
});

// Handle service worker updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
