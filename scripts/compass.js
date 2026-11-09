// Tələbə Kompası — public guidance articles, local bookmarks and accessible reading.
(function () {
  'use strict';
  const U = window.UNEC;
  const KEY = 'unec_compass_saved';
  const categoryOrder = ['admissions', 'first-year', 'academic', 'finance', 'campuses', 'documents', 'work', 'campus', 'exchange', 'rights', 'military'];
  const categories = {
    admissions: { az: 'Qəbul və qeydiyyat', en: 'Admission and registration', icon: 'graduation-cap' },
    'first-year': { az: 'Universitetə ilk addım', en: 'Starting university', icon: 'book-open' },
    academic: { az: 'Tədris qaydaları', en: 'Academic rules', icon: 'book-open' },
    campuses: { az: 'UNEC korpusları', en: 'UNEC campuses', icon: 'landmark' },
    documents: { az: 'Sənədlər və müraciətlər', en: 'Documents and applications', icon: 'file-text' },
    finance: { az: 'Pul və təhsil xərcləri', en: 'Money and study costs', icon: 'wallet' },
    work: { az: 'Təhsil və iş', en: 'Study and work', icon: 'briefcase' },
    campus: { az: 'Kampus həyatı', en: 'Campus life', icon: 'landmark' },
    exchange: { az: 'Xaricdə təhsil', en: 'Studying abroad', icon: 'globe' },
    rights: { az: 'Tələbə hüquqları', en: 'Student rights', icon: 'shield-check' },
    military: { az: 'Hərbi xidmətdən möhlət', en: 'Education and military deferment', icon: 'shield-check' }
  };
  const labels = {
    az: {
      title: 'Tələbə Kompası', intro: 'Qəbuldan tələbə həyatına: lazım olan addımları bir yerdə tap.',
      all: 'Hamısı', students: 'Tələbə', applicants: 'Abituriyent', saved: 'Saxlanılanlar',
      search: 'Mövzu axtar', placeholder: 'Təqaüd, yay məktəbi…', category: 'Mövzu', allCategories: 'Bütün mövzular',
      count: '{n} məqalə', empty: 'Uyğun məqalə tapılmadı', emptySub: 'Başqa sözlə axtar və ya filtrləri dəyiş.',
      emptySaved: 'Hələ məqalə saxlamamısan', emptySavedSub: 'Məqalənin yanındakı ulduza basaraq onu sonra oxumaq üçün saxla.',
      clear: 'Filtrləri təmizlə', clearSearch: 'Axtarışı təmizlə', save: 'Məqaləni saxla', unsave: 'Saxlanılanlardan çıxar',
      savedMessage: 'Məqalə saxlanıldı.', removedMessage: 'Məqalə saxlanılanlardan çıxarıldı.', storageError: 'Seçim saxlanılmadı. Brauzerin yaddaş icazəsini yoxla.',
      minutes: '{n} dəqiqəlik oxu', updated: 'Yenilənib', toc: 'Bu məqalədə', steps: 'Növbəti addımlar', sources: 'Rəsmi mənbələr',
      note: 'Tarix və şərtlər dəyişə bilər. Müraciətdən əvvəl keçidlərdəki rəsmi elanı və sənəd siyahısını yoxla.',
      related: 'Bunlar da faydalı ola bilər', back: 'Bütün məqalələr', share: 'Paylaş', copied: 'Məqalə keçidi kopyalandı.', copyError: 'Keçid kopyalanmadı. Brauzerin paylaşma imkanından istifadə et.',
      missing: 'Məqalə tapılmadı', missingSub: 'Keçid dəyişmiş ola bilər. Digər mövzulara baxa bilərsən.',
      loading: 'Məqalələr hazırlanır', loadingSub: 'Bir qədər sonra yenidən yoxla.',
      suggestion: 'Axtardığın mövzu yoxdur?', suggestLink: 'Mövzu təklif et', suggestSubject: 'Tələbə Kompası üçün mövzu təklifi',
      local: 'Saxlanılan məqalələr bu brauzerdə yadda qalır.', listAria: 'Məqalə filtrləri', external: 'yeni pəncərədə açılır'
    },
    en: {
      title: 'Student Compass', intro: 'From admission to student life: find your next steps in one place.',
      all: 'All', students: 'Students', applicants: 'Applicants', saved: 'Saved',
      search: 'Search topics', placeholder: 'Stipends, summer school…', category: 'Topic', allCategories: 'All topics',
      count: '{n} articles', empty: 'No matching articles', emptySub: 'Try another search or change the filters.',
      emptySaved: 'No saved articles yet', emptySavedSub: 'Use the star beside an article to keep it for later.',
      clear: 'Clear filters', clearSearch: 'Clear search', save: 'Save article', unsave: 'Remove saved article',
      savedMessage: 'Article saved.', removedMessage: 'Article removed from saved.', storageError: 'Could not save your choice. Check your browser storage settings.',
      minutes: '{n} minute read', updated: 'Updated', toc: 'In this article', steps: 'Next steps', sources: 'Official sources',
      note: 'Dates and requirements can change. Check the linked official announcement and document list before applying.',
      related: 'You may also find these useful', back: 'All articles', share: 'Share', copied: 'Article link copied.', copyError: 'Could not copy the link. Try your browser’s sharing option.',
      missing: 'Article not found', missingSub: 'The link may have changed. You can explore the other topics.',
      loading: 'Articles are being prepared', loadingSub: 'Please check again later.',
      suggestion: 'Can’t find your topic?', suggestLink: 'Suggest a topic', suggestSubject: 'Topic suggestion for Student Compass',
      local: 'Saved articles stay in this browser.', listAria: 'Article filters', external: 'opens in a new window'
    }
  };
  const language = () => typeof lang !== 'undefined' && lang === 'en' ? 'en' : 'az';
  const l = key => labels[language()][key];
  const e = U.esc;
  const text = value => typeof value === 'string' ? value : String(value?.[language()] || value?.az || value?.en || '');
  const data = () => Array.isArray(window.UNEC_COMPASS_DATA) ? window.UNEC_COMPASS_DATA : [];
  const category = id => categories[id] || { az: id, en: id, icon: 'book-open' };
  const icon = name => U.ic(/^[a-z0-9-]+$/.test(String(name)) ? name : 'book-open');
  const date = value => {
    const parsed = new Date(value + 'T00:00:00Z');
    if (!Number.isFinite(+parsed)) return String(value || '');
    const months = language() === 'az'
      ? ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${parsed.getUTCDate()} ${months[parsed.getUTCMonth()]} ${parsed.getUTCFullYear()}`;
  };
  let state = { q: '', audience: 'all', category: 'all', saved: false };
  let lastList = '/compass';
  let lastRender = null;
  function savedIds() {
    try {
      const values = JSON.parse(localStorage.getItem(KEY) || '[]');
      return new Set(Array.isArray(values) ? values.filter(value => typeof value === 'string') : []);
    } catch (_) { return new Set(); }
  }
  function normalizeState(query = {}) {
    return { q: String(query.q || '').slice(0, 200), audience: ['student', 'applicant'].includes(query.audience) ? query.audience : 'all',
      category: Object.hasOwn(categories, query.category) ? query.category : 'all', saved: query.saved === '1' || query.saved === true };
  }
  function queryFor(value) {
    const query = new URLSearchParams();
    if (value.q.trim()) query.set('q', value.q);
    if (value.audience !== 'all') query.set('audience', value.audience);
    if (value.category !== 'all') query.set('category', value.category);
    if (value.saved) query.set('saved', '1');
    const string = query.toString(); return string ? '?' + string : '';
  }
  const articlePath = article => '/compass/' + encodeURIComponent(article.id) + queryFor(state);
  function syncUrl() {
    lastList = '/compass' + queryFor(state);
    history.replaceState(history.state, '', '#' + lastList);
    // The shell keeps a route object for language changes and back navigation.
    if (U.route?.tab === 'compass' && U.route.view !== 'article') {
      U.route.query = Object.fromEntries(new URLSearchParams(queryFor(state).slice(1)));
      U.route.hash = '#' + lastList;
    }
  }
  function searchable(article) {
    const values = [article.title?.az, article.title?.en, article.summary?.az, article.summary?.en,
      category(article.category).az, category(article.category).en];
    for (const section of article.sections || []) {
      values.push(section.heading?.az, section.heading?.en);
      for (const paragraph of [...(section.paragraphs || []), ...(section.bullets || [])]) values.push(paragraph?.az, paragraph?.en);
      for (const cell of [...(section.table?.headers || []), ...(section.table?.rows || []).flat()]) values.push(cell?.az, cell?.en);
    }
    for (const step of article.steps || []) values.push(step?.az, step?.en);
    return U.normAz(values.filter(Boolean).join(' '));
  }
  function searchArticles(query) {
    const terms = U.normAz(query).split(' ').filter(Boolean);
    return data().filter(article => terms.every(term => searchable(article).includes(term)));
  }
  function saveButton(article, compact) {
    const saved = savedIds().has(article.id), label = l(saved ? 'unsave' : 'save');
    return `<button class="compass-save ${compact ? 'compass-save--compact' : ''}" type="button" data-compass-save="${e(article.id)}" aria-label="${e(label + ': ' + text(article.title))}" aria-pressed="${saved}">${icon('star')}${compact ? '' : `<span>${e(label)}</span>`}</button>`;
  }
  function card(article) {
    return `<article class="compass-card"><a class="compass-card-link" href="#${e(articlePath(article))}"><div class="compass-card-copy"><h3>${e(text(article.title))}</h3><p>${e(text(article.summary))}</p></div>${icon('chevron-right')}</a><div class="compass-card-footer"><small>${e(l('minutes').replace('{n}', article.readMinutes))}</small>${saveButton(article, true)}</div></article>`;
  }
  function visibleArticles() {
    const saved = savedIds();
    return searchArticles(state.q).filter(article =>
      (state.audience === 'all' || (article.audience || []).includes(state.audience)) &&
      (state.category === 'all' || article.category === state.category) && (!state.saved || saved.has(article.id)));
  }
  function results() {
    const root = document.getElementById('compassRoot'); if (!root) return;
    const matches = visibleArticles(), box = root.querySelector('#compassResults'), count = root.querySelector('#compassResultCount');
    if (!box || !count) return;
    count.textContent = language() === 'en' && matches.length === 1 ? '1 article' : l('count').replace('{n}', matches.length);
    root.querySelectorAll('[data-compass-audience]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.compassAudience === state.audience)));
    const savedButton = root.querySelector('[data-compass-saved-filter]');
    if (savedButton) savedButton.setAttribute('aria-pressed', String(state.saved));
    const noSaved = state.saved && savedIds().size === 0;
    if (!matches.length) {
      box.innerHTML = `<div class="compass-empty"><span class="compass-empty-icon">${icon(noSaved ? 'star' : 'search')}</span><h2>${e(l(noSaved ? 'emptySaved' : 'empty'))}</h2><p>${e(l(noSaved ? 'emptySavedSub' : 'emptySub'))}</p><button class="btn btn--secondary" type="button" data-compass-reset>${e(l('clear'))}</button></div>`;
      return;
    }
    box.innerHTML = categoryOrder.concat([...new Set(matches.map(article => article.category))].filter(id => !categoryOrder.includes(id)))
      .map(id => {
        const articles = matches.filter(article => article.category === id).sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
        if (!articles.length) return '';
        return `<section class="compass-topic" aria-labelledby="compass-category-${e(id)}"><h2 id="compass-category-${e(id)}">${icon(category(id).icon)}${e(text(category(id)))}</h2><div class="compass-card-grid">${articles.map(card).join('')}</div></section>`;
      }).join('');
  }
  function list(root, route) {
    state = normalizeState(route.query); lastList = '/compass' + queryFor(state);
    U.currentCompassTitle = l('title');
    const categoriesPresent = categoryOrder.filter(id => data().some(article => article.category === id));
    root.innerHTML = `<header class="compass-hero"><span class="compass-hero-icon">${icon('compass')}</span><div><h1 id="compassHeading" tabindex="-1">${e(l('title'))}</h1><p>${e(l('intro'))}</p></div></header>
      <section class="compass-controls" aria-label="${e(l('listAria'))}">
        <div class="compass-audience" role="group" aria-label="${e(l('listAria'))}">${[['all', 'all'], ['student', 'students'], ['applicant', 'applicants']].map(([value, label]) => `<button class="chip" type="button" data-compass-audience="${value}" aria-pressed="${value === state.audience}">${e(l(label))}</button>`).join('')}</div>
        <label class="compass-search-label" for="compassSearch">${e(l('search'))}</label>
        <div class="compass-search-row"><div class="compass-search-field">${icon('search')}<input id="compassSearch" type="search" maxlength="200" value="${e(state.q)}" placeholder="${e(l('placeholder'))}" autocomplete="off" aria-controls="compassResults"><button class="icon-btn" type="button" data-compass-clear-search aria-label="${e(l('clearSearch'))}">${icon('x')}</button></div></div>
        <div class="compass-filter-row"><label class="compass-category-select" for="compassCategory"><span>${e(l('category'))}</span><select id="compassCategory" aria-controls="compassResults"><option value="all">${e(l('allCategories'))}</option>${categoriesPresent.map(id => `<option value="${id}" ${state.category === id ? 'selected' : ''}>${e(text(category(id)))}</option>`).join('')}</select></label><button class="compass-saved-filter" type="button" data-compass-saved-filter aria-pressed="${state.saved}">${icon('star')}<span>${e(l('saved'))}</span></button></div>
      </section><p class="compass-result-count" id="compassResultCount" role="status" aria-live="polite"></p><div id="compassResults"></div>
      <footer class="compass-library-footer"><p>${e(l('local'))}</p><p>${e(l('suggestion'))} <a href="mailto:unecstudentshub@gmail.com?subject=${encodeURIComponent(l('suggestSubject'))}">${e(l('suggestLink'))}</a></p></footer>`;
    results();
  }
  function sourceLink(source) {
    try {
      const url = new URL(source.url);
      if (url.protocol !== 'https:' || url.username || url.password) return '';
      return `<li><a href="${e(url.href)}" target="_blank" rel="noopener noreferrer"><span>${e(text(source.title))}</span>${icon('external-link')}<span class="compass-sr-only"> (${e(l('external'))})</span></a></li>`;
    } catch (_) { return ''; }
  }
  function sectionTable(table) {
    if (!table) return '';
    return `<div class="compass-table-wrap"><table><thead><tr>${table.headers.map(h => `<th scope="col">${e(text(h))}</th>`).join('')}</tr></thead><tbody>${table.rows.map(row => `<tr>${row.map(cell => `<td>${e(text(cell))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  function articleView(root, route) {
    state = normalizeState(route.query); lastList = '/compass' + queryFor(state);
    const article = data().find(item => item.id === route.id);
    if (!article) {
      U.currentCompassTitle = l('missing');
      root.innerHTML = `<div class="compass-empty"><span class="compass-empty-icon">${icon('book-open')}</span><h1 id="compassHeading" tabindex="-1">${e(l('missing'))}</h1><p>${e(l('missingSub'))}</p><a class="btn btn--secondary" href="#${e(lastList)}">${e(l('back'))}</a></div>`;
      return;
    }
    U.currentCompassTitle = text(article.title);
    const related = data().filter(other => other.id !== article.id && (other.audience || []).some(value => (article.audience || []).includes(value)))
      .sort((a, b) => Number(b.category === article.category) - Number(a.category === article.category) || Number(!!b.featured) - Number(!!a.featured)).slice(0, 3);
    root.innerHTML = `<div class="compass-reading"><a class="compass-back" href="#${e(lastList)}">${icon('arrow-left')}<span>${e(l('back'))}</span></a>
      <article class="compass-article"><header class="compass-article-header"><p class="compass-category-label">${icon(category(article.category).icon)}${e(text(category(article.category)))}</p><h1 id="compassHeading" tabindex="-1">${e(text(article.title))}</h1><p class="compass-lead">${e(text(article.summary))}</p><div class="compass-article-meta"><span>${e(l('minutes').replace('{n}', article.readMinutes))}</span><span>${e(l('updated'))}: <time datetime="${e(article.updatedAt)}">${e(date(article.updatedAt))}</time></span></div>
      <div class="compass-article-actions">${saveButton(article, false)}<button class="compass-share" type="button" data-compass-share="${e(article.id)}">${icon('external-link')}<span>${e(l('share'))}</span></button></div></header>
      ${article.sections?.length > 1 ? `<details class="compass-toc"><summary>${e(l('toc'))}${icon('chevron-down')}</summary><ol>${article.sections.map((section, index) => `<li><button type="button" data-compass-section="${index}">${e(text(section.heading))}</button></li>`).join('')}</ol></details>` : ''}
      <div class="compass-article-body">${(article.sections || []).map((section, index) => `<section aria-labelledby="compass-section-${index}"><h2 id="compass-section-${index}" tabindex="-1">${e(text(section.heading))}</h2>${(section.paragraphs || []).map(value => `<p>${e(text(value))}</p>`).join('')}${section.bullets?.length ? `<ul>${section.bullets.map(value => `<li>${e(text(value))}</li>`).join('')}</ul>` : ''}${sectionTable(section.table)}</section>`).join('')}</div>
      ${article.steps?.length ? `<section class="compass-steps" aria-labelledby="compassStepsTitle"><h2 id="compassStepsTitle">${icon('clipboard-check')}${e(l('steps'))}</h2><ol>${article.steps.map(value => `<li>${e(text(value))}</li>`).join('')}</ol></section>` : ''}
      <section class="compass-sources" aria-labelledby="compassSourcesTitle"><h2 id="compassSourcesTitle">${e(l('sources'))}</h2><ul>${(article.sources || []).map(sourceLink).join('')}</ul><p>${e(l('note'))}</p></section></article>
      ${related.length ? `<section class="compass-related" aria-labelledby="compassRelatedTitle"><h2 id="compassRelatedTitle">${e(l('related'))}</h2><div class="compass-card-grid">${related.map(card).join('')}</div></section>` : ''}</div>`;
  }
  function render(route) {
    const root = document.getElementById('compassRoot'); if (!root) return;
    const key = route.view === 'article' ? 'article/' + route.id : 'list';
    if (!data().length) {
      U.currentCompassTitle = l('title');
      root.innerHTML = `<div class="compass-empty"><h1 id="compassHeading" tabindex="-1">${e(l('loading'))}</h1><p>${e(l('loadingSub'))}</p></div>`;
    } else if (route.view === 'article') articleView(root, route);
    else list(root, route);
    if (key !== lastRender) requestAnimationFrame(() => root.querySelector('#compassHeading')?.focus({ preventScroll: true }));
    lastRender = key;
  }
  function toggleSave(id) {
    const article = data().find(value => value.id === id); if (!article) return;
    const saved = savedIds(), wasSaved = saved.has(id);
    wasSaved ? saved.delete(id) : saved.add(id);
    try { localStorage.setItem(KEY, JSON.stringify([...saved])); }
    catch (_) { U.toast(l('storageError'), 'error'); return; }
    const root = document.getElementById('compassRoot');
    if (U.route?.view !== 'article') {
      const focused = document.activeElement?.dataset.compassSave === id;
      results();
      if (focused) (root?.querySelector(`[data-compass-save="${id}"]`) || root?.querySelector('[data-compass-save]') || root?.querySelector('[data-compass-reset]'))?.focus({ preventScroll: true });
    }
    else root?.querySelectorAll('[data-compass-save]').forEach(button => {
      const item = data().find(value => value.id === button.dataset.compassSave); if (!item) return;
      const selected = saved.has(item.id), label = l(selected ? 'unsave' : 'save');
      button.setAttribute('aria-pressed', String(selected)); button.setAttribute('aria-label', label + ': ' + text(item.title));
      const span = button.querySelector('span'); if (span) span.textContent = label;
    });
    U.toast(l(wasSaved ? 'removedMessage' : 'savedMessage'));
  }
  async function share(id) {
    const article = data().find(value => value.id === id); if (!article) return;
    const url = new URL('/compass/' + encodeURIComponent(id) + '/', location.origin).href;
    try {
      if (navigator.share) { await navigator.share({ title: text(article.title), url }); return; }
      await navigator.clipboard.writeText(url); U.toast(l('copied'));
    } catch (error) { if (error?.name !== 'AbortError') U.toast(l('copyError'), 'error'); }
  }
  document.addEventListener('input', event => {
    if (event.target.id !== 'compassSearch') return;
    state.q = event.target.value; syncUrl(); results();
  });
  document.addEventListener('change', event => {
    if (event.target.id !== 'compassCategory') return;
    state.category = event.target.value; syncUrl(); results();
  });
  document.addEventListener('click', event => {
    const target = event.target.closest('#compassRoot button'); if (!target) return;
    if (target.hasAttribute('data-compass-save')) { toggleSave(target.dataset.compassSave); return; }
    if (target.hasAttribute('data-compass-share')) { share(target.dataset.compassShare); return; }
    if (target.hasAttribute('data-compass-section')) {
      const index = Number(target.dataset.compassSection);
      if (!Number.isInteger(index) || index < 0) return;
      const section = document.getElementById('compass-section-' + index);
      section?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      section?.focus({ preventScroll: true }); return;
    }
    if (target.hasAttribute('data-compass-audience')) state.audience = target.dataset.compassAudience;
    else if (target.hasAttribute('data-compass-saved-filter')) state.saved = !state.saved;
    else if (target.hasAttribute('data-compass-clear-search')) { state.q = ''; const input = document.getElementById('compassSearch'); input.value = ''; input.focus(); }
    else if (target.hasAttribute('data-compass-reset')) {
      state = normalizeState(); document.getElementById('compassSearch').value = ''; document.getElementById('compassCategory').value = 'all';
      document.getElementById('compassSearch').focus();
    } else return;
    syncUrl(); results();
  });
  window.addEventListener('storage', event => {
    if (event.key === KEY && U.route?.tab === 'compass') render(U.route);
  });
  window.addEventListener('unec:routechange', event => { if (event.detail?.tab !== 'compass') lastRender = null; });
  window.addEventListener('unec:langchange', () => {
    if (U.route?.tab === 'compass') {
      render(U.route);
      document.title = U.currentCompassTitle + ' · UNEC Students Hub';
    }
  });
  Object.assign(U, { renderCompass: render, searchCompass: searchArticles, compassLabel: text });
})();
