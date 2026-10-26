const CACHE_NAME = 'agendafacil-pwa-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/dashboard',
  '/explorar',
  '/chat',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Ignore Next.js HMR and webpack hot updates so dev server never breaks
  if (url.pathname.startsWith('/_next/webpack-hmr') || url.pathname.includes('hot-update')) {
    return;
  }

  if (event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  }
});

// Suporte a Push Notifications nativas no celular e PC
self.addEventListener('push', (event) => {
  const data = event.data
    ? event.data.json()
    : { title: 'AgendaFácil', body: 'Você tem uma atualização no seu agendamento!' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.svg',
      badge: '/icons/icon-192.svg',
      vibrate: [200, 100, 200]
    })
  );
});
