const CACHE_NAME = "unec-app-v1";
const urlsToCache = [
  "/unecimtahanmateriallari/",
  "/unecimtahanmateriallari/index.html",
  "/unecimtahanmateriallari/style.css",
  "/unecimtahanmateriallari/app.js",
  "/unecimtahanmateriallari/manifest.json",
  "/unecimtahanmateriallari/icon-192.png",
  "/unecimtahanmateriallari/icon-512.png",
  "/unecimtahanmateriallari/apple-touch-icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME && key !== "pdf-cache")
            .map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", event => {
  // PDF-lər üçün: açıldıqca cache et
  if (event.request.url.includes(".pdf")) {
    event.respondWith(
      caches.open("pdf-cache").then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Digər fayllar üçün: əvvəlcə cache, sonra şəbəkə
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
