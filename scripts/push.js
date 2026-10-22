// ============================================================
// PUSH.JS — Web Push bildirişləri (Firebase Cloud Messaging)
//
// Axın:
//   1. İstifadəçi "Aç" düyməsinə basır → brauzer icazə soruşur (yalnız klikdən sonra).
//   2. /sw.js qeydiyyatdan keçir, FCM bu brauzer üçün token verir.
//   3. Token /api/push vasitəsilə serverə (Firestore: push_tokens) yazılır.
//   4. Admin paneldən göndəriləndə server FCM ilə həmin tokenlərə push yollayır, sw.js göstərir.
//
// Düymə/kart HTML-də `[data-push-box]` olan hər elementin içinə çəkilir (yeniliklər paneli + ayarlar).
// firebase.js-dən SONRA, app-core.js-dən sonra yüklənir.
// ============================================================
(function () {
  'use strict';

  const U = window.UNEC || {};
  const API = ((typeof BACKEND_URL !== 'undefined' && BACKEND_URL) || 'https://ericismyhero-github-io.vercel.app') + '/api/push';
  const K_ON = 'push_on';        // '1' — istifadəçi bu cihazda bildirişi aktiv edib
  const K_META = 'push_meta';    // { token, uid, lang, ts } — serverə axırıncı göndərilən vəziyyət
  const RESYNC_MS = 7 * 24 * 60 * 60 * 1000;

  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = U.esc || (s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
  const ic = U.ic || (n => `<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`);
  const tr = k => (typeof t === 'function' ? t(k) : k);
  const toast = (m, type) => { if (U.toast) U.toast(m, type); };
  const curLang = () => (typeof lang !== 'undefined' && lang === 'en') ? 'en' : 'az';

  const ls = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
    getJSON(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    setJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  // ── Mühit ───────────────────────────────────────────────────
  const hasApis = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = () => (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  const firebaseReady = () => typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0 && typeof firebase.messaging === 'function';
  const currentUser = () => (typeof getCurrentUser === 'function' ? getCurrentUser() : null);

  async function fcmSupported() {
    try {
      if (typeof firebase.messaging.isSupported !== 'function') return true;
      return !!(await Promise.resolve(firebase.messaging.isSupported()));
    } catch (e) { return false; }
  }

  // 'unsupported' | 'ios' | 'denied' | 'off' | 'on'
  function state() {
    if (!hasApis()) return (isIOS() && !isStandalone()) ? 'ios' : 'unsupported';
    if (Notification.permission === 'denied') return 'denied';
    if (Notification.permission === 'granted' && ls.get(K_ON) === '1') return 'on';
    return 'off';
  }

  // ── UI ──────────────────────────────────────────────────────
  let busy = false;

  function render() {
    const s = state();
    $$('[data-push-box]').forEach(box => {
      if (s === 'unsupported') { box.hidden = true; box.innerHTML = ''; return; }
      let title, desc, btn = '';
      if (s === 'on') {
        title = tr('pushOnTitle'); desc = tr('pushOnDesc');
        btn = `<button class="btn btn--secondary btn--sm" type="button" data-push-action="disable"${busy ? ' disabled' : ''}>${esc(tr('pushDisable'))}</button>`;
      } else if (s === 'denied') {
        title = tr('pushDeniedTitle'); desc = tr('pushDeniedDesc');
      } else if (s === 'ios') {
        title = tr('pushIosTitle'); desc = tr('pushIosDesc');
      } else {
        title = tr('pushTitle'); desc = tr('pushDesc');
        btn = `<button class="btn btn--primary btn--sm" type="button" data-push-action="enable"${busy ? ' disabled' : ''}>${esc(tr('pushEnable'))}</button>`;
      }
      box.hidden = false;
      box.dataset.state = s;
      box.innerHTML = `<span class="push-ic">${ic('bell')}</span><span class="push-text"><b>${esc(title)}</b><small>${esc(desc)}</small></span>${btn}`;
    });
  }

  // ── Server ──────────────────────────────────────────────────
  async function api(payload) {
    const r = await fetch(API, payload
      ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      : undefined);
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(j.error || ('HTTP ' + r.status)); e.code = j.error; throw e; }
    return j;
  }

  async function idTokenOrNull() {
    try { const u = currentUser(); return u ? await u.getIdToken() : null; } catch (e) { return null; }
  }

  // FCM tokeni (icazə artıq verilmiş olmalıdır — burada sorğu çıxmır)
  async function getFcmToken() {
    const cfg = await api();                                   // GET → { enabled, vapidKey }
    if (!cfg.enabled || !cfg.vapidKey) throw new Error('push_disabled');
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;                       // aktiv worker olmadan subscribe() işləmir
    const token = await firebase.messaging().getToken({ vapidKey: cfg.vapidKey, serviceWorkerRegistration: reg });
    if (!token) throw new Error('no_token');
    return token;
  }

  async function saveToServer(token) {
    const u = currentUser();
    await api({ action: 'subscribe', token, lang: curLang(), idToken: await idTokenOrNull() });
    ls.setJSON(K_META, { token, uid: u ? u.uid : null, lang: curLang(), ts: Date.now() });
  }

  // ── Əməliyyatlar ────────────────────────────────────────────
  async function enable() {
    if (busy) return;
    if (!hasApis() || !firebaseReady()) { toast(tr('pushToastErr'), 'error'); return; }
    busy = true; render();
    try {
      if (Notification.permission !== 'granted') {
        const perm = await Notification.requestPermission();   // klik jestindən dərhal sonra
        if (perm !== 'granted') return;                        // rədd / bağladı → finally düyməni bərpa edir
      }
      if (!(await fcmSupported())) throw new Error('unsupported');
      await saveToServer(await getFcmToken());
      ls.set(K_ON, '1');
      toast(tr('pushToastOn'));
    } catch (e) {
      console.warn('[push] aktivləşdirmə xətası:', e);
      toast(tr('pushToastErr'), 'error');
    } finally {
      busy = false; render();
    }
  }

  async function disable() {
    if (busy) return;
    busy = true; render();
    try {
      const meta = ls.getJSON(K_META);
      if (meta && meta.token) { try { await api({ action: 'unsubscribe', token: meta.token }); } catch (e) { console.warn('[push] serverdən silinmədi:', e); } }
      if (firebaseReady()) { try { await firebase.messaging().deleteToken(); } catch (e) { /* token artıq yoxdur */ } }
      ls.del(K_ON); ls.del(K_META);
      toast(tr('pushToastOff'));
    } finally {
      busy = false; render();
    }
  }

  // Aktiv abunəlikdə: giriş/çıxış, dil dəyişikliyi və ya 7 gün keçəndə serveri yenilə
  // (hesabı tokenə bağlayır, çıxış edəndə ayırır, köhnəlmiş tokeni təzələyir).
  async function sync() {
    if (state() !== 'on' || !firebaseReady()) return;
    try {
      const meta = ls.getJSON(K_META);
      const u = currentUser();
      const fresh = meta && meta.token && (meta.uid || null) === (u ? u.uid : null) &&
                    meta.lang === curLang() && Date.now() - (meta.ts || 0) < RESYNC_MS;
      if (fresh) return;
      if (!(await fcmSupported())) return;
      await saveToServer(await getFcmToken());
    } catch (e) { console.warn('[push] sinxronizasiya xətası:', e); }
  }

  // ── Qoşulma ─────────────────────────────────────────────────
  function init() {
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-push-action]');
      if (b) { (b.dataset.pushAction === 'enable' ? enable : disable)(); return; }
      // panel açılanda vəziyyəti təzələ (icazə brauzerdən dəyişdirilmiş ola bilər)
      if (e.target.closest('#notifBtn, #rowNews, #rowSettings')) render();
    }, true);
    window.addEventListener('unec:authchange', sync);          // firebase.js: ilk auth vəziyyəti, giriş, çıxış
    window.addEventListener('unec:langchange', () => { render(); sync(); });
    render();
  }

  U.push = { enable, disable, state, sync };
  window.UNEC = U;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
