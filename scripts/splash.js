/* ══════════════════════════════════════════════════════════════════
   SPLASH CONTROLLER — açılış ekranının ömür dövrü (vizual hissə: styles/splash.css)

   Dövlət maşını:   running ─▶ leaving ─▶ done
                       └────▶ failed ──▶ (Yenidən cəhd | Yenə də davam et) ──▶ leaving ─▶ done

   Splash AŞAĞIDAKILARIN HAMISI olduqda çəkilir (heç biri tək başına kifayət deyil):
     clock  — animasiyanın əsas hissəsi bitib (full ≈3.2s, short ≈1.2s, reduced-motion ≈0.7s)
     dom    — DOMContentLoaded + ilk marşrut çəkilib (app-screens.js → U.initCore() sinxrondur)
     fonts  — Google Fonts CSS gəlib və document.fonts.ready (tavan: 1.5s)
     auth   — Firebase ilk auth vəziyyətini bildirib (tavan: 1.8s; Firebase yoxdursa gözləmir)

   Təhlükəsizlik:
     • 5s-də hazır deyilsə → "Hələ yüklənir…" statusu (interfeys saxta açılmır)
     • 15s-də və ya əsas skript yüklənməsə → xəta ekranı: "Yenidən cəhd et" / "Yenə də davam et"
     • splash.js heç başlamasa → head-dəki sığorta 6s-də splash-ı sökür (__spCleanup)
     • Tətbiqin öz kodu bu fayldan asılı DEYİL: heç bir app faylına qarışmır, yalnız
       Firebase-in ictimai API-sinə (onAuthStateChanged) bir əlavə dinləyici qoşur.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var W = window, D = document, H = D.documentElement;
  if (W.__unecSplashStarted) return;                         // təkrar splash olmasın
  var mode = H.getAttribute('data-splash');
  if (mode !== 'full' && mode !== 'short') return;           // 'none' → head skripti artıq təmizləyib
  W.__unecSplashStarted = true;

  var CFG = {
    slowAt: 5000,       // bu müddətdən sonra "hələ yüklənir" statusu
    failAt: 15000,      // bu müddətdən sonra xəta/retry ekranı
    authCap: 1800,      // auth-u gözləmə tavanı (controller başlanğıcından)
    fontCap: 1500,      // şrift gözləmə tavanı (DOM hazır olandan sonra)
    skipAfter: 800,     // toxunub keçmək bundan sonra mümkündür
    leaveMs: mode === 'short' ? 350 : 450
  };

  var TXT = {
    az: {
      loading: 'UNEC Students Hub yüklənir',
      slow: 'Hələ yüklənir… bir az gözləyin',
      fail: 'Yükləmə alınmadı. İnternet bağlantınızı yoxlayıb yenidən cəhd edin.',
      retry: 'Yenidən cəhd et',
      cont: 'Yenə də davam et'
    },
    en: {
      loading: 'UNEC Students Hub is loading',
      slow: 'Still loading… please wait',
      fail: 'Couldn’t load. Check your connection and try again.',
      retry: 'Try again',
      cont: 'Continue anyway'
    }
  };
  var lang = 'az';
  try { if (W.localStorage.getItem('lang') === 'en') lang = 'en'; } catch (e) {}
  var T = TXT[lang];

  var root = null, clockAnim = null, state = 'init';
  var t0 = 0;
  var timers = [];
  var sig = { clock: false, dom: false, fonts: false, auth: false };
  var inerted = [];
  var cleaners = [];
  var authOff = null;
  var completedNormally = false;

  function now() { return (W.performance && performance.now) ? performance.now() : Date.now(); }
  function later(fn, ms) { var id = setTimeout(fn, Math.max(0, ms)); timers.push(id); return id; }
  function at(ms, fn) { return later(fn, t0 + ms - now()); }      // controller-in başlanğıcına görə
  function on(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    cleaners.push(function () { target.removeEventListener(type, fn, opts); });
  }
  function q(sel) { return root.querySelector(sel); }
  function setSR(txt) { var el = q('.sp-sr'); if (el) el.textContent = txt; }

  /* ── Hazırlıq siqnalları ────────────────────────────────────────── */
  function check() {
    if (state !== 'running') return;
    if (D.hidden) sig.clock = true;                          // səhifəyə baxan yoxdur → animasiyanı gözləmə
    if (sig.clock && sig.dom && sig.fonts && sig.auth) leave();
  }

  function watchClock() {
    var anim = clockAnim;
    if (anim && anim.finished) {
      var ok = function () { sig.clock = true; check(); };
      anim.finished.then(ok, ok);
    } else {
      later(function () { sig.clock = true; check(); }, mode === 'full' ? 3200 : 1220);
    }
  }

  function watchDom() {
    var fired = false;
    function mark() {
      if (fired) return; fired = true;
      sig.dom = true;
      watchFonts();
      check();
    }
    function after() {
      // sinxron DCL işləyiciləri (U.initCore və s.) bitsin + bir kadr çəkilsin
      if (W.requestAnimationFrame) requestAnimationFrame(function () { later(mark, 0); });
      later(mark, 300);                                       // gizli tab-da rAF dayanır
    }
    if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', after, { once: true });
    else after();
  }

  function watchFonts() {
    var settled = false;
    function ok() { if (settled) return; settled = true; sig.fonts = true; check(); }
    later(ok, CFG.fontCap);
    (function wait() {
      if (settled) return;
      // qeyri-bloklayıcı Google Fonts CSS-i (index.html-də data-sp-font) gəlib-gəlməyib
      if (D.querySelector('link[data-sp-font]:not([data-loaded])')) { later(wait, 80); return; }
      var go = function () {
        if (D.fonts && D.fonts.ready) D.fonts.ready.then(ok, ok); else ok();
      };
      if (W.requestAnimationFrame) requestAnimationFrame(function () { requestAnimationFrame(go); }); else go();
    })();
  }

  function watchAuth() {
    var done = false;
    function fin() {
      if (done) return; done = true; sig.auth = true;
      try { if (typeof authOff === 'function') authOff(); } catch (e) {}
      check();
    }
    at(CFG.authCap, fin);
    (function poll(n) {
      if (done || state === 'done') return;
      try {
        var fb = W.firebase;
        if (fb && fb.apps && fb.apps.length) {
          authOff = fb.auth().onAuthStateChanged(fin, fin);
          return;
        }
      } catch (e) { fin(); return; }
      if (n < 40) later(function () { poll(n + 1); }, 100);   // Firebase config sonradan gəlir; tavan yenə də işləyir
    })(0);
  }

  /* ── Yavaş / xəta vəziyyətləri ──────────────────────────────────── */
  function onSlow() {
    if (state !== 'running') return;
    root.setAttribute('data-sp-state', 'slow');
    setSR(T.slow);                                            // yalnız bir dəfə yenilənir
  }

  function fail() {
    if (state !== 'running') return;
    state = 'failed';
    root.setAttribute('data-sp-state', 'fail');
    setSR(T.fail);
    var btn = q('.sp-retry');
    try { if (btn) btn.focus({ preventScroll: true }); } catch (e) {}
  }

  /* ── Çıxış ──────────────────────────────────────────────────── */
  function leave() {
    if (state !== 'running' && state !== 'failed') return;
    state = 'leaving';
    root.removeAttribute('data-sp-state');
    root.classList.add('is-leaving');
    var finished = false;
    function fin() { if (finished) return; finished = true; finish(); }
    on(root, 'transitionend', function (e) { if (e.target === root && e.propertyName === 'opacity') fin(); });
    later(fin, CFG.leaveMs + 150);
  }

  function skip() {
    if (state !== 'running') return;
    if (now() - t0 < CFG.skipAfter) return;
    sig.clock = true; sig.auth = true; sig.fonts = sig.fonts || sig.dom;
    try {
      root.getAnimations({ subtree: true }).forEach(function (a) {
        var t = a.effect && a.effect.getComputedTiming && a.effect.getComputedTiming();
        if (t && isFinite(t.endTime)) a.finish();
      });
    } catch (e) {}
    check();
  }

  function finish() {
    if (state === 'done') return;
    state = 'done';
    timers.forEach(clearTimeout); timers = [];
    cleaners.forEach(function (fn) { try { fn(); } catch (e) {} }); cleaners = [];
    try { if (typeof authOff === 'function') authOff(); } catch (e) {}
    inerted.forEach(function (el) { try { el.inert = false; } catch (e) {} });
    inerted = [];
    if (completedNormally) {
      try { sessionStorage.setItem('unecSplash', '1'); } catch (e) {}
      try {
        var ts = String(Date.now());
        localStorage.setItem('unecSplashSeen', ts);
        if (mode === 'full') localStorage.setItem('unecSplashFull', ts);
      } catch (e) {}
    }
    if (W.__spCleanup) W.__spCleanup();                       // DOM, data-splash, theme-color, preload
    else if (root.parentNode) root.parentNode.removeChild(root);
    try { W.dispatchEvent(new CustomEvent('unec:splash-done', { detail: { mode: mode, ok: completedNormally } })); } catch (e) {}
  }

  /* ── Başlat ────────────────────────────────────────────────── */
  function start() {
    root = D.getElementById('splash');
    if (!root || getComputedStyle(root).display === 'none') {  // splash.css gəlməyib → heç göstərmə
      if (W.__spCleanup) W.__spCleanup();
      return;
    }
    state = 'running';

    var clock = q('.sp-clock');
    try { clockAnim = clock && clock.getAnimations && clock.getAnimations()[0] || null; } catch (e) { clockAnim = null; }
    t0 = now();                                               // slow/fail/skip hesabı controller-in başlanğıcından

    // arxa plan: splash açıqkən fokuslanmasın/oxunmasın (fokus tələsi yoxdur: Esc/toxunuş keçir, bitəndə hamısı qaytarılır).
    // Markup-dan dərhal sonra başladığımız üçün sonradan parse olunan elementləri də MutationObserver ilə tuturuq.
    if ('inert' in H) {
      var SKIP = { SCRIPT: 1, STYLE: 1, LINK: 1, NOSCRIPT: 1, TEMPLATE: 1, META: 1 };
      var lock = function (el) {
        if (!el || el.nodeType !== 1 || el === root || SKIP[el.tagName] || el.inert) return;
        el.inert = true; inerted.push(el);
      };
      for (var i = 0; i < D.body.children.length; i++) lock(D.body.children[i]);
      if (W.MutationObserver) {
        var mo = new MutationObserver(function (recs) {
          recs.forEach(function (r) { for (var j = 0; j < r.addedNodes.length; j++) lock(r.addedNodes[j]); });
        });
        mo.observe(D.body, { childList: true });
        cleaners.push(function () { mo.disconnect(); });
      }
    }

    // oxu-oxu: yalnız bir elan
    setSR(T.loading);
    var slowTxt = q('.sp-note-t'); if (slowTxt) slowTxt.textContent = T.slow;
    var f = q('.sp-fail-t'); if (f) f.textContent = T.fail;
    var r = q('.sp-retry'); if (r) r.textContent = T.retry;
    var c = q('.sp-cont'); if (c) c.textContent = T.cont;

    on(root, 'pointerdown', function (e) { if (!e.target.closest || !e.target.closest('.sp-fail')) skip(); });
    on(D, 'keydown', function (e) {
      if (state !== 'running') return;
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') skip();
    });
    on(root.querySelector('.sp-retry'), 'click', function () { W.location.reload(); });
    on(root.querySelector('.sp-cont'), 'click', function () { completedNormally = false; leave(); });

    // əsas skript yüklənməyibsə → xəta (üçüncü tərəf/async skriptlər sayılmır)
    if (W.__spErr && W.__spErr.length) fail();
    on(W, 'error', function (e) {
      var t = e.target;
      if (t && t.tagName === 'SCRIPT' && t.src && t.src.indexOf(W.location.origin) === 0 && !t.async) fail();
    }, true);

    at(CFG.slowAt, onSlow);
    at(CFG.failAt, fail);

    watchClock();
    watchDom();
    watchAuth();

    completedNormally = true;                                 // 'Yenə də davam et' bunu söndürür; yarımçıq bağlanma heç nə yazmır
    W.UNECSplash = { state: function () { return state; }, skip: skip, mode: mode };
  }

  // başlanğıc siqnalı: index.html-də splash markup-ından dərhal sonra gələn inline skript (sp:markup).
  // O vaxta qədər bütün <head> CSS-i (splash.css daxil) tətbiq olunub; DOMContentLoaded yalnız ehtiyat yoldur —
  // yavaş şəbəkədə DCL gec gəlir, splash-ın "yavaş/xəta" məntiqi isə ondan asılı olmamalıdır.
  function boot() { if (state === 'init') start(); }
  if (W.__spMarkup) boot();
  else { on(D, 'sp:markup', boot); on(D, 'DOMContentLoaded', boot); }
})();
