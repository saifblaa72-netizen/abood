const CACHE_NAME = 'waheeba-fashion-v3';
const urlsToCache = [
  '/logo.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'وهيبة فاشن';
  const options = {
    body: data.body || '',
    icon: '/logo.png',
    badge: '/logo.png',
    image: data.image || undefined,
    tag: data.tag || 'waheeba-general',
    dir: 'rtl',
    lang: 'ar',
    data: { url: data.url || '/' },
    actions: [{ action: 'open', title: 'شوفي المنتج' }]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetPath = (event.notification.data && event.notification.data.url) || '/';
  const targetUrl = new URL(targetPath, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (new URL(client.url).origin === self.location.origin && 'focus' in client) {
          return client.navigate ? client.navigate(targetUrl).then((c) => c && c.focus()) : client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});

// The HTML must never be served from cache first. Every deploy produces a new
// bundle filename, so a cached index.html asks for a bundle that no longer
// exists. The SPA rewrite answers that request with index.html instead of a
// 404, the browser tries to run HTML as JavaScript, and the page renders blank.
// Network-first for navigations keeps returning visitors on the current build.
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  const isNavigation =
    request.mode === 'navigate' ||
    (request.destination === '' && request.headers.get('accept') || '').includes('text/html');

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/', copy)).catch(() => {});
          return response;
        })
        // Offline only: fall back to the last page we successfully loaded.
        .catch(() => caches.match('/').then((cached) => cached || Response.error()))
    );
    return;
  }

  // Build output is content-hashed, so a hit is always the right file. A miss
  // goes to the network and is never substituted with index.html.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && url.pathname.startsWith('/static/')) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return response;
      });
    })
  );
});
