const CACHE_VERSION = "v1";
const CACHE_NAME = `sidejob-hourly-${CACHE_VERSION}`;

// GitHub Pages は /sidejob-hourly/ 配下なので相対でOK
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // ページ遷移（ナビゲーション）は「ネット優先→ダメならキャッシュ」
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put("./", copy));
        return res;
      }).catch(() => caches.match("./"))
    );
    return;
  }

  // それ以外は「キャッシュ優先」
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
