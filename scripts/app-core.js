// ============================================================
// APP-CORE.JS — yeni qabıq: köməkçilər, qatlar (drawer / sheet / toast),
// naviqasiya, hash-router, tema, proqres kartı.
//
// Bu fayl ui.js-dən SONRA, app-materials.js və app-screens.js-dən ƏVVƏL yüklənir.
// Ortaq API: window.UNEC
// ============================================================
(function () {
  'use strict';

  const U = (window.UNEC = window.UNEC || {});

  // ── Köməkçilər ──────────────────────────────────────────────
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ESC_MAP[c]);
  const ic = (name, cls = '') => `<svg class="ic${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const enc = encodeURIComponent;
  const dec = s => { try { return decodeURIComponent(s); } catch (e) { return s; } };
  const tr = (key, vars) => {
    let s = t(key);
    if (vars) Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  };
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    getJSON(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } },
    setJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  // Azərbaycan hərflərini sadələşdirən axtarış normallaşdırması: "Əlavə" ≈ "elave", "İKT" ≈ "ikt"
  function normAz(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/ə/g, 'e').replace(/ı/g, 'i').replace(/\s+/g, ' ').trim();
  }

  // Köhnə Material Symbols adlarını yeni ikon sisteminə (sprite) çevirir; naməlum ad üçün köhnə şrift ehtiyatda qalır.
  const MI = {
    school: 'graduation-cap', target: 'target', workspace_premium: 'award', military_tech: 'award', menu_book: 'book-open',
    local_fire_department: 'flame', emoji_events: 'trophy', eco: 'leaf', bolt: 'zap', description: 'file-text',
    timer: 'timer', schedule: 'clock', chat_bubble: 'message', star: 'star', psychology: 'clipboard-check',
    edit_note: 'pencil', edit: 'pencil', auto_awesome: 'sparkles', auto_stories: 'book-open', search: 'search',
    check_circle: 'circle-check', cancel: 'circle-x', trending_up: 'trending-up', payments: 'wallet',
    receipt_long: 'receipt', explore: 'compass', bar_chart: 'chart', palette: 'palette', restaurant: 'utensils',
    public: 'globe', directions_boat: 'ship', work: 'briefcase', calculate: 'calculator',
    account_balance: 'landmark', luggage: 'luggage', volunteer_activism: 'hand-heart', lightbulb: 'lightbulb',
    delete: 'trash', play_arrow: 'play', pause: 'pause', skip_next: 'skip-forward', refresh: 'rotate',
    notifications: 'bell', front_hand: 'hand', fiber_manual_record: 'dot', celebration: 'sparkles', thumb_up: 'thumbs-up'
  };
  const mi = (name, cls = '') => MI[name]
    ? ic(MI[name], cls)
    : `<span class="material-symbols-outlined msi" aria-hidden="true">${esc(name)}</span>`;

  Object.assign(U, { $, $$, esc, ic, mi, enc, dec, tr, LS, normAz });

  // ── Naviqasiya tərifi (yan panel + drawer + ana səhifə kartları üçün tək mənbə) ──
  const NAV = [
    { id: 'home',       icon: 'home',            key: 'navHome',     route: '/home' },
    { id: 'courses',    icon: 'book-open',       key: 'navCourses',  route: '/courses/subjects' },   // Kurslar "Fənlər üzrə" ilə açılır
    { id: 'tests',      icon: 'clipboard-check', key: 'navTests',    route: '/tests',      fc: 'tests',    desc: 'featTestsDesc' },
    { id: 'gpa',        icon: 'calculator',      key: 'navGpa',      route: '/gpa',        fc: 'gpa',      desc: 'featGpaDesc' },
    { id: 'curriculum', icon: 'calendar-days',   key: 'navPlan',     route: '/curriculum', fc: 'plan',     desc: 'featPlanDesc' },
    { id: 'requests',   icon: 'folder-open',     key: 'navRequests', route: '/requests',   fc: 'requests', desc: 'featRequestsDesc' },
    { id: 'timer',      icon: 'timer',           key: 'navTimer',    route: '/timer',      fc: 'timer',    desc: 'featTimerDesc' },
    { id: 'dashboard',  icon: 'chart',           key: 'navDashboard',route: '/dashboard',  fc: 'dash',     desc: 'featDashDesc' },
    { id: 'support',    icon: 'heart',           key: 'navSupport',  route: '/support',    desktopOnly: true },
    { id: 'more',       icon: 'ellipsis',        key: 'navMore',     route: '/more',       desktopOnly: true }
  ];
  // Ana səhifədəki 6 funksiya kartının sırası (referans dizayna uyğun)
  const FEATURE_IDS = ['tests', 'gpa', 'requests', 'curriculum', 'timer', 'dashboard'];
  Object.assign(U, { NAV, FEATURE_IDS });

  // Hansı bölmə hansı aşağı-naviqasiya elementini işıqlandırır
  const TAB_PARENT = {
    home: 'home', tests: 'home', gpa: 'home', curriculum: 'home', requests: 'home', timer: 'home',
    courses: 'courses', support: 'support', more: 'more', dashboard: 'more'
  };
  const TAB_NAV_ID = { home: 'home', courses: 'courses', tests: 'tests', gpa: 'gpa', curriculum: 'curriculum',
    requests: 'requests', timer: 'timer', dashboard: 'dashboard', support: 'support', more: 'more' };

  function navLinkHTML(item, withSub) {
    return `<li><a class="nav-link" href="#${item.route}" data-nav="${item.id}">${ic(item.icon)}<span>${esc(t(item.key))}</span>${withSub || ''}</a></li>`;
  }

  function courseNames() { return (typeof data !== 'undefined') ? Object.keys(data) : []; }

  function renderNav() {
    const side = $('#sideNav');
    const drawer = $('#drawerNav');
    if (side)   side.innerHTML   = NAV.map(i => navLinkHTML(i)).join('');
    if (drawer) drawer.innerHTML = NAV.filter(i => !i.desktopOnly).map(i => navLinkHTML(i)).join('');
    const courseHTML = courseNames().map(c => {
      const count = Object.values(data[c].subjects).reduce((a, s) => a + s.pdfs.length, 0);
      return `<li><a class="nav-link" href="#/courses?course=${enc(c)}" data-course-link="${esc(c)}">${ic('graduation-cap')}<span>${esc(c)}</span><span class="nav-sub">${count}</span></a></li>`;
    }).join('');
    ['sideCourses', 'drawerCourses'].forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = courseHTML; });
    syncNavState();
  }

  function syncNavState() {
    if (!route) return;
    const navId = TAB_NAV_ID[route.tab] || route.tab;
    $$('.nav-link[data-nav]').forEach(a => {
      if (a.dataset.nav === navId) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    const activeCourse = (route.tab === 'courses' && route.view === 'materials') ? (U.matState && U.matState.course) : null;
    $$('.nav-link[data-course-link]').forEach(a => {
      if (activeCourse && a.dataset.courseLink === activeCourse) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    const parent = TAB_PARENT[route.tab] || 'home';
    $$('.bn-item').forEach(a => {
      if (a.dataset.route === parent) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  // ── Qatlar: drawer + sheetlər (fokus tələsi, Esc, inert, fokusun bərpası) ──
  let layer = null; // { el, scrim, opener, onKey, onClose }
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function openLayer(el, scrim, opener, onClose) {
    if (!el) return;
    if (layer) closeLayer(true);
    el.removeAttribute('inert');
    el.classList.add('is-open');
    if (scrim) scrim.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('has-layer');   // açıq panel/menyu olanda üzən AI düyməsi gizlədilir
    const onKey = e => {
      if (e.key === 'Escape') { e.stopPropagation(); closeLayer(); return; }
      if (e.key !== 'Tab') return;
      const f = $$(FOCUSABLE, el).filter(n => n.offsetParent !== null || n === document.activeElement);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    el.addEventListener('keydown', onKey);
    layer = { el, scrim, opener: opener || document.activeElement, onKey, onClose };
    const target = $('[data-autofocus]', el) || $$(FOCUSABLE, el)[0];
    if (target) setTimeout(() => target.focus({ preventScroll: true }), 30);
  }

  function closeLayer(silent) {
    if (!layer) return;
    const { el, scrim, opener, onKey, onClose } = layer;
    layer = null;
    el.removeEventListener('keydown', onKey);
    el.classList.remove('is-open');
    el.setAttribute('inert', '');
    if (scrim) scrim.classList.remove('is-visible');
    document.body.style.overflow = '';
    document.body.classList.remove('has-layer');
    if (el.id === 'appDrawer') { const mb = $('#menuBtn'); if (mb) mb.setAttribute('aria-expanded', 'false'); }
    if (onClose) onClose();
    if (!silent && opener && opener.focus && document.contains(opener)) opener.focus({ preventScroll: true });
  }

  function openDrawer() {
    const btn = $('#menuBtn');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    openLayer($('#appDrawer'), $('#drawerScrim'), btn);
    renderProgress();
  }
  function closeDrawer() { if (layer && layer.el.id === 'appDrawer') closeLayer(); }
  function toggleDrawer() { (layer && layer.el.id === 'appDrawer') ? closeLayer() : openDrawer(); }

  function openSheet(id, opener, onClose) {
    openLayer(document.getElementById(id), $('#sheetScrim'), opener, onClose);
  }
  function closeSheet() { if (layer && layer.el.classList.contains('sheet')) closeLayer(); }
  function closeAllLayers() { closeLayer(true); }

  // köhnə kodun çağırdığı adlar
  window.toggleSidebar = toggleDrawer;
  window.closeSidebar  = closeDrawer;

  Object.assign(U, { openLayer, closeLayer, openDrawer, closeDrawer, openSheet, closeSheet, closeAllLayers });

  // ── Toast ───────────────────────────────────────────────────
  let toastTimer = null;
  function toast(msg, type) {
    const el = $('#appToast'), tx = $('#appToastText');
    if (!el || !tx) return;
    tx.textContent = msg;
    el.dataset.type = type || 'ok';
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2600);
  }
  U.toast = toast;

  // ── Router ──────────────────────────────────────────────────
  // Marşrutlar:
  //   #/home  #/courses/subjects (Kurslar-ın giriş görünüşü: "Fənlər üzrə")  #/courses/subjects/<kurs>
  //   #/courses/all  #/courses?q=&course=&fav=1 (düz materiallar siyahısı; filtrli linklər)
  //   #/courses (parametrsiz) → #/courses/subjects-ə yönləndirilir
  //   #/courses/subjects/<kurs>/<fənn>  #/m/<kurs>/<fənn>/<fayl>  #/x/<kurs>/<fayl>
  //   #/tests #/gpa #/curriculum #/requests #/requests/<id> (istəyin yazışması) #/timer #/dashboard #/support #/more
  const TABS = ['home', 'courses', 'support', 'tests', 'gpa', 'dashboard', 'curriculum', 'requests', 'timer', 'more'];
  let route = null;
  let prevRoute = null;
  let depth = (history.state && history.state.i) || 0;
  const scrollMap = {};

  function parseHash(raw) {
    let h = (raw !== undefined ? raw : location.hash || '').replace(/^#/, '');
    if (!h || h === '/') h = '/home';
    const qi = h.indexOf('?');
    const pathPart = qi >= 0 ? h.slice(0, qi) : h;
    const qs = qi >= 0 ? h.slice(qi + 1) : '';
    const segs = pathPart.split('/').filter(Boolean).map(dec);
    const query = {};
    new URLSearchParams(qs).forEach((v, k) => { query[k] = v; });
    const a = segs[0];
    const base = { hash: '#' + h, segs, query };
    if (a === 'm' && segs.length >= 4)   return Object.assign(base, { tab: 'courses', view: 'material', course: segs[1], subject: segs[2], file: segs.slice(3).join('/') });
    if (a === 'x' && segs.length >= 3)   return Object.assign(base, { tab: 'courses', view: 'material', course: segs[1], subject: null, file: segs.slice(2).join('/'), extra: true });
    if (a === 'courses') {
      if (segs[1] === 'subjects') {
        if (!segs[2]) return Object.assign(base, { tab: 'courses', view: 'home' });
        if (!segs[3]) return Object.assign(base, { tab: 'courses', view: 'subjects', course: segs[2] });
        return Object.assign(base, { tab: 'courses', view: 'pdfs', course: segs[2], subject: segs.slice(3).join('/') });
      }
      // Parametrsiz "#/courses" (köhnə linklər, bookmark) → giriş görünüşünə (Fənlər üzrə) yönləndirilir.
      // Axtarış / sevimlilər / kurs filtri parametrləri (?q= ?fav= ?course=) və "#/courses/all" düz siyahını açır.
      const hasFilter = query.q != null || query.course != null || query.fav != null;
      if (!segs[1] && !hasFilter) return Object.assign(base, { tab: 'courses', view: 'entry' });
      return Object.assign(base, { tab: 'courses', view: 'materials' });
    }
    if (a === 'requests' && segs[1]) return Object.assign(base, { tab: 'requests', view: 'thread', id: segs[1] });   // #/requests/<istək-id> — açıq yazışma
    if (TABS.includes(a)) return Object.assign(base, { tab: a, view: null });
    return Object.assign(base, { tab: 'home', view: null, hash: '#/home' });
  }

  function parentPath(r) {
    if (!r) return '/home';
    if (r.view === 'material')  return '/courses/subjects';
    if (r.view === 'pdfs')      return '/courses/subjects/' + enc(r.course);
    if (r.view === 'subjects')  return '/courses/subjects';
    if (r.view === 'home')      return '/home';
    if (r.view === 'thread')    return '/requests';
    if (r.tab === 'dashboard')  return '/more';
    return '/home';
  }

  function saveScroll() { if (route) scrollMap[route.hash] = window.scrollY; }

  function go(path, opts) {
    opts = opts || {};
    if (path.charAt(0) !== '/') path = '/' + path;
    const hash = '#' + path;
    closeAllLayers();
    if (hash === location.hash && !opts.force) { window.scrollTo({ top: 0 }); return; }
    saveScroll();
    if (opts.replace) {
      history.replaceState({ i: depth }, '', hash);
    } else {
      depth += 1;
      history.pushState({ i: depth }, '', hash);
    }
    navigate(false);
  }

  function back(fallback) {
    closeAllLayers();
    if (depth > 0) { history.back(); return; }
    go(fallback || parentPath(route), { replace: true });
  }

  function navigate(isPop) {
    prevRoute = route;
    route = parseHash();
    U.route = route;
    U.prevRoute = prevRoute;
    renderRoute(isPop);
  }

  function showTab(tab) {
    $$('.main-tab').forEach(el => {
      const on = el.dataset.route === tab;
      el.classList.toggle('is-hidden', !on);
      if (on) {
        el.classList.remove('is-entering');
        void el.offsetWidth;
        el.classList.add('is-entering');
      }
    });
  }

  function labelFor(r) {
    const item = NAV.find(n => n.id === r.tab);
    return item ? t(item.key) : 'UNEC Students Hub';
  }

  function renderRoute(isPop) {
    const r = route;
    showTab(r.tab);
    document.body.setAttribute('data-route', r.tab);

    switch (r.tab) {
      case 'courses':
        if (typeof U.showCoursesRoute === 'function') U.showCoursesRoute(r, prevRoute);
        break;
      case 'tests':      if (typeof initTestSystem === 'function') initTestSystem(); break;
      case 'gpa':        if (typeof initGPA === 'function') initGPA(); if (U.syncGpaStepper) U.syncGpaStepper(); break;
      case 'curriculum': if (typeof initCurriculum === 'function') initCurriculum(); break;
      case 'requests':   if (typeof initMaterialRequests === 'function') initMaterialRequests(); break;
      case 'timer':      if (typeof initTimer === 'function') initTimer(); break;
      case 'support':    if (typeof initSupport === 'function') initSupport(); break;
      case 'dashboard': {
        const logged = typeof isLoggedIn === 'function' && isLoggedIn();
        const g = $('#dash-guest-view'), u = $('#dash-user-view');
        if (g) g.style.display = logged ? 'none' : '';
        if (u) u.style.display = logged ? '' : 'none';
        if (logged && typeof renderDashboard === 'function') renderDashboard();
        break;
      }
      case 'more': if (U.renderMore) U.renderMore(); break;
      case 'home': if (U.renderHome) U.renderHome(); break;
      default: break;
    }

    let title = labelFor(r);
    if (r.tab === 'courses' && r.view === 'material' && U.currentMaterialTitle) title = U.currentMaterialTitle;
    document.title = (r.tab === 'home' ? 'UNEC Students Hub - Tələbə Platforması' : title + ' · UNEC Students Hub');

    syncNavState();
    renderProgress();

    if (isPop && scrollMap[r.hash] != null) window.scrollTo({ top: scrollMap[r.hash] });
    else window.scrollTo({ top: 0 });

    if (prevRoute && typeof gtag === 'function') {
      try { gtag('event', 'page_view', { page_path: r.hash.slice(1), page_title: document.title }); } catch (e) {}
    }
  }

  // Köhnə API: switchBottomTab('gpa') → #/gpa
  window.switchBottomTab = function (tab) {
    if (!TABS.includes(tab)) return;
    go('/' + tab);
  };

  U.go = go;
  U.back = back;
  U.parseHash = parseHash;
  U.rerouteSoft = () => { if (route) renderRoute(true); };
  Object.defineProperty(U, 'route', { get() { return route; }, set() {}, configurable: true });

  // ── Qlobal klik: a[href^="#/"], [data-back], [data-sheet-close], [data-sheet-open] ──
  document.addEventListener('click', e => {
    const closeBtn = e.target.closest('[data-sheet-close]');
    if (closeBtn) { closeLayer(); return; }

    const backBtn = e.target.closest('[data-back]');
    if (backBtn) { e.preventDefault(); back(); return; }

    const a = e.target.closest('a[href^="#/"]');
    if (a && !e.defaultPrevented && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) && e.button === 0 && !a.target) {
      e.preventDefault();
      go(a.getAttribute('href').slice(1));
    }
  });

  window.addEventListener('popstate', e => {
    depth = (e.state && e.state.i) || 0;
    navigate(true);
  });

  // ── Drawer / scrim bağlayıcıları ────────────────────────────
  function bindShell() {
    const menuBtn = $('#menuBtn');
    if (menuBtn) menuBtn.addEventListener('click', toggleDrawer);
    const dc = $('#drawerClose');
    if (dc) dc.addEventListener('click', closeDrawer);
    const ds = $('#drawerScrim');
    if (ds) ds.addEventListener('click', () => closeLayer());
    const ss = $('#sheetScrim');
    if (ss) ss.addEventListener('click', () => closeLayer());
    const dr = $('#appDrawer');
    if (dr) dr.addEventListener('click', e => { if (e.target.closest('a[href^="#/"]')) closeLayer(true); });
    // genişləndikdə (≥1024) açıq drawer-i bağla
    const mq = window.matchMedia('(min-width: 1024px)');
    const onMq = () => { if (mq.matches) closeDrawer(); };
    if (mq.addEventListener) mq.addEventListener('change', onMq);
    // əsas məzmuna keç linki
    const skip = $('.skip-link');
    if (skip) skip.addEventListener('click', e => { e.preventDefault(); const m = $('#app-main'); if (m) m.focus({ preventScroll: false }); });
  }

  // ── Tema: açıq / tünd keçid ─────────────────────────────────
  function isLightTheme(name) {
    const th = (typeof themes !== 'undefined') ? themes[name] : null;
    if (!th) return false;
    const hex = (th['--bg'] || '#000').replace('#', '');
    const n = parseInt(hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex, 16);
    const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
    return lum > 0.6;
  }
  function toggleLightDark() {
    const cur = LS.get('theme', 'unec');
    let next;
    if (isLightTheme(cur)) next = LS.get('theme_dark', 'unec');
    else { LS.set('theme_dark', cur); next = 'arctic'; }
    if (typeof themes === 'undefined' || !themes[next]) next = 'unec';
    applyTheme(next, document.querySelector(`.sidebar-theme-opt[data-theme="${next}"]`));
  }
  U.toggleLightDark = toggleLightDark;

  // ── Proqres kartı (yalnız daxil olmuş istifadəçi; real XP) ──
  function renderProgress() {
    const logged = typeof isLoggedIn === 'function' && isLoggedIn();
    const profile = logged && typeof getProfile === 'function' ? getProfile() : null;
    ['sideProgress', 'drawerProgress'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (!logged || !profile) { el.hidden = true; el.innerHTML = ''; return; }
      const xp = (profile.progress && profile.progress.xp) || 0;
      const info = (typeof getRankInfo === 'function') ? getRankInfo(xp) : null;
      const pct = info ? info.progress : 0;
      const next = info && info.nextRank ? `${info.nextRank.minXP - xp} XP → ${esc(info.nextRank.name)}` : esc(t('progressMax'));
      el.hidden = false;
      el.innerHTML = `
        <a href="#/dashboard" style="text-decoration:none">${ic('target')}
        <p>${esc(t('progressTagline'))}</p></a>
        <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="XP"><i style="width:${pct}%"></i></div>
        <small>${xp} XP · ${info ? esc(info.rank.name) : ''}${info ? ' · ' + next : ''}</small>`;
    });
  }
  U.renderProgress = renderProgress;

  // ── Başlanğıc ───────────────────────────────────────────────
  U.initCore = function () {
    bindShell();
    renderNav();
    const tt = $('#themeToggle');
    if (tt) tt.addEventListener('click', toggleLightDark);
    // başlanğıc marşrutu
    if (!location.hash || location.hash === '#') history.replaceState({ i: 0 }, '', '#/home');
    else if (!history.state) history.replaceState({ i: 0 }, '', location.hash);
    depth = (history.state && history.state.i) || 0;
    navigate(true);
  };

  // dil dəyişəndə
  window.addEventListener('unec:langchange', () => {
    renderNav();
    renderProgress();
    document.title = (route && route.tab !== 'home') ? labelFor(route) + ' · UNEC Students Hub' : document.title;
  });
  window.addEventListener('unec:authchange', renderProgress);
})();
