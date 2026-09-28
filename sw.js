/* =========================================================
   HeyNuo Service Worker - Resilient Offline PWA Engine
   Caches app shell, article pages, CSS, JS, and Ruqyah text.
   ========================================================= */

const CACHE_NAME = 'heynuo-cache-v1';

const PRECACHE_URLS = [
  './',
  'index.html',
  'ruqyah.html',
  'quran.html',
  'quran-verses.html',
  'java-oop.html',
  'jinn-islamic-theology.html',
  'web-dev-guide.html',
  'about.html',
  'contact.html',
  'privacy.html',
  '404.html',
  'manifest.json',
  'rss.xml',
  'css/style.css',
  'css/home.css',
  'css/contact.css',
  'css/ruqyah.css',
  'css/quran.css',
  'css/quran-player.css',
  'css/master-verses.css',
  'js/script.js',
  'js/ruqyah.js',
  'js/ruqyah-data.js',
  'js/quran-player.js',
  'js/quran-page.js',
  'js/master-verses.js',
  'js/master-verses-data.js',
  'assets/banners/og-banner.jpg',
  'assets/banners/hero-banner.jpg',
  'assets/banners/java-oop.jpg',
  'assets/banners/quran-cover.jpg',
  'assets/banners/ruqyah-theology.jpg',
  'assets/banners/web-dev.jpg',
  'assets/icons/quran.png',
  'assets/icons/rocket.png',
  'assets/icons/sparkles.png',
  'assets/icons/search.png',
  'assets/icons/github.png',
  'assets/icons/moon.png',
  'assets/icons/sun.png',
  'assets/icons/menu.png',
  'assets/icons/email.png'
];

// Install Event - Pre-cache essential app shell and content
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[Service Worker] Non-critical precache item skipped:', err);
      });
    })
  );
});

// Activate Event - Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-while-revalidate for local assets; network-first for external audio
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Audio files (.mp3): direct stream over network to avoid bloat
  if (url.pathname.endsWith('.mp3') || request.url.includes('everyayah.com') || request.url.includes('alislam.cloud') || request.url.includes('mp3quran.net')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response('Audio stream offline', { status: 503, statusText: 'Offline Audio' });
      })
    );
    return;
  }

  // Handle same-origin requests with Cache-First / Stale-While-Revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Fetch updated version in background to keep cache fresh
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => {/* Offline fallback handles it */});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          return networkResponse;
        }).catch(() => {
          // If HTML page failed offline, serve cached index or 404
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('index.html') || caches.match('404.html');
          }
        });
      })
    );
  }
});
