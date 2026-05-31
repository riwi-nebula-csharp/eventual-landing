/**
 * ============================================================
 *  service-worker.js — PWA Service Worker | Teatro Eventual
 * ============================================================
 */

const CACHE_NAME    = 'eventual-v1';
const CACHE_TIMEOUT = 3000; // ms antes de ir a red si el cache tarda

// Archivos estáticos que se cachean en la instalación
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './js/app.js',
  './js/api.js',
  './js/api.events.js',
  './js/auth.js',
  './js/router.js',
  './js/components/navbar.js',
  './js/view/home.js',
  './js/view/login.js',
  './js/view/register.js',
  './js/view/callback.js',
  './js/view/plays.js',
  './js/view/performances.js',
  './js/view/seats.js',
  './js/view/tickets.js',
  './js/view/pqrs.js',
  './js/view/profile.js',
];

// ── Instalación: cachear assets estáticos ────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activación: limpiar caches viejos ────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: Cache-first para assets, Network-first para API ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Las llamadas a las APIs siempre van a la red
  if (
    url.hostname.includes('service.auth.nebula') ||
    url.hostname.includes('service.events.nebula') ||
    url.hostname.includes('stripe.com') ||
    url.hostname.includes('js.stripe.com')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Solo GET para el resto
  if (event.request.method !== 'GET') return;

  // Recursos externos (fonts, tailwind CDN) → network first con fallback a cache
  if (url.hostname !== self.location.hostname) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Assets propios → Cache first, luego red
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return res;
        });
      })
      .catch(() => caches.match('./index.html'))
  );
});
