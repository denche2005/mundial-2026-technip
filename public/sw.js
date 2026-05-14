/* Minimal service worker for PWA installability (Next.js static file).
 * Network-first; no offline shell. Extend with precache if needed later. */
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
