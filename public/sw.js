// Minimal service worker: exists primarily to satisfy PWA installability
// (Chrome requires an active SW with a fetch handler) and to cache the
// static app shell (icons, manifest, hashed Next.js build assets) so the
// app opens instantly on repeat visits. Page navigations and data always
// go to the network first — masjid listings and prayer timings must stay
// fresh — falling back to cache only if the device is offline.

const CACHE_NAME = "qareeb-shell-v2";
const SHELL_ASSETS = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Next.js hashed build assets, icons, manifest and favicon: cache-first,
  // they never change content under the same URL (and the manifest/favicon
  // are re-fetched on every SW install anyway via SHELL_ASSETS above).
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/favicon.ico"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Page navigations and everything else (masjid data, prayer timings):
  // network-first so content is always current, falling back to a cached
  // copy only when the network is unreachable. Every successful navigation
  // response is cached as it's served, so there is actually something to
  // fall back to next time the device is offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
    );
  }
});
