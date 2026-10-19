// ============================================================
// PAYMENTS.JS — Dəstək ekranı: onlayn ödəniş axını (v1.2)
//
// Kart məlumatı bu saytdan keçmir: "Ödəniş et" sifariş yaradır, bank şlüzünün öz səhifəsinə yönləndirir.
// Qayıdışda nəticə URL-ə yox, serverdəki sifariş vəziyyətinə görə göstərilir (?order=… yalnız nömrədir).
// Şlüz aktiv deyilsə (PAYMENT_PROVIDER boşdur) və ya server əlçatmazdırsa köhnə üsullar (Birbank/m10/QR) görünür.
//
// Bu fayl app-core.js-dən ƏVVƏL yüklənir; initSupport() marşrut #/support açılanda çağırılır.
// ============================================================
(function () {
  'use strict';

  const U = (window.UNEC = window.UNEC || {});
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ic = (name, cls) => `<svg class="ic${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const API = ((typeof BACKEND_URL !== 'undefined' && BACKEND_URL) || 'https://ericismyhero-github-io.vercel.app');
  const ORDER_RE = /^UNEC-[0-9A-Z]{6,12}-[0-9A-F]{16}$/;
  const SS_ORDER = 'unec_sup_order';
  const LS_NAME = 'unec_sup_name';

  function tr(key, vars) {
    let s = (typeof t === 'function') ? t(key) : key;
    if (vars) Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  const curLang = () => (typeof lang !== 'undefined' && lang) || 'az';
  const ss = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  };
  const ls = {
    get(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  // ── Format (brauzerin az-yerlişməsindən asılı olmayan, deterministik) ──
  function fmtNum(n) {
    const v = Math.round(Number(n) * 100) / 100;
    if (!isFinite(v)) return '';
    const s = Number.isInteger(v) ? String(v) : v.toFixed(2);
    return curLang() === 'en' ? s : s.replace('.', ',');
  }
  const fmtMoney = n => fmtNum(n) + ' ₼';
  const MONTHS = {
    az: ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avq', 'sen', 'okt', 'noy', 'dek'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };
  function fmtDate(v) {
    const d = new Date(v);
    if (!v || isNaN(d.getTime())) return '';
    const m = (MONTHS[curLang()] || MONTHS.az)[d.getMonth()];
    return d.getDate() + ' ' + m + ' ' + d.getFullYear();
  }

  // ── Vəziyyət ────────────────────────────────────────────────
  const S = {
    cfg: null,            // public config
    cfgState: 'idle',     // idle | loading | ready | off | error
    cfgPromise: null,
    bound: false,
    busy: false,
    order: null,          // test paneli üçün { orderId, payToken, amount }
    result: null,         // { state, order, id }
    pollSeq: 0,
    supporters: null,     // null = yüklənməyib, 'error', yoxsa massiv
    showAll: false,
    mine: null,           // null | 'error' | { donations, total, count }
    mineLoading: false,
    returnOrder: null
  };

  // ── Şəbəkə ──────────────────────────────────────────────────
  async function api(path, opts) {
    opts = opts || {};
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), opts.timeout || 12000);
    try {
      const init = { method: opts.body ? 'POST' : 'GET', signal: ctrl.signal, cache: 'no-store' };
      if (opts.body) { init.headers = { 'Content-Type': 'application/json' }; init.body = JSON.stringify(opts.body); }
      const res = await fetch(API + path, init);
      let json = null;
      try { json = await res.json(); } catch (e) { json = null; }
      return { ok: res.ok, status: res.status, json: json || {} };
    } finally { clearTimeout(to); }
  }
  function user() { return (typeof getCurrentUser === 'function') ? getCurrentUser() : null; }
  async function idToken(force) {
    const u = user();
    if (!u || typeof u.getIdToken !== 'function') return null;
    return u.getIdToken(!!force);
  }

  // ── Konfiqurasiya ───────────────────────────────────────────
  function loadConfig(force) {
    if (S.cfgState === 'ready' && !force) return Promise.resolve(S.cfg);
    if (S.cfgState === 'loading' && S.cfgPromise) return S.cfgPromise;
    S.cfgState = 'loading';
    S.cfgPromise = api('/api/payment-config', { timeout: 8000 }).then(r => {
      if (!r.ok || typeof r.json.enabled !== 'boolean') throw new Error('bad_config');
      const c = r.json;
      S.cfg = {
        enabled: c.enabled, mode: c.mode, min: Number(c.min) || 1, max: Number(c.max) || 500,
        presets: Array.isArray(c.presets) ? c.presets.map(Number).filter(n => n > 0 && isFinite(n)).slice(0, 6) : []
      };
      S.cfgState = c.enabled ? 'ready' : 'off';
      return S.cfg;
    }).catch(() => { S.cfgState = 'error'; S.cfg = null; return null; })
      .then(c => { S.cfgPromise = null; renderConfig(); adaptToast(); return c; });
    return S.cfgPromise;
  }

  function show(el, on) { if (el) el.hidden = !on; }

  function renderConfig() {
    const root = $('#main-support');
    if (!root) return;
    const st = S.cfgState;
    const ready = st === 'ready';
    show($('#sup-state-loading'), st === 'idle' || st === 'loading');
    show($('#sup-state-off'), st === 'off' || st === 'error');
    show($('#sup-form'), ready && !S.order);
    show($('#sup-test'), ready && !!S.order);
    show($('#sup-fallback'), st === 'off' || st === 'error');
    show($('#sup-off-retry'), st === 'error');
    show($('#sup-mode-badge'), ready && S.cfg.mode === 'test');
    show($('#sup-test-banner'), ready && S.cfg.mode === 'test');

    const title = $('#sup-pay-title');
    if (title) {
      const key = ready ? 'supPayTitle' : 'supCardTitleOff';
      title.setAttribute('data-i18n', key);
      title.textContent = tr(key);
    }
    const offTitle = $('#sup-off-title'), offText = $('#sup-off-text');
    if (offTitle && offText) {
      const k = st === 'error' ? 'supOffErrorTitle' : 'supOffTitle';
      const k2 = st === 'error' ? 'supOffError' : 'supOffText';
      offTitle.setAttribute('data-i18n', k); offTitle.textContent = tr(k);
      offText.setAttribute('data-i18n', k2); offText.textContent = tr(k2);
    }

    // yan panel yalnız şlüz aktiv olanda mənalıdır
    show($('#sup-supporters'), ready);
    show($('#sup-mine'), ready);
    const grid = $('.sup-grid', root);
    if (grid) grid.classList.toggle('sup-grid--solo', !ready);

    if (ready) {
      buildAmounts();
      renderHint();
      renderPreview();
      renderPayBtn();
      renderLoginHint();
      if (S.supporters === null) loadSupporters();
      loadMine();
    }
  }

  // ── Məbləğ ──────────────────────────────────────────────────
  /** İnputdakı mətni yoxla → { value (AZN, ədəd), str } və ya { err: açar } */
  function readAmount() {
    const inp = $('#sup-amount-input');
    const raw = String((inp && inp.value) || '').trim().replace(',', '.');
    if (!raw) return { err: 'supErrAmountRequired' };
    if (!/^\d{1,6}(\.\d{1,2})?$/.test(raw)) return { err: 'supErrAmountInvalid' };
    const v = parseFloat(raw);
    if (!S.cfg) return { err: 'supErrGeneric' };
    if (Math.round(v * 100) < Math.round(S.cfg.min * 100)) return { err: 'supErrAmountMin' };
    if (Math.round(v * 100) > Math.round(S.cfg.max * 100)) return { err: 'supErrAmountMax' };
    return { value: v, str: raw };
  }

  const PRESET_LABEL = { 3: 'supportCoffee', 5: 'supportPopular', 7: 'supportServer' };

  function buildAmounts() {
    const box = $('#sup-amounts');
    if (!box || !S.cfg) return;
    const inp = $('#sup-amount-input');
    const before = inp ? inp.value : '';
    box.innerHTML = S.cfg.presets.map(p => {
      const lk = PRESET_LABEL[p];
      return `<button class="sup-amt${p === 5 ? ' sup-amt--pop' : ''}" type="button" data-amt="${p}" aria-pressed="false">` +
        `<b>${esc(fmtMoney(p))}</b><small>${lk ? esc(tr(lk)) : ''}</small></button>`;
    }).join('');
    $$('.sup-amt', box).forEach(b => b.addEventListener('click', () => {
      if (inp) inp.value = fmtPlain(b.getAttribute('data-amt'));
      clearError();
      syncPressed(); renderPreview(); renderPayBtn();
    }));
    // başlanğıc: "populyar" 5 ₼ varsa, əvvəlcədən seçilir (istifadəçi dəyişə bilər)
    if (inp && !before && S.cfg.presets.indexOf(5) !== -1) inp.value = '5';
    syncPressed();
  }
  const fmtPlain = n => String(n).replace('.', curLang() === 'en' ? '.' : ',');

  function syncPressed() {
    const a = readAmount();
    $$('#sup-amounts .sup-amt').forEach(b => {
      b.setAttribute('aria-pressed', (a.value !== undefined && Number(b.getAttribute('data-amt')) === a.value) ? 'true' : 'false');
    });
  }

  function renderHint() {
    const h = $('#sup-amount-hint');
    if (h && S.cfg) h.textContent = tr('supAmountHint', { min: fmtNum(S.cfg.min), max: fmtNum(S.cfg.max) });
  }

  function currentVis() {
    const r = $('input[name="sup-vis"]:checked');
    return r ? r.value : 'anon';
  }
  function displayName() {
    const n = ($('#sup-name-input') && $('#sup-name-input').value || '').trim();
    return n || tr('supDefaultName');
  }
  function renderPreview() {
    const el = $('#sup-preview-val');
    if (!el) return;
    const v = currentVis();
    const a = readAmount();
    const amt = a.value !== undefined ? fmtMoney(a.value) : '—';
    el.textContent = v === 'full' ? displayName() + ' · ' + amt : v === 'name' ? displayName() : tr('supAnonymousLabel');
  }
  function renderPayBtn() {
    const lab = $('#sup-pay-btn-label');
    if (!lab) return;
    if (S.busy) { lab.textContent = tr('supPayBusy'); return; }
    const a = readAmount();
    lab.textContent = a.value !== undefined ? tr('supPayBtnAmt', { amt: fmtMoney(a.value) }) : tr('supPayBtn');
  }
  function renderLoginHint() {
    show($('#sup-login-hint'), S.cfgState === 'ready' && !user());
  }

  // ── Xəta ────────────────────────────────────────────────────
  function showError(key, vars, focusEl) {
    const el = $('#sup-error');
    if (!el) return;
    const v = vars || {};
    if (S.cfg) { v.min = fmtNum(S.cfg.min); v.max = fmtNum(S.cfg.max); }
    el.innerHTML = ic('info') + '<span>' + esc(tr(key, v)) + '</span>';
    el.hidden = false;
    const amountErr = /^supErrAmount/.test(key);
    const inp = $('#sup-amount-input');
    if (inp) inp.setAttribute('aria-invalid', amountErr ? 'true' : 'false');
    if (focusEl) focusEl.focus();
  }
  function clearError() {
    const el = $('#sup-error');
    if (el) { el.hidden = true; el.textContent = ''; }
    const inp = $('#sup-amount-input');
    if (inp) inp.setAttribute('aria-invalid', 'false');
  }

  function setBusy(on) {
    S.busy = on;
    const btn = $('#sup-pay-btn');
    if (btn) { btn.disabled = on; btn.classList.toggle('is-busy', on); btn.setAttribute('aria-busy', on ? 'true' : 'false'); }
    renderPayBtn();
  }

  // ── Sifariş yaratma ─────────────────────────────────────────
  function safeRedirect(u) {
    try { const x = new URL(u); return x.protocol === 'https:' ? x.href : null; } catch (e) { return null; }
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (S.busy || S.cfgState !== 'ready') return;
    clearError();
    const a = readAmount();
    if (a.err) { showError(a.err, null, $('#sup-amount-input')); return; }
    setBusy(true);
    const name = (($('#sup-name-input') || {}).value || '').trim();
    const payload = { amount: a.str, name, visibility: currentVis(), lang: curLang() };
    try {
      let token = null;
      if (user()) {
        try { token = await idToken(false); } catch (err) { setBusy(false); showError('supErrSession'); return; }
      }
      let r = await api('/api/payment-create', { body: Object.assign({}, payload, { idToken: token }) });
      if (r.status === 401 && user()) {
        try { token = await idToken(true); } catch (err) { token = null; }
        if (token) r = await api('/api/payment-create', { body: Object.assign({}, payload, { idToken: token }) });
      }
      if (!r.ok) { setBusy(false); return handleCreateError(r); }
      const j = r.json;
      if (!j.orderId || !ORDER_RE.test(j.orderId)) { setBusy(false); showError('supErrGeneric'); return; }
      if (name) ls.set(LS_NAME, name);
      ss.set(SS_ORDER, j.orderId);
      if (j.test && j.payToken) {
        S.order = { orderId: j.orderId, payToken: j.payToken, amount: j.amount };
        setBusy(false);
        openTestPanel();
        return;
      }
      const url = safeRedirect(j.redirectUrl);
      if (!url) { setBusy(false); showError('supErrGateway'); return; }
      location.assign(url); // busy qalır: səhifə dəyişir (geri qayıdanda pageshow sıfırlayır)
    } catch (err) {
      setBusy(false);
      showError('supErrNetwork');
    }
  }

  function handleCreateError(r) {
    const code = r.json && r.json.error;
    const map = {
      amount_required: 'supErrAmountRequired', amount_invalid: 'supErrAmountInvalid',
      amount_too_small: 'supErrAmountMin', amount_too_large: 'supErrAmountMax',
      invalid_token: 'supErrSession', gateway_error: 'supErrGateway'
    };
    if (r.status === 503 || code === 'disabled') { showError('supErrDisabled'); loadConfig(true); return; }
    showError(map[code] || 'supErrGeneric');
  }

  // ── Test rejimi ─────────────────────────────────────────────
  function openTestPanel() {
    show($('#sup-form'), false);
    show($('#sup-test'), true);
    const a = $('#sup-test-amount');
    if (a) a.textContent = fmtMoney(S.order.amount);
    const b = $('#sup-test-ok'); if (b) b.focus();
  }
  function closeTestPanel() {
    S.order = null;
    const te = $('#sup-test-error'); if (te) { te.hidden = true; te.textContent = ''; }
    show($('#sup-test'), false);
    show($('#sup-form'), S.cfgState === 'ready');
  }
  async function testResult(ok) {
    const o = S.order;
    if (!o) return;
    $$('#sup-test button').forEach(b => { b.disabled = true; });
    try {
      const r = await api('/api/payment-callback', { body: { provider: 'test', orderId: o.orderId, token: o.payToken, result: ok ? 'success' : 'failed' } });
      if (!r.ok) throw Object.assign(new Error('cb'), { http: r.status });
    } catch (e) {
      // callback alınmadı: panel açıq qalır, istifadəçi yenidən cəhd edə bilər
      const te = $('#sup-test-error');
      if (te) { te.innerHTML = ic('info') + '<span>' + esc(tr(e && e.http ? 'supErrGeneric' : 'supErrNetwork')) + '</span>'; te.hidden = false; }
      $$('#sup-test button').forEach(b => { b.disabled = false; });
      return;
    }
    $$('#sup-test button').forEach(b => { b.disabled = false; });
    closeTestPanel();
    checkOrder(o.orderId);
  }

  // ── Qayıdış və nəticə ───────────────────────────────────────
  const RESULT_ICON = {
    checking: '<span class="sup-spin" aria-hidden="true"></span>',
    paid: ic('circle-check'), failed: ic('circle-x'),
    review: ic('clock'), timeout: ic('clock'), notfound: ic('info')
  };

  function setResult(state, extra) {
    S.result = Object.assign({ state }, extra || {});
    renderResult();
  }

  function renderResult() {
    const box = $('#sup-result');
    const r = S.result;
    if (!box) return;
    if (!r) { box.hidden = true; return; }
    const o = r.order || {};
    const test = o.mode === 'test';
    let title, text, vis = '', actions = '';
    switch (r.state) {
      case 'checking':
        title = tr('supResCheckTitle'); text = tr('supResCheckText'); break;
      case 'paid':
        title = tr('supResPaidTitle');
        text = test ? tr('supResPaidTest', { amt: fmtMoney(o.amount) }) : tr('supResPaidText', { amt: fmtMoney(o.amount) });
        if (!test) vis = o.visibility === 'full' ? tr('supResVisFull') : o.visibility === 'name' ? tr('supResVisName') : tr('supResVisAnon');
        actions = (test ? '' : btn('sup-view-list', 'btn--secondary btn--sm', 'users', tr('supResViewList'))) + btn('sup-close-result', 'btn--ghost btn--sm', '', tr('btnClose'));
        break;
      case 'failed':
        title = tr('supResFailTitle'); text = tr('supResFailText');
        actions = btn('sup-try-again', 'btn--primary btn--sm', 'rotate', tr('supResTryAgain')); break;
      case 'review':
        title = tr('supResReviewTitle'); text = tr('supResReviewText', { id: r.id || '' });
        actions = `<a class="btn btn--secondary btn--sm" href="mailto:ericismyhero2467@gmail.com?subject=${encodeURIComponent('Ödəniş ' + (r.id || ''))}">${ic('mail')}<span>${esc(tr('supportContact'))}</span></a>`;
        break;
      case 'timeout':
        title = tr('supResTimeoutTitle'); text = tr('supResTimeoutText');
        actions = btn('sup-recheck', 'btn--primary btn--sm', 'rotate', tr('supResRecheck')) + btn('sup-try-again', 'btn--ghost btn--sm', '', tr('supResTryAgain'));
        break;
      default: // notfound
        title = tr('supResNotFound'); text = tr('supResNotFoundText');
        actions = btn('sup-try-again', 'btn--primary btn--sm', '', tr('supResTryAgain'));
    }
    box.setAttribute('data-state', r.state);
    $('#sup-result-icon').innerHTML = RESULT_ICON[r.state] || RESULT_ICON.notfound;
    $('#sup-result-title').textContent = title;
    $('#sup-result-text').textContent = text;
    const v = $('#sup-result-vis');
    v.textContent = vis; v.hidden = !vis;
    $('#sup-result-actions').innerHTML = actions;
    box.hidden = false;
  }
  function btn(act, cls, icon, label) {
    return `<button class="btn ${cls}" type="button" data-act="${act}">${icon ? ic(icon) : ''}<span>${esc(label)}</span></button>`;
  }

  /** Serverdən sifariş vəziyyətini soruş (şlüz callback-i bir neçə saniyə gecikə bilər). */
  async function checkOrder(id, opts) {
    if (!ORDER_RE.test(id || '')) return;
    const seq = ++S.pollSeq;
    setResult('checking', { id });
    const box = $('#sup-result');
    if (box && !(opts && opts.quiet)) {
      const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      try { box.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }); } catch (e) {}
    }
    const MAX = 10, GAP = 2000;
    for (let i = 0; i < MAX; i++) {
      if (seq !== S.pollSeq) return; // yeni yoxlama başladı
      let r = null;
      try { r = await api('/api/payment-status?order=' + encodeURIComponent(id), { timeout: 8000 }); } catch (e) { r = null; }
      if (seq !== S.pollSeq) return;
      if (r && r.ok) {
        const st = r.json.status;
        if (st === 'paid' || st === 'failed' || st === 'review') {
          ss.del(SS_ORDER);
          setResult(st, { id, order: r.json });
          if (st === 'paid') { if (r.json.mode !== 'test') { S.supporters = null; loadSupporters(); } S.mine = null; loadMine(); }
          return;
        }
      } else if (r && r.status === 404) {
        ss.del(SS_ORDER);
        setResult('notfound', { id });
        return;
      } else if (r && (r.status === 503 || r.status === 400)) {
        ss.del(SS_ORDER);
        S.result = null; renderResult();
        return;
      }
      if (i < MAX - 1) await new Promise(res => setTimeout(res, GAP));
    }
    if (seq === S.pollSeq) setResult('timeout', { id });
  }

  // ── Dəstəkçilər ─────────────────────────────────────────────
  async function loadSupporters() {
    const body = $('#sup-supporters-body');
    if (!body) return;
    body.innerHTML = '<div class="skeleton sup-skel"></div>';
    try {
      const r = await api('/api/supporters', { timeout: 10000 });
      if (!r.ok || !Array.isArray(r.json.supporters)) throw new Error('bad');
      S.supporters = r.json.supporters;
    } catch (e) { S.supporters = 'error'; }
    renderSupporters();
  }
  function renderSupporters() {
    const body = $('#sup-supporters-body');
    if (!body) return;
    const list = S.supporters;
    if (list === null) return;
    if (list === 'error') {
      body.innerHTML = `<p class="sup-empty sup-empty--error">${ic('info')}<span>${esc(tr('supListError'))}</span>` +
        `<button class="btn btn--secondary btn--sm" type="button" data-act="sup-retry-list">${esc(tr('appRetry'))}</button></p>`;
      return;
    }
    if (!list.length) {
      body.innerHTML = `<p class="sup-empty">${ic('heart')}<span>${esc(tr('supListEmpty'))}</span></p>`;
      return;
    }
    const LIMIT = 8;
    const rows = (S.showAll ? list : list.slice(0, LIMIT)).map(s => {
      const anon = !!s.anonymous;
      const name = anon ? tr('supAnonymousLabel') : (s.name || tr('supDefaultName'));
      const init = anon ? ic('user') : esc((Array.from(name)[0] || '?'));
      const amt = (s.amount != null && !anon) ? `<span class="sup-amt-chip">${esc(fmtMoney(s.amount))}</span>` : '';
      return `<li class="sup-item"><span class="sup-av" aria-hidden="true">${init}</span>` +
        `<div class="sup-item-body"><span class="sup-item-name">${esc(name)}</span><span class="sup-item-meta">${esc(fmtDate(s.date))}</span></div>${amt}</li>`;
    }).join('');
    const more = (!S.showAll && list.length > LIMIT)
      ? `<button class="btn btn--ghost btn--sm btn--block" type="button" data-act="sup-show-all" style="margin-top:10px">${esc(tr('supShowAll', { n: list.length }))}</button>` : '';
    body.innerHTML = `<ul class="sup-list">${rows}</ul>${more}`;
  }

  // ── Töhfələrim ──────────────────────────────────────────────
  async function loadMine() {
    const guest = $('#sup-mine-guest'), usr = $('#sup-mine-user');
    if (!guest || !usr) return;
    if (!user()) { S.mine = null; show(guest, true); show(usr, false); return; }
    show(guest, false); show(usr, true);
    if (S.mine && S.mine !== 'error') { renderMine(); return; }
    if (S.mineLoading) return;
    S.mineLoading = true;
    $('#sup-mine-summary').innerHTML = '<div class="skeleton sup-skel" style="width:100%"></div>';
    $('#sup-mine-list').innerHTML = '';
    try {
      let token = await idToken(false);
      let r = await api('/api/my-donations', { body: { idToken: token } });
      if (r.status === 401) { token = await idToken(true); r = await api('/api/my-donations', { body: { idToken: token } }); }
      if (!r.ok || !Array.isArray(r.json.donations)) throw new Error('bad');
      S.mine = r.json;
    } catch (e) { S.mine = 'error'; }
    S.mineLoading = false;
    renderMine();
  }
  function renderMine() {
    const sum = $('#sup-mine-summary'), list = $('#sup-mine-list');
    if (!sum || !list) return;
    const m = S.mine;
    if (!m) return;
    if (m === 'error') {
      sum.innerHTML = '';
      list.innerHTML = `<li><p class="sup-empty sup-empty--error">${ic('info')}<span>${esc(tr('supMineError'))}</span>` +
        `<button class="btn btn--secondary btn--sm" type="button" data-act="sup-retry-mine">${esc(tr('appRetry'))}</button></p></li>`;
      return;
    }
    if (!m.donations.length) {
      sum.innerHTML = '';
      list.innerHTML = `<li><p class="sup-empty">${ic('heart')}<span>${esc(tr('supMineEmpty'))}</span></p></li>`;
      return;
    }
    const n = m.count || 0;
    sum.innerHTML = `<div><small>${esc(tr('supMineTotal'))}</small><strong>${esc(fmtMoney(m.total || 0))}</strong></div>` +
      `<span>${esc(n === 1 ? tr('supMineCountOne') : tr('supMineCount', { n }))}</span>`;
    const VIS = { full: 'supVisShortFull', name: 'supVisShortName', anon: 'supVisShortAnon' };
    list.innerHTML = m.donations.map(d => {
      const test = d.mode === 'test';
      return `<li class="sup-item"><span class="sup-av" aria-hidden="true">${ic('heart')}</span>` +
        `<div class="sup-item-body"><span class="sup-item-name">${esc(fmtMoney(d.amount))}</span>` +
        `<span class="sup-item-meta">${esc(fmtDate(d.date))} · ${esc(tr(VIS[d.visibility] || VIS.anon))}</span></div>` +
        (test ? `<span class="sup-test-chip">${esc(tr('supTestBadge'))}</span>` : '') + `</li>`;
    }).join('');
  }

  // ── Dəstək toast-ı: şlüz aktivdirsə "Dəstək ol" düyməsi ─────
  function adaptToast() {
    if (S.cfgState !== 'ready') return;
    const toast = document.getElementById('supportToast');
    const right = toast && toast.querySelector('.st-right');
    if (!right || right.getAttribute('data-pay')) return;
    right.setAttribute('data-pay', '1');
    right.querySelectorAll('.st-btn-birbank, .st-btn-m10').forEach(a => a.remove());
    const a = document.createElement('a');
    a.href = '#/support';
    a.className = 'st-btn st-btn-pay';
    a.setAttribute('data-i18n', 'supToastBtn');
    a.textContent = tr('supToastBtn');
    a.addEventListener('click', () => { if (typeof window.dismissToast === 'function') window.dismissToast(); });
    right.insertBefore(a, right.firstChild);
    const sub = toast.querySelector('.st-sub');
    if (sub) { sub.setAttribute('data-i18n', 'supToastSubPay'); sub.textContent = tr('supToastSubPay'); }
  }

  // ── Bağlama ─────────────────────────────────────────────────
  function bind() {
    if (S.bound) return;
    const root = $('#main-support');
    if (!root) return;
    S.bound = true;

    const form = $('#sup-form', root);
    if (form) form.addEventListener('submit', onSubmit);

    const amt = $('#sup-amount-input', root);
    if (amt) amt.addEventListener('input', () => {
      const cleaned = amt.value.replace(/[^\d.,]/g, '');
      if (cleaned !== amt.value) amt.value = cleaned;
      clearError(); syncPressed(); renderPreview(); renderPayBtn();
    });
    const nm = $('#sup-name-input', root);
    if (nm) nm.addEventListener('input', renderPreview);
    $$('input[name="sup-vis"]', root).forEach(r => r.addEventListener('change', renderPreview));

    const retry = $('#sup-off-retry', root);
    if (retry) retry.addEventListener('click', () => { S.cfgState = 'loading'; renderConfig(); loadConfig(true); });
    const tok = $('#sup-test-ok', root), tfl = $('#sup-test-fail', root), tcn = $('#sup-test-cancel', root);
    if (tok) tok.addEventListener('click', () => testResult(true));
    if (tfl) tfl.addEventListener('click', () => testResult(false));
    if (tcn) tcn.addEventListener('click', closeTestPanel);

    root.addEventListener('click', ev => {
      const b = ev.target.closest('[data-act]');
      if (!b) return;
      switch (b.getAttribute('data-act')) {
        case 'sup-retry-list': S.supporters = null; loadSupporters(); break;
        case 'sup-retry-mine': S.mine = null; loadMine(); break;
        case 'sup-show-all': S.showAll = true; renderSupporters(); break;
        case 'sup-view-list': { const s = $('#sup-supporters'); if (s) s.scrollIntoView({ block: 'start', behavior: 'smooth' }); break; }
        case 'sup-close-result': S.result = null; S.pollSeq++; renderResult(); break;
        case 'sup-recheck': { const id = S.result && S.result.id; if (id) checkOrder(id); break; }
        case 'sup-try-again': {
          S.result = null; S.pollSeq++; ss.del(SS_ORDER); renderResult();
          const i = $('#sup-amount-input'); if (i) i.focus();
          break;
        }
        default: break;
      }
    });

    // ad üçün əvvəlki dəyər / profil adı
    prefillName();
  }

  function prefillName() {
    const nm = $('#sup-name-input');
    if (!nm || nm.value) return;
    const u = user();
    const v = ls.get(LS_NAME) || (u && u.displayName) || '';
    if (v) { nm.value = v.slice(0, 40); renderPreview(); }
  }

  // ── Giriş nöqtəsi ───────────────────────────────────────────
  function initSupport() {
    bind();
    if (S.cfgState === 'idle' || S.cfgState === 'error') { S.cfgState = S.cfgState === 'error' ? 'loading' : S.cfgState; renderConfig(); loadConfig(true); }
    else renderConfig();
    const id = S.returnOrder || ss.get(SS_ORDER);
    if (id && ORDER_RE.test(id) && !S.result) { S.returnOrder = null; checkOrder(id); }
    else if (S.result) renderResult();
  }
  window.initSupport = initSupport;
  U.formatMoney = fmtMoney;

  // Qayıdış URL-i: /?order=UNEC-…#/support → nömrəni götür, URL-i təmizlə, marşrutu #/support et.
  (function readReturn() {
    let m = null;
    try { m = /[?&]order=([^&#]+)/.exec(location.search); } catch (e) {}
    if (!m) return;
    let id = '';
    try { id = decodeURIComponent(m[1]); } catch (e) { id = ''; }
    if (ORDER_RE.test(id)) { S.returnOrder = id; ss.set(SS_ORDER, id); }
    try { history.replaceState(null, '', location.pathname + '#/support'); } catch (e) {}
  })();

  window.addEventListener('unec:langchange', () => {
    if (!$('#main-support')) return;
    if (S.cfgState === 'ready') { buildAmounts(); renderHint(); renderPreview(); renderPayBtn(); }
    renderConfig();
    renderResult(); renderSupporters(); renderMine();
    if (S.order) { const a = $('#sup-test-amount'); if (a) a.textContent = fmtMoney(S.order.amount); }
  });
  window.addEventListener('unec:authchange', () => {
    S.mine = null;
    renderLoginHint();
    prefillName();
    if (S.cfgState === 'ready') loadMine();
  });
  window.addEventListener('pageshow', e => { if (e.persisted && S.busy) setBusy(false); });

  // Dəstək toast-ı üçün konfiqurasiya: ekran açılmasa da bir dəfə, yüngülcə yoxlanılır.
  function warm() { if (S.cfgState === 'idle') loadConfig(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(warm, 2500));
  else setTimeout(warm, 2500);
})();
