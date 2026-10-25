// ============================================================
// APP-MATERIALS.JS — material indeksi, MaterialCard, Kurslar siyahısı (axtarış + filtr),
// material detalı və fənn səhifəsi üçün ortaq kart/hero komponentləri.
//
// Verilənlər yalnız pdfs.js-dən (data, extrasData, PDF_TYPES) gəlir — uydurma məlumat yoxdur.
// ============================================================
(function () {
  'use strict';

  const U = window.UNEC;
  const { $, $$, esc, ic, enc, tr, normAz } = U;

  const PAGE = 30;
  const DEFAULT_COLOR = '#ef4444';
  const EXTRA_COLOR = '#f59e0b';

  // ── Entry (material) ────────────────────────────────────────
  function makeEntry(course, subject, subj, p) {
    return {
      id: `${course}|${subject}|${p.file}`,
      kind: 'pdf',
      course, subject,
      name: p.name,
      file: p.file,
      url: BASE + 'pdf/' + p.file,
      favKey: 'pdf/' + p.file,
      format: subj.type,
      semester: subj.semester,
      pdfType: p.pdfType,
      code: p.code ? String(p.code).trim() : getSubjectCode(subj),
      category: 'PDF',
      subjObj: subj
    };
  }
  function makeExtra(course, p) {
    return {
      id: `${course}||${p.file}`,
      kind: 'extra',
      course, subject: null,
      name: p.name,
      file: p.file,
      url: EXTRAS_BASE + p.file,
      favKey: 'pdf-extra/' + p.file,
      pdfType: p.pdfType,
      desc: p.desc || '',
      category: 'PDF-Extra'
    };
  }
  function withSearch(m) {
    const typeLabel = (PDF_TYPES[m.pdfType] || {}).label || '';
    m.search = normAz([m.name, m.subject, m.course, m.file, m.code, m.desc, typeLabel].join(' '));
    return m;
  }

  let index = null;
  function getIndex() {
    if (index) return index;
    const list = [];
    const seen = new Set();
    Object.entries(data).forEach(([course, cd]) => {
      Object.entries(cd.subjects).forEach(([subject, subj]) => {
        subj.pdfs.forEach(p => {
          const k = course + '|' + p.file;
          if (seen.has(k)) return;           // eyni kursda eyni fayl iki fənndə təkrarlanıbsa, siyahıda bir dəfə
          seen.add(k);
          list.push(withSearch(makeEntry(course, subject, subj, p)));
        });
      });
    });
    Object.entries(extrasData || {}).forEach(([course, items]) => {
      items.forEach(p => list.push(withSearch(makeExtra(course, p))));
    });
    return (index = list);
  }

  function resolveEntry(r) {
    if (r.extra) {
      const p = ((extrasData || {})[r.course] || []).find(x => x.file === r.file);
      return p ? makeExtra(r.course, p) : null;
    }
    const cd = data[r.course];
    const subj = cd && cd.subjects[r.subject];
    if (subj) {
      const p = subj.pdfs.find(x => x.file === r.file);
      if (p) return makeEntry(r.course, r.subject, subj, p);
    }
    for (const [c, cd2] of Object.entries(data)) {
      for (const [s, sj] of Object.entries(cd2.subjects)) {
        const p = sj.pdfs.find(x => x.file === r.file);
        if (p) return makeEntry(c, s, sj, p);
      }
    }
    return null;
  }

  function entriesForSubject(course, subject) {
    const subj = data[course].subjects[subject];
    return subj.pdfs.map(p => makeEntry(course, subject, subj, p));
  }
  function extraEntries(course) { return ((extrasData || {})[course] || []).map(p => makeExtra(course, p)); }
  function favoriteEntries(course) {
    const favs = new Set(getFavorites());
    const out = [];
    Object.entries(data[course].subjects).forEach(([subject, subj]) => {
      subj.pdfs.forEach(p => { if (favs.has('pdf/' + p.file)) out.push(makeEntry(course, subject, subj, p)); });
    });
    extraEntries(course).forEach(m => { if (favs.has(m.favKey)) out.push(m); });
    return out;
  }

  const matHref = m => m.kind === 'extra'
    ? `#/x/${enc(m.course)}/${enc(m.file)}`
    : `#/m/${enc(m.course)}/${enc(m.subject)}/${enc(m.file)}`;
  const typeColor = m => (PDF_TYPES[m.pdfType] || {}).color || (m.kind === 'extra' ? EXTRA_COLOR : DEFAULT_COLOR);
  const formatLabel = f => f === 'test' ? t('formatTest') : (f === 'yazili' ? t('formatWritten') : '');
  const semesterLabel = s => s === 1 ? t('semFall') : (s === 2 ? t('semSpring') : '');
  const isFav = m => getFavorites().includes(m.favKey);

  // ── Reytinqlər (siyahı üçün toplu oxuma) ────────────────────
  const ratingCache = new Map();
  const ratingIdOf = m => (m.kind === 'pdf' && typeof ratingDocId === 'function') ? ratingDocId(m.course, m.subject, m.file) : null;

  function paintRatings(root) {
    $$('.mat-rate-slot[data-rid]', root || document).forEach(el => {
      const r = ratingCache.get(el.dataset.rid);
      if (r && r.count > 0) el.innerHTML = `<span class="mat-rate" title="${esc(r.avg.toFixed(1))} / 5">${ic('star')}${esc(r.avg.toFixed(1))}<span class="cnt">(${r.count})</span></span>`;
    });
  }

  async function fetchRatings(entries) {
    const db = typeof getDb === 'function' ? getDb() : null;
    if (!db || typeof firebase === 'undefined') return;
    const need = Array.from(new Set(entries.map(ratingIdOf).filter(id => id && !ratingCache.has(id))));
    for (let i = 0; i < need.length; i += 10) {
      const chunk = need.slice(i, i + 10);
      try {
        const snap = await db.collection('pdf_ratings').where(firebase.firestore.FieldPath.documentId(), 'in', chunk).get();
        const found = new Set();
        snap.forEach(d => { const v = d.data() || {}; found.add(d.id); ratingCache.set(d.id, { avg: v.avg || 0, count: v.count || 0 }); });
        chunk.forEach(id => { if (!found.has(id)) ratingCache.set(id, { avg: 0, count: 0 }); });
      } catch (e) {
        console.warn('[ratings] siyahı reytinqləri oxunmadı:', e);
        break;
      }
    }
    paintRatings();
    if (U.afterRatings) U.afterRatings();
  }

  function avgRatingFor(entries) {
    let sum = 0, cnt = 0;
    entries.forEach(m => { const r = ratingCache.get(ratingIdOf(m)); if (r && r.count) { sum += r.avg * r.count; cnt += r.count; } });
    return cnt ? { avg: sum / cnt, count: cnt } : null;
  }

  // ── Kart komponentləri ──────────────────────────────────────
  function badgesHTML(m, withCode) {
    const out = [];
    if (m.pdfType && PDF_TYPES[m.pdfType]) out.push(getPdfTypeBadgeHTML(m.pdfType));
    if (m.kind === 'extra') out.push(`<span class="badge badge--purple">${esc(t('extraMaterial'))}</span>`);
    else if (m.format) out.push(getTypeBadgeHTML(m.format));
    if (withCode && m.code) out.push(codeBadgeHTML(m.code));
    return out.join('');
  }

  function favBtnHTML(m) {
    const on = isFav(m);
    return `<button type="button" class="fav-btn${on ? ' active' : ''}" data-fav="${esc(m.favKey)}" aria-pressed="${on}" aria-label="${esc(t(on ? 'appFavRemove' : 'appFavAdd'))}" title="${esc(t(on ? 'appFavRemove' : 'appFavAdd'))}">${ic('star')}</button>`;
  }

  function fileBtnsHTML(m) {
    const attrs = `data-url="${esc(m.url)}" data-file="${esc(m.file)}" data-category="${esc(m.category)}"`;
    return `
      <button type="button" class="btn btn--primary" data-action="open" ${attrs}>${ic('external-link')}<span>${esc(t('appOpen'))}</span></button>
      <button type="button" class="btn btn--secondary" data-action="download" ${attrs}>${ic('download')}<span>${esc(t('appDownload'))}</span></button>`;
  }

  // Siyahı kartı (Kurslar, ana səhifə axtarışı, oxşar materiallar)
  function matCardHTML(m) {
    const sub = m.kind === 'extra' ? t('extraMaterial') : m.subject;
    const rid = ratingIdOf(m);
    return `
    <article class="mat-card mat-card--row" style="--tc:${typeColor(m)}">
      <div class="mat-main">
        <span class="mat-icon" aria-hidden="true">${ic('pdf')}<b>PDF</b></span>
        <div class="mat-body">
          <h3 class="mat-title"><a href="${matHref(m)}">${esc(m.name)}</a></h3>
          <div class="mat-meta"><span>${esc(sub)}</span><span class="sep">•</span><span>${esc(m.course)}</span></div>
          <div class="mat-badges">${badgesHTML(m, false)}${rid ? `<span class="mat-rate-slot" data-rid="${esc(rid)}"></span>` : ''}</div>
        </div>
        <div class="mat-side">${favBtnHTML(m)}${ic('chevron-right', 'chev')}</div>
      </div>
      <div class="mat-actions">${fileBtnsHTML(m)}</div>
    </article>`;
  }

  // Fənn səhifəsində fayl əməliyyatları detal səhifəsindədir; reytinq kartda qalır.
  function richCardHTML(m, { subjectPreview = false } = {}) {
    const meta = m.kind === 'extra' ? (m.desc || m.file) : m.file;
    const ratingWidget = m.kind === 'pdf'
      ? `<div class="pdf-rating" data-course="${esc(m.course)}" data-subject="${esc(m.subject)}" data-file="${esc(m.file)}"></div>` : '';
    return `
    <article class="mat-card mat-card--rich" style="--tc:${typeColor(m)}">
      <div class="mat-main">
        <span class="mat-icon" aria-hidden="true">${ic('pdf')}<b>PDF</b></span>
        <div class="mat-body">
          <h3 class="mat-title"><a href="${matHref(m)}">${esc(m.name)}</a></h3>
          ${subjectPreview ? '' : `<div class="mat-meta"><span class="fname">${esc(meta)}</span></div>`}
          <div class="mat-badges">${badgesHTML(m, true)}</div>
        </div>
      </div>
      ${ratingWidget}
      ${subjectPreview ? '' : `<div class="mat-actions">${fileBtnsHTML(m)}${favBtnHTML(m)}</div>`}
    </article>`;
  }

  // Fənn səhifəsinin yuxarı kartı
  function subjectHeroHTML(course, subject, subj, entries) {
    const code = getSubjectCode(subj);
    const sem = semesterLabel(subj.semester);
    const desc = code ? tr('subjectDesc', { code, course, semester: sem }) : `${course}, ${sem}.`;
    return `
    <section class="subject-hero" aria-labelledby="subjHeroTitle">
      ${subj.type ? `<span class="badge ${subj.type === 'test' ? 'badge--green' : 'badge--orange'}">${esc(formatLabel(subj.type))}</span>` : ''}
      <h1 id="subjHeroTitle">${esc(subject)}</h1>
      <p>${esc(desc)}</p>
      <div class="hero-stats" id="subjHeroStats">
        <div class="hero-stat">${ic('file-text')}<div><b>${entries.length}</b><small>${esc(t('heroStatMaterials'))}</small></div></div>
        <div class="hero-stat">${ic('clipboard-check')}<div><b>${esc(subj.type === 'test' ? 'Test' : (subj.type === 'yazili' ? 'Yazılı' : '—'))}</b><small>${esc(t('heroStatFormat'))}</small></div></div>
      </div>
    </section>`;
  }

  function addHeroRating(entries) {
    const stats = $('#subjHeroStats');
    if (!stats || $('#heroRatingStat')) return;
    const r = avgRatingFor(entries);
    if (!r) return;
    stats.insertAdjacentHTML('beforeend', `<div class="hero-stat" id="heroRatingStat">${ic('star')}<div><b>${esc(r.avg.toFixed(1))}</b><small>${esc(t('heroStatRating'))}</small></div></div>`);
  }

  // Fənn səhifəsi (ui.js çağırır): reytinqləri yüklə və hero-ya əlavə et
  function afterSubjectRender(entries) {
    fetchRatings(entries).then(() => addHeroRating(entries));
    if (typeof renderAllPdfRatings === 'function') renderAllPdfRatings();
  }

  Object.assign(U, { makeEntry, makeExtra, getIndex, resolveEntry, entriesForSubject, extraEntries, favoriteEntries,
    matHref, matCardHTML, richCardHTML, subjectHeroHTML, afterSubjectRender, fetchRatings, avgRatingFor, favBtnHTML, formatLabel, semesterLabel });

  // ═════════════════════════════════════════════════════════════
  // KURSLAR — "Bütün materiallar" siyahısı
  // ═════════════════════════════════════════════════════════════
  const newState = () => ({ q: '', course: 'all', fav: false, format: new Set(), ptype: new Set(), sem: new Set(), major: 'all', shown: PAGE });
  const S = (U.matState = newState());
  const resetState = () => Object.assign(S, newState());

  function hasSheetFilter() { return S.format.size || S.ptype.size || S.sem.size || S.major !== 'all'; }

  function filterMaterials() {
    let res = getIndex();
    if (S.course !== 'all') res = res.filter(m => m.course === S.course);
    if (S.fav) { const f = new Set(getFavorites()); res = res.filter(m => f.has(m.favKey)); }
    if (S.format.size) res = res.filter(m => m.kind === 'pdf' && S.format.has(m.format));
    if (S.ptype.size)  res = res.filter(m => S.ptype.has(m.pdfType));
    if (S.sem.size)    res = res.filter(m => m.kind === 'pdf' && S.sem.has(m.semester));
    if (S.major !== 'all') res = res.filter(m => m.kind === 'pdf' && subjectMatchesMajor(m.subject, m.subjObj, S.major, courseNumber(m.course)));
    const q = normAz(S.q);
    if (q) {
      const toks = q.split(' ');
      res = res.filter(m => toks.every(tk => m.search.includes(tk)));
      const rank = m => { const n = normAz(m.name); return n.startsWith(q) ? 0 : (n.includes(q) ? 1 : 2); };
      res = res.map((m, i) => ({ m, i, r: rank(m) })).sort((a, b) => a.r - b.r || a.i - b.i).map(x => x.m);
    }
    return res;
  }

  function renderChips() {
    const box = $('#matChips');
    if (!box) return;
    const favCount = (function () { const f = new Set(getFavorites()); return getIndex().filter(m => f.has(m.favKey)).length; })();
    const chip = (attr, label, pressed, extra) => `<button type="button" class="chip" ${attr} aria-pressed="${pressed}">${extra || ''}${esc(label)}</button>`;
    box.innerHTML =
      chip('data-chip="all"', t('matFilterAll'), S.course === 'all') +
      Object.keys(data).map(c => chip(`data-chip="course" data-v="${esc(c)}"`, c, S.course === c)).join('') +
      chip('data-chip="fav"', t('matFilterFav') + (favCount ? ` (${favCount})` : ''), S.fav, ic('star'));
  }

  function renderMaterials() {
    const list = $('#matList');
    if (!list) return;
    renderChips();
    const res = filterMaterials();
    const shown = res.slice(0, S.shown);

    const cnt = $('#matCount');
    if (cnt) cnt.textContent = tr('matCount', { n: res.length });
    const fb = $('#matFilterBtn');
    if (fb) fb.classList.toggle('has-filter', !!hasSheetFilter());

    if (!res.length) {
      const favEmpty = S.fav && !S.q && S.course === 'all' && !hasSheetFilter();
      list.innerHTML = `<div class="state-box" style="grid-column:1/-1">${ic(favEmpty ? 'star' : 'search')}
        <h3>${esc(t(favEmpty ? 'matEmptyFav' : 'matEmpty'))}</h3><p>${esc(t(favEmpty ? 'matEmptyFavHint' : 'matEmptyHint'))}</p></div>`;
    } else {
      list.innerHTML = shown.map(matCardHTML).join('');
    }

    let more = $('#matMore');
    if (!more) {
      more = document.createElement('div');
      more.id = 'matMore';
      more.style.cssText = 'display:flex;justify-content:center;margin-top:16px';
      list.parentNode.insertBefore(more, list.nextSibling);
    }
    more.innerHTML = res.length > shown.length
      ? `<button type="button" class="btn btn--secondary" id="matMoreBtn">${esc(t('matShowMore'))} (${res.length - shown.length})</button>` : '';

    fetchRatings(shown);
  }
  U.renderMaterials = renderMaterials;

  // filtr sheet-i
  let draft = null;
  function buildFilterSheet() {
    const body = $('#filterBody');
    if (!body) return;
    const pts = Array.from(new Set(getIndex().map(m => m.pdfType).filter(k => k && PDF_TYPES[k])));
    const mk = (group, v, label, on) => `<button type="button" class="chip" data-f="${group}" data-v="${esc(v)}" aria-pressed="${on}">${esc(label)}</button>`;
    let majors = '';
    if (typeof CURRICULUM_DATA !== 'undefined') {
      majors = mk('major', 'all', t('majorAll'), draft.major === 'all') +
        Object.entries(CURRICULUM_DATA).map(([k, m]) => mk('major', k, t(MAJOR_I18N_KEYS[k]) || m.name, draft.major === k)).join('') +
        mk('major', TUDIFAK_KEY, TUDIFAK_LABEL, draft.major === TUDIFAK_KEY);
    }
    body.innerHTML = `
      <div class="opt-group"><h3>${esc(t('matFilterFormat'))}</h3><div class="opt-chips">
        ${mk('format', 'test', t('formatTest'), draft.format.has('test'))}${mk('format', 'yazili', t('formatWritten'), draft.format.has('yazili'))}
      </div></div>
      <div class="opt-group"><h3>${esc(t('matFilterType'))}</h3><div class="opt-chips">
        ${pts.map(k => mk('ptype', k, PDF_TYPES[k].label, draft.ptype.has(k))).join('')}
      </div></div>
      <div class="opt-group"><h3>${esc(t('matFilterSemester'))}</h3><div class="opt-chips">
        ${mk('sem', '1', t('semFall'), draft.sem.has(1))}${mk('sem', '2', t('semSpring'), draft.sem.has(2))}
      </div></div>
      ${majors ? `<div class="opt-group"><h3>${esc(t('matFilterMajor'))}</h3><div class="opt-chips">${majors}</div></div>` : ''}`;
  }

  function openFilter(opener) {
    draft = { format: new Set(S.format), ptype: new Set(S.ptype), sem: new Set(S.sem), major: S.major };
    buildFilterSheet();
    U.openSheet('sheet-filter', opener);
  }

  function bindMaterials() {
    const input = $('#matSearch'), box = $('#matSearchBox'), clear = $('#matSearchClear');
    let timer = null;
    if (input) {
      input.addEventListener('input', () => {
        if (box) box.classList.toggle('has-value', !!input.value);
        clearTimeout(timer);
        timer = setTimeout(() => { S.q = input.value.trim(); S.shown = PAGE; renderMaterials(); }, 120);
      });
      input.addEventListener('keydown', e => { if (e.key === 'Enter') input.blur(); });
    }
    if (clear) clear.addEventListener('click', () => {
      input.value = ''; if (box) box.classList.remove('has-value');
      S.q = ''; S.shown = PAGE; renderMaterials(); input.focus();
    });

    const chips = $('#matChips');
    if (chips) chips.addEventListener('click', e => {
      const b = e.target.closest('[data-chip]');
      if (!b) return;
      const kind = b.dataset.chip;
      if (kind === 'all') S.course = 'all';
      else if (kind === 'course') S.course = b.dataset.v;
      else if (kind === 'fav') S.fav = !S.fav;
      S.shown = PAGE;
      renderMaterials();
      const active = $('#matChips .chip[aria-pressed="true"]');
      if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });

    const fb = $('#matFilterBtn');
    if (fb) fb.addEventListener('click', () => openFilter(fb));

    const fbody = $('#filterBody');
    if (fbody) fbody.addEventListener('click', e => {
      const b = e.target.closest('[data-f]');
      if (!b || !draft) return;
      const g = b.dataset.f, v = b.dataset.v;
      if (g === 'major') draft.major = v;
      else {
        const key = g === 'sem' ? Number(v) : v;
        const set = draft[g];
        if (set.has(key)) set.delete(key); else set.add(key);
      }
      buildFilterSheet();
    });
    const reset = $('#filterReset');
    if (reset) reset.addEventListener('click', () => { draft = { format: new Set(), ptype: new Set(), sem: new Set(), major: 'all' }; buildFilterSheet(); });
    const apply = $('#filterApply');
    if (apply) apply.addEventListener('click', () => {
      if (draft) { S.format = draft.format; S.ptype = draft.ptype; S.sem = draft.sem; S.major = draft.major; }
      S.shown = PAGE;
      U.closeSheet();
      renderMaterials();
    });

    const list = $('#matList');
    const more = () => { S.shown += PAGE; renderMaterials(); };
    document.addEventListener('click', e => { if (e.target.closest('#matMoreBtn')) more(); });

    // rejim keçidi: Bütün materiallar | Fənlər üzrə
    document.addEventListener('click', e => {
      const b = e.target.closest('.mode-switch [data-mode]');
      if (!b) return;
      U.go(b.dataset.mode === 'subjects' ? '/courses/subjects' : '/courses/all');
    });
  }

  // ═════════════════════════════════════════════════════════════
  // MATERİAL DETALI
  // ═════════════════════════════════════════════════════════════
  const sizeCache = new Map();
  async function fetchSize(url) {
    if (sizeCache.has(url)) return sizeCache.get(url);
    let v = null;
    try {
      const ctl = new AbortController();
      const to = setTimeout(() => ctl.abort(), 6000);
      const res = await fetch(url, { method: 'HEAD', signal: ctl.signal });
      clearTimeout(to);
      const len = Number(res.headers.get('content-length'));
      if (res.ok && len > 0) v = len;
    } catch (e) { /* CORS / şəbəkə — ölçü göstərilmir */ }
    sizeCache.set(url, v);
    return v;
  }
  const fmtSize = b => b < 1048576 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / 1048576).toFixed(1) + ' MB';

  let currentMaterial = null;

  function describe(m) {
    if (m.kind === 'extra') return tr('mdDescExtra', { course: m.course, desc: m.desc || '' }).trim();
    return tr('mdDescSubject', { subject: m.subject, course: m.course, semester: semesterLabel(m.semester).toLowerCase(), format: formatLabel(m.format) });
  }

  function similarFor(m) {
    const all = getIndex();
    const same = all.filter(x => x.id !== m.id && x.course === m.course && x.subject === m.subject);
    const rest = all.filter(x => x.id !== m.id && x.course === m.course && x.subject !== m.subject && x.kind === m.kind && x.pdfType === m.pdfType);
    return same.concat(rest).slice(0, 4);
  }

  function renderMaterialDetail(r) {
    const box = $('#view-material');
    if (!box) return;
    const m = resolveEntry(r);
    currentMaterial = m;
    if (!m) {
      U.currentMaterialTitle = null;
      box.innerHTML = `
        <div class="page-head"><button class="icon-btn" type="button" data-back aria-label="${esc(t('appBack'))}">${ic('arrow-left')}</button><h1>${esc(t('mdNotFound'))}</h1></div>
        <div class="state-box">${ic('search')}<h3>${esc(t('mdNotFound'))}</h3><p>${esc(t('mdNotFoundHint'))}</p>
        <a class="btn btn--primary" href="#/courses/subjects">${esc(t('navCourses'))}</a></div>`;
      return;
    }
    U.currentMaterialTitle = m.name;
    const facts = [
      [t('mdCourse'), m.course],
      m.kind === 'pdf' ? [t('mdSemester'), semesterLabel(m.semester)] : null,
      m.kind === 'pdf' && m.format ? [t('mdFormat'), formatLabel(m.format)] : null,
      m.code ? [t('mdCode'), m.code] : null,
      [t('mdFile'), m.file]
    ].filter(Boolean);
    const sim = similarFor(m);
    const subjectPath = m.kind === 'pdf' ? `#/courses/subjects/${enc(m.course)}/${enc(m.subject)}` : `#/courses/subjects/${enc(m.course)}`;

    box.innerHTML = `
      <div class="page-head">
        <button class="icon-btn" type="button" data-back aria-label="${esc(t('appBack'))}">${ic('arrow-left')}</button>
        <h1>${esc(t('mdPageTitle'))}</h1>
        <button class="icon-btn" type="button" id="mdMoreBtn" aria-label="${esc(t('appMoreActions'))}" aria-haspopup="dialog">${ic('ellipsis-v')}</button>
      </div>
      <div class="md-layout">
        <div>
          <div class="md-top" style="--tc:${typeColor(m)}">
            <div class="md-icon" aria-hidden="true">${ic('pdf')}<b>PDF</b></div>
            <div class="md-top-text">
              <h2>${esc(m.name)}</h2>
              <div class="md-sub"><span>${esc(m.kind === 'extra' ? t('extraMaterial') : m.subject)}</span></div>
              <div class="mat-badges">${badgesHTML(m, true)}</div>
            </div>
          </div>
          ${m.kind === 'pdf' ? `<div class="pdf-rating" style="margin-top:14px" data-course="${esc(m.course)}" data-subject="${esc(m.subject)}" data-file="${esc(m.file)}"></div>` : ''}
          <section class="md-section"><h3>${esc(t('mdShortInfo'))}</h3><p>${esc(describe(m))}</p></section>
          <dl class="md-facts" id="mdFacts">
            ${facts.map(([k, v]) => `<div class="md-fact"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
          </dl>
          <div class="md-actions">${fileBtnsHTML(m).replace('btn btn--primary', 'btn btn--primary').trim()}${favBtnHTML(m)}</div>
          <div class="md-links">
            <a class="btn btn--ghost btn--sm" href="${subjectPath}">${ic('book-open')}<span>${esc(t('mdSubjectPage'))}</span></a>
            <button class="btn btn--ghost btn--sm" type="button" id="mdReportInline">${ic('flag')}<span>${esc(t('mdReport'))}</span></button>
          </div>
        </div>
        ${sim.length ? `<aside><section class="md-section" style="margin-top:22px"><h3>${esc(t('mdSimilar'))}</h3><div class="md-similar">${sim.map(matCardHTML).join('')}</div></section></aside>` : ''}
      </div>`;

    if (typeof renderAllPdfRatings === 'function') renderAllPdfRatings();
    fetchRatings(sim);

    // fayl ölçüsü — yalnız server qaytararsa
    fetchSize(m.url).then(b => {
      if (!b || currentMaterial !== m) return;
      const dl = $('#mdFacts');
      if (dl && !dl.querySelector('[data-size]')) dl.insertAdjacentHTML('beforeend', `<div class="md-fact" data-size><dt>${esc(t('mdSize'))}</dt><dd>${fmtSize(b)}</dd></div>`);
    });
  }

  function bindDetail() {
    document.addEventListener('click', e => {
      if (e.target.closest('#mdMoreBtn')) { U.openSheet('sheet-mdmore', e.target.closest('#mdMoreBtn')); return; }
      if (e.target.closest('#mdReportInline')) { reportCurrent(); return; }
    });
    const sb = $('#mdSubjectBtn'), rb = $('#mdReportBtn'), sh = $('#mdShareBtn');
    if (sb) sb.addEventListener('click', () => {
      const m = currentMaterial; U.closeSheet();
      if (m) U.go(m.kind === 'pdf' ? `/courses/subjects/${enc(m.course)}/${enc(m.subject)}` : `/courses/subjects/${enc(m.course)}`);
    });
    if (rb) rb.addEventListener('click', () => { U.closeSheet(); reportCurrent(); });
    if (sh) sh.addEventListener('click', async () => {
      const m = currentMaterial; U.closeSheet();
      if (!m) return;
      const url = location.href;
      try {
        if (navigator.share) { await navigator.share({ title: m.name, url }); return; }
        await navigator.clipboard.writeText(url);
        U.toast(t('linkCopied'));
      } catch (e) { /* istifadəçi ləğv etdi */ }
    });
  }
  function reportCurrent() {
    const m = currentMaterial;
    if (m && typeof openReportModal === 'function') openReportModal(m.subject || t('extraMaterial'), m.course);
  }

  // ── Kurslar marşrutu ────────────────────────────────────────
  U.showCoursesRoute = function (r, prev) {
    U.currentMaterialTitle = null;
    switch (r.view) {
      case 'entry':
        // Parametrsiz #/courses: Kurslar "Fənlər üzrə" ilə açılır (köhnə linklər və bookmark-lar üçün)
        U.go('/courses/subjects', { replace: true });
        return;
      case 'materials': {
        const q = r.query || {};
        const hasQuery = q.q != null || q.course != null || q.fav != null;
        if (hasQuery) {
          resetState();
          if (q.q) S.q = q.q;
          if (q.course && data[q.course]) S.course = q.course;
          if (q.fav === '1') S.fav = true;
        } else if (!prev || prev.tab !== 'courses') {
          resetState();
        }
        goTo('materials');
        const input = $('#matSearch');
        if (input) { input.value = S.q; const box = $('#matSearchBox'); if (box) box.classList.toggle('has-value', !!S.q); }
        renderMaterials();
        break;
      }
      case 'material':
        goTo('material');
        renderMaterialDetail(r);
        break;
      case 'home':
        goTo('home');
        break;
      case 'subjects':
        if (!data[r.course]) { U.go('/courses/subjects', { replace: true }); return; }
        showSubjects(r.course);
        break;
      case 'pdfs':
        if (!data[r.course] || !data[r.course].subjects[r.subject]) { U.go(data[r.course] ? '/courses/subjects/' + enc(r.course) : '/courses/subjects', { replace: true }); return; }
        showPdfs(r.course, r.subject);
        break;
      default: break;
    }
  };

  // dil / auth dəyişəndə cari görünüşü yenilə
  function refreshCurrent() {
    const r = U.route;
    if (!r || r.tab !== 'courses') return;
    if (r.view === 'materials') renderMaterials();
    else if (r.view === 'material') renderMaterialDetail(r);
  }
  window.addEventListener('unec:langchange', () => { refreshCurrent(); });
  window.addEventListener('unec:authchange', () => {
    const r = U.route;
    if (!r || r.tab !== 'courses') return;
    if (r.view === 'materials') fetchRatings(filterMaterials().slice(0, S.shown));
    if (r.view === 'material' || r.view === 'pdfs') { if (typeof renderAllPdfRatings === 'function') renderAllPdfRatings(); }
  });
  window.addEventListener('unec:favchange', () => {
    const r = U.route;
    if (r && r.tab === 'courses' && r.view === 'materials') renderChips();
  });

  U.initMaterials = function () { bindMaterials(); bindDetail(); };
})();
