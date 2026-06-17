/**
 * Al-Quran Digital Service Worker
 * - Cache-first untuk static assets
 * - Network-first untuk API dengan fallback ke cache
 * - Offline fallback page
 */

const STATIC_CACHE = 'alquran-static-v1';
const API_CACHE = 'alquran-api-v1';
const AUDIO_CACHE = 'alquran-audio-v1';
const IMAGE_CACHE = 'alquran-images-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-maskable.svg',
];

// Install: precache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Some static assets failed to cache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return ![STATIC_CACHE, API_CACHE, AUDIO_CACHE, IMAGE_CACHE].includes(name);
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch: routing strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) return;

  // 1. Al-Quran API (equran.id) - NetworkFirst
  if (url.origin === 'https://equran.id') {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // 2. Aladhan API - NetworkFirst
  if (url.origin === 'https://api.aladhan.com') {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // 3. Audio files - CacheFirst
  if (
    url.origin === 'https://download.quranicaudio.com' ||
    url.origin === 'https://server8.mp3quran.net' ||
    url.origin === 'https://everyayah.com' ||
    url.origin === 'https://cdn.islamic.network'
  ) {
    event.respondWith(cacheFirst(request, AUDIO_CACHE));
    return;
  }

  // 4. Images - CacheFirst
  if (/\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // 5. Same-origin static assets - CacheFirst
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
});

// NetworkFirst: try network, fallback to cache
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.log('[SW] Network failed, using cache:', request.url);
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

// CacheFirst: try cache, fallback to network
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    // Refresh cache in background
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          caches.open(cacheName).then((cache) => cache.put(request, response));
        }
      })
      .catch(() => {});
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.error('[SW] Fetch failed:', request.url);
    throw err;
  }
}

// Message: skip waiting on update
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});