// ============================================================
// APP-SCREENS.JS — Ana səhifə (funksiya kartları, axtarış, yeniliklər),
// "Daha çox" səhifəsi, tənzimləmələr, GPA addımlayıcı, başlanğıc.
// app-core.js və app-materials.js-dən sonra yüklənir.
// ============================================================
(function () {
  'use strict';

  const U = window.UNEC;
  const { $, $$, esc, ic, enc, tr, LS, normAz, NAV, FEATURE_IDS } = U;
  const TELEGRAM = 'https://t.me/unecstudentshub';
  const TG_CHANNEL = TELEGRAM.split('/').pop();   // keş və "oxundu" açarları kanala görə ayrılır (kanal dəyişsə köhnə post nömrələri qarışmasın)

  const isLogged = () => typeof isLoggedIn === 'function' && isLoggedIn();

  // ═════════════════════════════════════════════════════════════
  // ANA SƏHİFƏ
  // ═════════════════════════════════════════════════════════════
  function renderFeatures() {
    const grid = $('#featureGrid');
    if (!grid) return;
    grid.innerHTML = FEATURE_IDS.map(id => {
      const n = NAV.find(x => x.id === id);
      return `<a class="feature-card" style="--fc:var(--fc-${n.fc})" href="#${n.route}">
        <span class="feature-icon">${ic(n.icon)}</span>
        <span class="feature-text"><b>${esc(t(n.key))}</b><small>${esc(t(n.desc))}</small></span>
      </a>`;
    }).join('');
  }

  // Ana səhifə axtarışı: funksiyalar + real materiallar
  function srItem(href, icon, title, sub, external) {
    return `<a class="sr-item" href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
      <span class="sr-ic">${ic(icon)}</span>
      <span class="grow"><b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</span>
      ${ic('chevron-right', 'chev')}</a>`;
  }

  function runHomeSearch(raw) {
    const res = $('#homeSearchResults'), body = $('#homeBody');
    if (!res || !body) return;
    const q = normAz(raw);
    if (!q) { res.hidden = true; res.innerHTML = ''; body.hidden = false; return; }
    const toks = q.split(' ');
    body.hidden = true;
    res.hidden = false;

    const feats = NAV.filter(n => n.id !== 'home' && n.id !== 'courses').filter(n => {
      const hay = normAz(t(n.key) + ' ' + (n.desc ? t(n.desc) : ''));
      return toks.every(tk => hay.includes(tk));
    });
    const mats = U.getIndex().filter(m => toks.every(tk => m.search.includes(tk)));
    const top = mats.slice(0, 6);

    let html = '';
    if (feats.length) {
      html += `<div class="sr-group">${esc(t('searchGroupFeatures'))}</div>` +
        feats.map(n => srItem('#' + n.route, n.icon, t(n.key), n.desc ? t(n.desc) : '')).join('');
    }
    if (top.length) {
      html += `<div class="sr-group">${esc(t('searchGroupMaterials'))} · ${mats.length}</div>` +
        top.map(m => srItem(U.matHref(m), 'pdf', m.name, (m.kind === 'extra' ? t('extraMaterial') : m.subject) + ' · ' + m.course)).join('');
      if (mats.length > top.length) {
        html += srItem('#/courses?q=' + enc(raw.trim()), 'search', t('matFilterAll') + ' · ' + tr('matCount', { n: mats.length }), '');
      }
    }
    if (!html) {
      html = `<div class="state-box">${ic('search')}<h3>${esc(t('searchNoResults'))}</h3><p>${esc(t('searchNoResultsHint'))}</p>
        <a class="btn btn--secondary btn--sm" href="#/requests">${esc(t('navRequests'))}</a></div>`;
    }
    res.innerHTML = html;
  }

  function bindHomeSearch() {
    const input = $('#homeSearch'), box = $('#homeSearchBox'), clear = $('#homeSearchClear');
    if (!input) return;
    let timer = null;
    input.addEventListener('input', () => {
      if (box) box.classList.toggle('has-value', !!input.value);
      clearTimeout(timer);
      timer = setTimeout(() => runHomeSearch(input.value), 100);
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); const first = $('#homeSearchResults .sr-item'); if (first) first.click(); }
      if (e.key === 'Escape') { input.value = ''; input.dispatchEvent(new Event('input')); }
    });
    if (clear) clear.addEventListener('click', () => { input.value = ''; if (box) box.classList.remove('has-value'); runHomeSearch(''); input.focus(); });
  }

  // ── Yeniliklər: Teleqram kanalının son 3 postu + real, yerinə yetirilmiş material istəkləri ──
  // Teleqram postları backend funksiyasından gəlir (ai-vercel/api/telegram-news.js); brauzer t.me-ni birbaşa oxuya bilmir.
  const TG_API = ((typeof BACKEND_URL !== 'undefined' && BACKEND_URL) || 'https://ericismyhero-github-io.vercel.app') + '/api/telegram-news?limit=3';
  const TG_TTL = 10 * 60 * 1000;   // 10 dəq.: bundan tez-tez yenidən sorğu göndərmirik
  let news = null;       // null = hələ yüklənməyib
  let newsLoading = false;
  let tgPosts = null;    // null = hələ yüklənməyib; [] = yoxdur / oxunmadı
  let tgLoading = false;
  let tgFetchedAt = 0;

  const tsOf = x => (x && typeof x.toMillis === 'function') ? x.toMillis() : (x && x.seconds ? x.seconds * 1000 : 0);

  async function loadNews(force) {
    const db = typeof getDb === 'function' ? getDb() : null;
    if (!db) return;
    if ((news && !force) || newsLoading) return;
    newsLoading = true;
    try {
      const snap = await db.collection('material_requests').where('status', '==', 'fulfilled').limit(20).get();
      const arr = [];
      snap.forEach(d => arr.push(Object.assign({ id: d.id }, d.data())));
      arr.sort((a, b) => (tsOf(b.fulfilledAt) || tsOf(b.createdAt)) - (tsOf(a.fulfilledAt) || tsOf(a.createdAt)));
      news = arr;
    } catch (e) {
      console.warn('[news] yeniliklər oxunmadı:', e);
      news = [];
    } finally {
      newsLoading = false;
    }
    renderNews();
  }

  function readTgCache() {
    const c = LS.getJSON('tg_news_cache:' + TG_CHANNEL, null);
    if (c && Array.isArray(c.posts)) { tgPosts = c.posts.slice(0, 3); tgFetchedAt = Number(c.ts) || 0; }
  }

  async function loadTelegram(force) {
    if (tgLoading) return;
    if (!force && tgPosts && Date.now() - tgFetchedAt < TG_TTL) return;
    tgLoading = true;
    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), 7000) : null;
    try {
      const r = await fetch(TG_API, ctrl ? { signal: ctrl.signal } : undefined);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      const list = j && Array.isArray(j.posts) ? j.posts : [];
      // yalnız gözlənilən formatda və yalnız t.me linki olan postlar qəbul edilir
      const posts = list.filter(x => x && Number(x.id) && typeof x.text === 'string' && x.text && /^https:\/\/t\.me\//.test(String(x.url || ''))).slice(0, 3);
      tgPosts = posts;
      tgFetchedAt = Date.now();
      LS.setJSON('tg_news_cache:' + TG_CHANNEL, { ts: tgFetchedAt, posts });
    } catch (e) {
      console.warn('[news] Teleqram postları oxunmadı:', e);
      if (!tgPosts) tgPosts = [];                     // köhnə keş varsa onu saxlayırıq
      tgFetchedAt = Date.now() - TG_TTL + 60 * 1000;  // uğursuzluqdan sonra 1 dəq. gözləyib yenidən cəhd
    } finally {
      if (timer) clearTimeout(timer);
      tgLoading = false;
    }
    renderNews();
  }

  const seenIds = () => LS.getJSON('news_seen', []);
  const tgSeenMax = () => Number(LS.getJSON('tg_seen_max:' + TG_CHANNEL, 0)) || 0;
  const unseenCount = () =>
    (news || []).filter(n => !seenIds().includes(n.id)).length +
    ((tgPosts || []).some(p => Number(p.id) > tgSeenMax()) ? 1 : 0);

  function newsRow(n) {
    const ms = tsOf(n.fulfilledAt) || tsOf(n.createdAt);
    const date = ms ? new Date(ms).toLocaleDateString(lang === 'en' ? 'en-GB' : 'az-AZ') : '';
    const where = [n.subject, n.course].filter(Boolean).join(' · ');
    return `<a class="news-item" href="#/requests">${ic('circle-check')}
      <span class="news-text"><b>${esc(n.text || '')}</b><small>${esc(t('newsFulfilled'))}${where ? ' · ' + esc(where) : ''}${date ? ' · ' + esc(date) : ''}</small></span>
      ${ic('chevron-right', 'chev')}</a>`;
  }
  const telegramRow = () => `<a class="news-item" href="${TELEGRAM}" target="_blank" rel="noopener noreferrer">${ic('send')}
      <span class="news-text"><b>${esc(t('newsTelegram'))}</b><small>${esc(t('newsTelegramSub'))}</small></span>${ic('external-link', 'chev')}</a>`;

  function tgRow(p) {
    const ms = Date.parse(p.date || '');
    const date = ms ? new Date(ms).toLocaleDateString(lang === 'en' ? 'en-GB' : 'az-AZ') : '';
    const parts = String(p.text).split(/\n+/);
    const head = parts.shift();
    const body = parts.join(' ').trim();
    return `<a class="news-item news-item--tg" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${ic('send')}
      <span class="news-text"><b class="tg-head">${esc(head)}</b>${body ? `<span class="tg-body">${esc(body)}</span>` : ''}<small>${esc(t('newsFromTelegramShort'))}${date ? ' · ' + esc(date) : ''}</small></span>
      ${ic('external-link', 'chev')}</a>`;
  }

  function renderNews() {
    const items = news || [];
    const tg = (tgPosts || []).slice(0, 3);
    const home = $('#homeNews');
    // Ana səhifə: Teleqramın son 3 postu; oxunmasa — əvvəlki kimi son 2 yerinə yetirilmiş istək
    if (home) home.innerHTML = (tg.length ? tg.map(tgRow).join('') : items.slice(0, 2).map(newsRow).join('')) + telegramRow();
    const sheet = $('#newsSheetList');
    if (sheet) {
      let html = '';
      if (tg.length) html += `<div class="news-group">${esc(t('newsGroupTelegram'))}</div>` + tg.map(tgRow).join('');
      if (items.length) html += `<div class="news-group">${esc(t('newsGroupRequests'))}</div>` + items.map(newsRow).join('');
      if (!html) html = `<div class="state-box">${ic('bell')}<h3>${esc(t('notifEmpty'))}</h3></div>`;
      sheet.innerHTML = html + telegramRow();
    }
    const unseen = unseenCount() > 0;
    const dot = $('#notifDot'), mdot = $('#moreNewsDot');
    if (dot) dot.hidden = !unseen;
    if (mdot) mdot.hidden = !unseen;
  }

  function openNews(opener) {
    renderNews();
    U.openSheet('sheet-news', opener);
    loadTelegram();   // keş 10 dəq.-dən köhnədirsə yenilənir
    if (news && news.length) LS.setJSON('news_seen', Array.from(new Set(seenIds().concat(news.map(n => n.id)))).slice(-60));
    if (tgPosts && tgPosts.length) LS.setJSON('tg_seen_max:' + TG_CHANNEL, Math.max(tgSeenMax(), ...tgPosts.map(p => Number(p.id) || 0)));
    renderNews();
  }

  U.renderHome = function () {
    renderFeatures();
    renderNews();
    loadNews();
    loadTelegram();
    const input = $('#homeSearch');
    if (input && input.value) runHomeSearch(input.value);
  };

  // ═════════════════════════════════════════════════════════════
  // DAHA ÇOX
  // ═════════════════════════════════════════════════════════════
  function displayName() {
    const prof = typeof getProfile === 'function' ? getProfile() : null;
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    return (prof && prof.name) || (user && user.displayName) || (user && user.email && user.email.split('@')[0]) || t('moreStudent');
  }

  U.renderMore = function () {
    const acc = $('#moreAccount');
    const logged = isLogged();
    if (acc) {
      if (logged) {
        const user = getCurrentUser();
        const name = displayName();
        const prof = typeof getProfile === 'function' ? getProfile() : null;
        const xp = (prof && prof.progress && prof.progress.xp) || 0;
        const info = typeof getRankInfo === 'function' ? getRankInfo(xp) : null;
        const sub = info ? `${info.rank.name} · ${xp} XP` : (user && user.email) || '';
        const avatar = user && user.photoURL
          ? `<img src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">`
          : esc(name.charAt(0).toUpperCase());
        acc.innerHTML = `<a class="account-card" href="#/dashboard"><span class="avatar">${avatar}</span>
          <span class="grow"><b>${esc(name)}</b><small>${esc(sub)}</small></span>${ic('chevron-right', 'chev')}</a>`;
      } else {
        acc.innerHTML = `<button class="account-card account-card--guest" type="button" id="moreLogin"><span class="avatar">${ic('user')}</span>
          <span class="grow"><b>${esc(t('moreGuestTitle'))}</b><small>${esc(t('moreGuestSub'))}</small></span>${ic('chevron-right', 'chev')}</button>`;
      }
    }
    const lg = $('#moreLogoutGroup');
    if (lg) lg.hidden = !logged;
    const fc = $('#moreFavCount');
    if (fc) { const n = getFavorites().length; fc.textContent = n ? String(n) : ''; }
    renderNews();
  };

  function confirmSheet(opts) {
    $('#confirmTitle').textContent = opts.title;
    $('#confirmText').textContent = opts.text;
    const ok = $('#confirmOk');
    ok.textContent = opts.ok;
    ok.onclick = () => { U.closeSheet(); opts.onOk(); };
    U.openSheet('sheet-confirm', opts.opener);
  }

  function syncLangChips() {
    $$('#settingsLang [data-set-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.setLang === lang)));
  }

  function bindMore() {
    document.addEventListener('click', e => {
      if (e.target.closest('#moreLogin')) { if (typeof openAuthModal === 'function') openAuthModal('login'); return; }
      const lb = e.target.closest('#settingsLang [data-set-lang]');
      if (lb) { setLang(lb.dataset.setLang); syncLangChips(); }
    });
    const newsRowBtn = $('#rowNews');
    if (newsRowBtn) newsRowBtn.addEventListener('click', () => openNews(newsRowBtn));
    const settings = $('#rowSettings');
    if (settings) settings.addEventListener('click', () => { syncLangChips(); U.openSheet('sheet-settings', settings); });
    const out = $('#rowLogout');
    if (out) out.addEventListener('click', () => confirmSheet({
      title: t('logoutTitle'), text: t('logoutText'), ok: t('logoutConfirm'), opener: out,
      onOk: () => { if (typeof signOut === 'function') signOut(); }
    }));
    const bell = $('#notifBtn');
    if (bell) bell.addEventListener('click', () => openNews(bell));
  }

  // ═════════════════════════════════════════════════════════════
  // GPA — fənn sayı addımlayıcısı və "Yenidən hesabla"
  // ═════════════════════════════════════════════════════════════
  U.syncGpaStepper = function () {
    const out = $('#gpa-count-out'), dec = $('#gpa-dec');
    if (typeof gpaSubjects === 'undefined') return;
    if (out) out.textContent = String(gpaSubjects.length);
    if (dec) dec.disabled = gpaSubjects.length <= 1;
  };

  function bindGpa() {
    const inc = $('#gpa-inc'), dec = $('#gpa-dec'), recalc = $('#gpa-recalc');
    if (inc) inc.addEventListener('click', () => { addSubject(true); });
    if (dec) dec.addEventListener('click', () => {
      if (gpaSubjects.length <= 1) { U.toast(t('gpaMinSubjects'), 'error'); return; }
      removeSubject(gpaSubjects[gpaSubjects.length - 1].id);
    });
    if (recalc) recalc.addEventListener('click', () => { gpaRender(); U.toast(t('gpaUpdated')); });
  }

  // ═════════════════════════════════════════════════════════════
  // Hadisələr
  // ═════════════════════════════════════════════════════════════
  window.addEventListener('unec:langchange', () => {
    document.documentElement.lang = lang;
    syncLangChips();
    const r = U.route;
    if (!r) return;
    if (r.tab === 'home') U.renderHome();
    else if (r.tab === 'more') U.renderMore();
    renderNews();
  });

  window.addEventListener('unec:authchange', () => {
    loadNews(true);
    const r = U.route;
    if (r && r.tab === 'more') U.renderMore();
    if (r && r.tab === 'dashboard') {
      const logged = isLogged();
      const g = $('#dash-guest-view'), u = $('#dash-user-view');
      if (g) g.style.display = logged ? 'none' : '';
      if (u) u.style.display = logged ? '' : 'none';
    }
  });

  window.addEventListener('unec:favchange', () => {
    const fc = $('#moreFavCount');
    if (fc) { const n = getFavorites().length; fc.textContent = n ? String(n) : ''; }
  });

  // ═════════════════════════════════════════════════════════════
  // Başlanğıc
  // ═════════════════════════════════════════════════════════════
  document.addEventListener('DOMContentLoaded', function () {
    document.documentElement.lang = lang;
    U.initMaterials();
    bindHomeSearch();
    bindMore();
    bindGpa();
    readTgCache();  // son keşdən dərhal göstərmək üçün
    U.initCore();   // marşrutu oxuyub ilk ekranı çəkir
    loadNews();
    loadTelegram();
  });
})();
