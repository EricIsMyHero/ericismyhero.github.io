// Service Worker — keş sistemi yoxdur (PDF-lər birbaşa GitHub/CDN-dən açılır).
// Yeganə vəzifəsi: push bildirişlərini göstərmək və kliklənəndə saytı açmaq.
// Bu fayl yalnız istifadəçi bildirişləri aktiv edəndə qeydiyyatdan keçir (scripts/push.js).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

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
