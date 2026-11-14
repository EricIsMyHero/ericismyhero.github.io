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
  const RELATED_LIMIT = 3;
  const DEFAULT_COLOR = '#ef4444';
  const EXTRA_COLOR = '#f59e0b';

  // Eyni tarixli materiallar kataloq sırasını saxlayır; tarixsizlər sonda qalır.
  const newestFirst = entries => entries.slice().sort((a, b) =>
    (Date.parse(b.addedAt) || 0) - (Date.parse(a.addedAt) || 0));

  const identities=(kind,file)=>typeof MATERIAL_IDENTITIES!=='undefined'?(MATERIAL_IDENTITIES[kind+'/'+file]||[]):[];

  // ── Entry (material) ────────────────────────────────────────
  function makeEntry(course, subject, subj, p) {
    const rows=identities('pdf',p.file).filter(x=>x.subject===subject);
    const old=rows.find(x=>x.course===course)||rows[0];
    if(old){course=old.course;subj={...subj,type:old.type,semester:old.semester,code:old.code||subj.code};}
    return {
      id: `${course}|${subject}|${p.file}`,
      kind: 'pdf',
      course, subject,
      name: p.name,
      file: p.file,
      addedAt: p.addedAt || null,
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
    const rows=identities('pdf-extra',p.file);course=(rows.find(x=>x.course===course)||rows[0])?.course||course;
    return {
      id: `${course}||${p.file}`,
      kind: 'extra',
      course, subject: null,
      name: p.name,
      file: p.file,
      addedAt: p.addedAt || null,
      url: EXTRAS_BASE + p.file,
      favKey: 'pdf-extra/' + p.file,
      pdfType: p.pdfType,
      desc: p.desc || '',
      category: 'PDF-Extra'
    };
  }
  function withSearch(m) {
    const typeLabel = (PDF_TYPES[m.pdfType] || {}).label || '';
    m.search = normAz([m.name, m.subject, m.file, m.code, m.desc, typeLabel, ...(m.aliases || []).flatMap(a => [a.subject, a.code])].join(' '));
    return m;
  }

  let index = null;
  function getIndex() {
    if (index) return index;
    const list = [];
    const seen = new Map();
    Object.entries(data).forEach(([course, cd]) => {
      Object.entries(cd.subjects).forEach(([subject, subj]) => {
        subj.pdfs.forEach(p => {
          const k = 'pdf/' + p.file;
          const alias = { course, subject, subjObj: subj, code: p.code || getSubjectCode(subj), format: subj.type };
          const oldAliases=identities('pdf',p.file).map(old=>({...old,subjObj:{...subj,code:old.code||subj.code,type:old.type,semester:old.semester},format:old.type}));
          if (seen.has(k)) { if(!oldAliases.length)seen.get(k).aliases.push(alias); return; }
          const primary=oldAliases[0];
          const entry = makeEntry(primary?.course||course, primary?.subject||subject, primary?.subjObj||subj, p);
          entry.aliases = oldAliases.length?oldAliases:[alias]; seen.set(k, entry); list.push(entry);
        });
      });
    });
    Object.entries(extrasData || {}).forEach(([course, items]) => {
      items.forEach(p => { const key = 'pdf-extra/' + p.file; if (!seen.has(key)) { const m = makeExtra(course, p); seen.set(key, m); list.push(m); } });
    });
    return (index = newestFirst(list.map(withSearch)));
  }

  let subjects = null;
  function getSubjectCatalog() {
    if (subjects) return subjects;
    subjects = {};
    for (const [course, entry] of Object.entries(data)) for (const [name, subj] of Object.entries(entry.subjects)) {
      if (!subjects[name]) subjects[name] = { ...subj, legacyCourse: course, pdfs: [], entries: [] };
      for (const pdf of subj.pdfs) if (!subjects[name].pdfs.some(p => p.file === pdf.file)) {
        subjects[name].pdfs.push(pdf); subjects[name].entries.push(makeEntry(course, name, subj, pdf));
        subjects[name].legacyCourse=subjects[name].entries[0].course;
      }
    }
    return subjects;
  }

  function resolveEntry(r) {
    if (r.extra) {
      const p = ((extrasData || {})[r.course] || []).find(x => x.file === r.file);
      return p ? makeExtra(r.course, p) : (() => {const m=getIndex().find(m=>m.kind==='extra'&&m.file===r.file);return m?makeExtra(r.course||m.course,m):null;})();
    }
    const cd = data[r.course];
    const subj = cd && cd.subjects[r.subject];
    if (subj) {
      const p = subj.pdfs.find(x => x.file === r.file);
      if (p) return makeEntry(r.course, r.subject, subj, p);
    }
    for (const [c, cd2] of Object.entries(data)) {
      for (const [s, sj] of Object.entries(cd2.subjects)) {
        if (r.subject && s !== r.subject) continue;
        const p = sj.pdfs.find(x => x.file === r.file);
        if (p) return makeEntry(r.course||c, s, sj, p);
      }
    }
    return null;
  }

  function entriesForSubject(course, subject) {
    const entries=getSubjectCatalog()[subject]?.entries||[];
    return newestFirst(entries.filter(m=>typeof getSelectedMajor!=='function'||getSelectedMajor()==='all'||subjectMatchesMajor(m.subject,m.subjObj,getSelectedMajor(),parseInt(course,10)||null)));
  }
  function extraEntries(course) {
    return getIndex().filter(m => m.kind === 'extra');
  }
  function favoriteEntries(course) {
    const favs = new Set(getFavorites());
    return getIndex().filter(m => favs.has(m.favKey));
  }

  const subjectHref = subject => '#/subject/' + enc(subject);
  const matHref = m => m.kind === 'extra'
    ? `#/extra/${enc(m.file)}`
    : `#/material/${enc(m.subject)}/${enc(m.file)}`;
  const publicMatHref = m => '/materials/' + enc((m.kind === 'extra' ? 'extra-' : '') + m.file.replace(/\.pdf$/i, '')) + '/';
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
          <div class="mat-meta"><span>${esc(sub)}</span></div>
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
    <article class="mat-card mat-card--rich${subjectPreview ? ' mat-card--subject' : ''}" style="--tc:${typeColor(m)}">
      <div class="mat-main">
        <span class="mat-icon" aria-hidden="true">${ic('pdf')}<b>PDF</b></span>
        <div class="mat-body">
          <h3 class="mat-title"><a href="${matHref(m)}">${esc(m.name)}</a></h3>
          ${subjectPreview ? '' : `<div class="mat-meta"><span class="fname">${esc(meta)}</span></div>`}
          <div class="mat-badges">${badgesHTML(m, true)}</div>
        </div>
      </div>
      ${ratingWidget}
      ${subjectPreview
        ? `<a class="btn btn--secondary mat-detail-link" href="${matHref(m)}" aria-label="${esc(t('matViewDetails') + ': ' + m.name)}"><span>${esc(t('matViewDetails'))}</span>${ic('chevron-right')}</a>`
        : `<div class="mat-actions">${fileBtnsHTML(m)}${favBtnHTML(m)}</div>`}
    </article>`;
  }

  // Fənn səhifəsinin yuxarı kartı
  function subjectHeroHTML(course, subject, subj, entries) {
    const code = getSubjectCode(subj);
    const desc = code ? t('mdCode') + ': ' + code : t('materialSubjectIntro');
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

  Object.assign(U, { makeEntry, makeExtra, getIndex, getSubjectCatalog, subjectHref, resolveEntry, entriesForSubject, extraEntries, favoriteEntries,
    matHref, publicMatHref, matCardHTML, richCardHTML, subjectHeroHTML, afterSubjectRender, fetchRatings, avgRatingFor, favBtnHTML, formatLabel, semesterLabel });

  // ═════════════════════════════════════════════════════════════
  // KURSLAR — "Bütün materiallar" siyahısı
  // ═════════════════════════════════════════════════════════════
  const newState = () => ({ q: '', fav: false, format: new Set(), ptype: new Set(), major: typeof getSelectedMajor==='function'?getSelectedMajor():'all', shown: PAGE });
  const S = (U.matState = newState());
  const resetState = () => Object.assign(S, newState());

  function hasSheetFilter() { return S.format.size || S.ptype.size || S.major !== 'all'; }

  function filterMaterials() {
    let res = getIndex();
    if (S.fav) { const f = new Set(getFavorites()); res = res.filter(m => f.has(m.favKey)); }
    if (S.format.size) res = res.filter(m => m.kind === 'pdf' && S.format.has(m.format));
    if (S.ptype.size)  res = res.filter(m => S.ptype.has(m.pdfType));
    if (S.major !== 'all') res = res.filter(m => m.kind === 'pdf' && (m.aliases || [m]).some(a => subjectMatchesMajor(a.subject, a.subjObj, S.major, null)));
    const q = normAz(S.q);
    if (q) {
      const toks = q.split(' ');
      res = res.filter(m => toks.every(tk => m.search.includes(tk)));
    }
    return res;
  }

  function renderChips() {
    const box = $('#matChips');
    if (!box) return;
    const favCount = (function () { const f = new Set(getFavorites()); return getIndex().filter(m => f.has(m.favKey)).length; })();
    const chip = (attr, label, pressed, extra) => `<button type="button" class="chip" ${attr} aria-pressed="${pressed}">${extra || ''}${esc(label)}</button>`;
    box.innerHTML =
      chip('data-chip="all"', t('matFilterAll'), !S.fav) +
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
      const favEmpty = S.fav && !S.q && !hasSheetFilter();
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
      ${majors ? `<div class="opt-group"><h3>${esc(t('matFilterMajor'))}</h3><div class="opt-chips">${majors}</div></div>` : ''}`;
  }

  function openFilter(opener) {
    draft = { format: new Set(S.format), ptype: new Set(S.ptype), major: S.major };
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
      if (kind === 'all') S.fav = false;
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
        const key = v;
        const set = draft[g];
        if (set.has(key)) set.delete(key); else set.add(key);
      }
      buildFilterSheet();
    });
    const reset = $('#filterReset');
    if (reset) reset.addEventListener('click', () => { draft = { format: new Set(), ptype: new Set(), major: 'all' }; buildFilterSheet(); });
    const apply = $('#filterApply');
    if (apply) apply.addEventListener('click', () => {
      if (draft) { S.format = draft.format; S.ptype = draft.ptype; S.major = draft.major; }
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
      U.go(b.dataset.mode === 'subjects' ? '/materials' : '/materials/all');
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
  let currentRelated = { subject: [], semester: [] };

  function relatedFor(m) {
    if (m.kind === 'extra') {
      return { subject: extraEntries(m.course).filter(x => x.file !== m.file), semester: [] };
    }
    const own = entriesForSubject(null, m.subject);
    const ownFiles = new Set(own.map(x => x.file));
    return {
      subject: own.filter(x => x.file !== m.file),
      semester: getIndex().filter(x => x.kind === 'pdf' && x.subject !== m.subject && !ownFiles.has(x.file))
    };
  }

  function relatedSectionHTML(group, title, entries) {
    const id = 'md-related-' + group;
    return `
      <section class="md-section md-related-group md-related--${group}" aria-labelledby="${id}-title">
        <h3 id="${id}-title">${esc(title)}</h3>
        ${entries.length
          ? `<div class="md-similar">${entries.slice(0, RELATED_LIMIT).map(matCardHTML).join('')}</div>`
          : `<p>${esc(t('mdNoRelated'))}</p>`}
        ${entries.length > RELATED_LIMIT ? `
          <div class="md-similar" id="${id}-more" hidden>${entries.slice(RELATED_LIMIT).map(matCardHTML).join('')}</div>
          <button type="button" class="btn btn--secondary md-related-toggle" data-related-toggle="${group}" aria-controls="${id}-more" aria-expanded="false">${esc(t('mdSeeAll'))} (${entries.length})</button>` : ''}
      </section>`;
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
        <a class="btn btn--primary" href="#/materials">${esc(t('navCourses'))}</a></div>`;
      return;
    }
    U.currentMaterialTitle = m.name;
    const facts = [
      m.kind === 'pdf' ? [t('mdSubject'), m.subject] : null,
      m.kind === 'pdf' && m.format ? [t('mdFormat'), formatLabel(m.format)] : null,
      m.code ? [t('mdCode'), m.code] : null,
      [t('mdFile'), m.file]
    ].filter(Boolean);
    currentRelated = relatedFor(m);
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
          <section class="md-section">
            <h3>${esc(t('mdShortInfo'))}</h3>
            <dl class="md-facts" id="mdFacts">
              ${facts.map(([k, v]) => `<div class="md-fact"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
            </dl>
          </section>
          <div class="md-actions">${fileBtnsHTML(m).replace('btn btn--primary', 'btn btn--primary').trim()}${favBtnHTML(m)}</div>
        </div>
        <aside class="md-related">
          ${relatedSectionHTML('subject', t(m.kind === 'pdf' ? 'mdSameSubject' : 'mdSimilar'), currentRelated.subject)}
          ${m.kind === 'pdf' ? relatedSectionHTML('semester', t('mdOtherSubjects'), currentRelated.semester) : ''}
        </aside>
      </div>`;

    if (typeof renderAllPdfRatings === 'function') renderAllPdfRatings();
    fetchRatings(currentRelated.subject.slice(0, RELATED_LIMIT).concat(currentRelated.semester.slice(0, RELATED_LIMIT)));

    // fayl ölçüsü — yalnız server qaytararsa
    fetchSize(m.url).then(b => {
      if (!b || currentMaterial !== m) return;
      const dl = $('#mdFacts');
      if (dl && !dl.querySelector('[data-size]')) dl.insertAdjacentHTML('beforeend', `<div class="md-fact" data-size><dt>${esc(t('mdSize'))}</dt><dd>${fmtSize(b)}</dd></div>`);
    });
  }

  function bindDetail() {
    document.addEventListener('click', e => {
      const more = e.target.closest('[data-related-toggle]');
      if (more) {
        const target = document.getElementById(more.getAttribute('aria-controls'));
        const entries = currentRelated[more.dataset.relatedToggle];
        if (!target || !entries) return;
        const expanded = more.getAttribute('aria-expanded') === 'true';
        target.hidden = expanded;
        more.setAttribute('aria-expanded', String(!expanded));
        more.textContent = expanded ? `${t('mdSeeAll')} (${entries.length})` : t('mdShowLess');
        if (!expanded) fetchRatings(entries.slice(RELATED_LIMIT));
        return;
      }
      if (e.target.closest('#mdMoreBtn')) { U.openSheet('sheet-mdmore', e.target.closest('#mdMoreBtn')); return; }
    });
    const sb = $('#mdSubjectBtn'), rb = $('#mdReportBtn'), sh = $('#mdShareBtn');
    if (sb) sb.addEventListener('click', () => {
      const m = currentMaterial; U.closeSheet();
      if (m) U.go(m.kind === 'pdf' ? `/subject/${enc(m.subject)}` : '/materials');
    });
    if (rb) rb.addEventListener('click', () => { U.closeSheet(); reportCurrent(); });
    if (sh) sh.addEventListener('click', async () => {
      const m = currentMaterial; U.closeSheet();
      if (!m) return;
      const url = new URL(publicMatHref(m), location.origin).href;
      try {
        if (navigator.share) { await navigator.share({ title: m.name, url }); return; }
        await navigator.clipboard.writeText(url);
        U.toast(t('linkCopied'));
      } catch (e) { /* istifadəçi ləğv etdi */ }
    });
  }
  function reportCurrent() {
    const m = currentMaterial;
    if (m && typeof openReportModal === 'function') openReportModal(m.subject || t('extraMaterial'), m.course, m);
  }

  // ── Kurslar marşrutu ────────────────────────────────────────
  U.showCoursesRoute = function (r, prev) {
    U.currentMaterialTitle = null;
    switch (r.view) {
      case 'entry':
        // Parametrsiz #/courses: Kurslar "Fənlər üzrə" ilə açılır (köhnə linklər və bookmark-lar üçün)
        U.go('/materials', { replace: true });
        return;
      case 'materials': {
        const q = r.query || {};
        const hasQuery = q.q != null || q.course != null || q.fav != null;
        if (hasQuery) {
          resetState();
          if (q.q) S.q = q.q;
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
        showSubjects(r.course);
        break;
      case 'subjects':
        showSubjects(r.course);
        break;
      case 'pdfs':
        if (!getSubjectCatalog()[r.subject]) { U.go('/materials', { replace: true }); return; }
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
    else if (['home', 'subjects'].includes(r.view)) {
      const heading = $('#bc-course'); if (heading) heading.textContent = currentCourse||t('navCourses');
      renderSubjects();
      if ($('#tab-extras-btn')?.classList.contains('active')) renderExtras();
      if ($('#tab-favorites-btn')?.classList.contains('active')) renderFavorites();
    }
    else if (r.view === 'material') renderMaterialDetail(r);
    else if (r.view === 'pdfs') showPdfs(r.course, r.subject);
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
