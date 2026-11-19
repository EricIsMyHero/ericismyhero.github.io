(function () {
  'use strict';

  const U = window.UNEC;
  const { $, $$, esc, ic, tr, normAz, LS, NAV } = U;
  const root = $('#main-functions');
  const search = $('#functionsSearch', root);
  const filters = $$('.functions-filters button', root);
  const quick = $('#functionsQuick', root);
  const quickList = $('#functionsQuickList', root);
  const list = $('#functionsList', root);
  const empty = $('#functionsEmpty', root);
  const usageKey = 'unec_function_usage';
  let category = '';

  const groups = [
    { key: 'functionsAcademicGroup', items: [
      ['tests', ['academic']],
      ['gpa', ['academic', 'tools']],
      ['requests', ['academic']],
      ['curriculum', ['academic', 'planning']],
    ] },
    { key: 'functionsResourcesGroup', items: [
      ['compass', ['tools', 'career']],
      ['career', ['career']],
      ['timer', ['tools', 'planning']],
      ['dashboard', ['tools', 'planning']],
    ] },
    { key: 'functionsOtherGroup', compact: true, items: [
      ['courses', ['academic']],
      ['favorites', ['academic', 'tools']],
      ['support', []],
    ] },
  ];
  const entries = new Map(NAV.map(item => [item.id, item]));
  entries.set('favorites', { id: 'favorites', key: 'moreFavorites', icon: 'star', route: '/materials/all?fav=1', fc: 'plan' });
  const defaults = ['compass', 'career', 'tests', 'gpa'];
  const allIds = [...new Set(defaults.concat(groups.flatMap(group => group.items.map(([id]) => id))))];

  function card(id) {
    const item = entries.get(id);
    const tone = item.fc ? ` style="--function-tone:var(--fc-${item.fc},var(--accent))"` : '';
    return `<a class="function-card" href="#${esc(item.route)}" data-function-id="${id}"${tone}>
      <span class="function-icon">${ic(item.icon)}</span>
      <span class="function-name">${esc(tr(item.key))}</span>
    </a>`;
  }

  function usage() {
    const counts = LS.getJSON(usageKey, {});
    return Object.fromEntries(allIds.map(id => [id, Number.isSafeInteger(counts[id]) && counts[id] > 0 ? counts[id] : 0]));
  }

  function render() {
    const terms = normAz(search.value).split(' ').filter(Boolean);
    const fullView = !category && !terms.length;
    quick.hidden = !fullView;
    if (fullView) {
      const counts = usage();
      quickList.innerHTML = [...allIds].sort((a, b) => counts[b] - counts[a]).slice(0, 4).map(card).join('');
    }

    list.innerHTML = groups.map(group => {
      const cards = group.items.filter(([id, tags]) => {
        if (category && !tags.includes(category)) return false;
        const { key, desc } = entries.get(id);
        const searchable = normAz([tr(key), desc ? tr(desc) : ''].join(' '));
        return terms.every(term => searchable.includes(term));
      }).map(([id]) => card(id)).join('');
      if (!cards) return '';
      return `<section class="functions-group" aria-labelledby="${group.key}">
        <h3 id="${group.key}">${esc(tr(group.key))}</h3>
        <div class="functions-grid${group.compact ? ' functions-grid--compact' : ''}">${cards}</div>
      </section>`;
    }).join('');
    empty.textContent = list.childElementCount ? '' : tr('functionsEmpty');
  }

  search.addEventListener('input', render);
  filters.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.functionFilter;
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    render();
  }));
  root.addEventListener('click', event => {
    const card = event.target.closest('[data-function-id]');
    if (card && event.button === 0 && !event.defaultPrevented) {
      const id = card.dataset.functionId;
      const counts = usage();
      counts[id] = Math.min(counts[id] + 1, Number.MAX_SAFE_INTEGER);
      LS.setJSON(usageKey, counts);
    }
  });
  window.addEventListener('unec:langchange', () => {
    if (U.route?.tab === 'functions') render();
  });
  U.renderFunctionDirectory = render;
})();
