// Public application shell only. Never cache APIs, credentials or remote PDFs.
importScripts('/offline-assets.js?v=20261114-semesters');
const CACHE = 'unec-static-' + self.UNEC_OFFLINE.version;
const PUBLIC_PATHS = new Set(self.UNEC_OFFLINE.assets.map(url => new URL(url, self.location.origin).pathname));
self.addEventListener('install', event => event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  await cache.addAll(self.UNEC_OFFLINE.assets.map(url => new Request(url, { cache: 'reload' })));
  await self.skipWaiting();
})()));
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const name of await caches.keys()) if (name.startsWith('unec-static-') && name !== CACHE) await caches.delete(name);
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  if (!PUBLIC_PATHS.has(url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Navigations use the shell belonging to this worker's asset version. A new
    // version becomes visible only after all its files have been downloaded.
    const hit = await cache.match(event.request, { ignoreSearch: true });
    return hit || fetch(event.request);
  })());
});

const DEFAULT_TITLE = 'UNEC Students Hub';
const ICON = '/images/icon-192.png';

// Server FCM vasitəsilə "data-only" mesaj göndərir: { data: { title, body, url } }.
// Firebase Console-dan göndərilən "notification" formatı da dəstəklənir.
function parsePush(event) {
  let p = {};
  try { p = event.data ? event.data.json() : {}; }
  catch (_) {
    try { p = { notification: { body: event.data.text() } }; } catch (__) { p = {}; }
  }
  const d = (p && p.data) || {};
  const n = (p && p.notification) || {};
  return {
    title: String(d.title || n.title || DEFAULT_TITLE),
    body: String(d.body || n.body || ''),
    url: String(d.url || (p.fcmOptions && p.fcmOptions.link) || n.click_action || '/'),
    tag: d.tag || n.tag || undefined,
  };
}

// Brauzer hər push üçün bildiriş göstərməyi tələb edir (xüsusən Safari/iOS) — ona görə həmişə göstəririk.
self.addEventListener('push', (event) => {
  const m = parsePush(event);
  event.waitUntil(self.registration.showNotification(m.title, {
    body: m.body,
    icon: ICON,
    badge: ICON,
    tag: m.tag,
    data: { url: m.url },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  let target;
  try {
    target = new URL((event.notification.data && event.notification.data.url) || '/', self.location.origin);
    if (target.protocol !== 'https:' && target.protocol !== 'http:') target = new URL('/', self.location.origin);
  } catch (_) { target = new URL('/', self.location.origin); }

  event.waitUntil((async () => {
    if (target.origin === self.location.origin) {
      const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const w of wins) {
        if (new URL(w.url).origin !== self.location.origin) continue;
        try { await w.focus(); } catch (_) {}
        if ('navigate' in w) { try { await w.navigate(target.href); } catch (_) {} }
        return;
      }
    }
    return self.clients.openWindow(target.href);
  })());
});
