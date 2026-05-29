// Minimal service worker for installability + basic offline shell caching.
const CACHE = "ruxi-v1";
const ASSETS = ["/login", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  // Network-first for navigation, fallback to cache.
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match(req).then((r) => r || caches.match("/login"))));
    return;
  }
});
