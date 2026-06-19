/**
 * Service Worker — Al-Quran Digital Indonesia
 *
 * Minimalist SW yang fokus pada:
 * 1. PWA installability (browser butuh SW untuk fire beforeinstallprompt)
 * 2. Offline-first untuk static assets (precache shell)
 * 3. Network-first untuk navigation & API (selalu fresh kalau online)
 *
 * Note: Aplikasi sudah pakai TanStack Query untuk cache API di memory
 * dengan staleTime strategi, jadi SW cukup handle static assets.
 */

const CACHE_VERSION = "v1";
const STATIC_CACHE = `alquran-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `alquran-runtime-${CACHE_VERSION}`;

// Precache critical static assets
const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon.svg",
  "/icons/icon-maskable.svg",
];

// ============================================================================
// Install — precache shell
// ============================================================================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch((err) => console.error("[SW] Install failed", err)),
  );
});

// ============================================================================
// Activate — cleanup old caches
// ============================================================================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== RUNTIME_CACHE)
            .map((name) => {
              console.log("[SW] Deleting old cache:", name);
              return caches.delete(name);
            }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// ============================================================================
// Fetch — smart caching strategy
// ============================================================================
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip API calls (equran.id, aladhan, etc.) — biar TanStack Query handle
  if (
    url.hostname.includes("equran.id") ||
    url.hostname.includes("aladhan.com") ||
    url.hostname.includes("quranicaudio.com") ||
    url.hostname.includes("islamic.network") ||
    url.hostname.includes("everyayah.com") ||
    url.hostname.includes("ip-api.com") ||
    url.hostname.includes("nominatim.openstreetmap.org") ||
    url.hostname.includes("youtube.com") ||
    url.hostname.includes("ytimg.com")
  ) {
    return; // Default browser behavior (no SW intervention)
  }

  // Same-origin requests
  if (url.origin === self.location.origin) {
    // Navigation requests — network-first dengan fallback ke cache
    if (request.mode === "navigate") {
      event.respondWith(
        fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response.ok) {
              const clone = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => {
            // Offline fallback — serve from cache, fallback ke root
            return caches.match(request).then((cached) => cached || caches.match("/"));
          }),
      );
      return;
    }

    // Static assets (JS, CSS, images, fonts) — cache-first
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => {
            // Fallback untuk images yang gak ke-cache
            if (request.destination === "image") {
              return new Response("", { status: 404 });
            }
            throw new Error("Network error");
          });
      }),
    );
  }
});

// ============================================================================
// Message — untuk force update dari client (skipWaiting trigger)
// ============================================================================
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});