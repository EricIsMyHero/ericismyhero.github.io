(function () {
  'use strict';

  const U = window.UNEC;
  const { $, esc, tr } = U;
  const endpoint = (typeof BACKEND_URL === 'string' ? BACKEND_URL : 'https://ericismyhero-github-io.vercel.app') +
    '/api/admin-data?section=career';
  const typeLabels = { internship: 'careerInternship', volunteer: 'careerVolunteer', training: 'careerTraining' };
  const categoryLabels = { bank: 'careerBank', finance: 'careerFinance', audit: 'careerAudit', it: 'careerIT', other: 'careerOther' };
  const types = $('#careerType');
  const categories = $('#careerCategory');
  const status = $('#careerStatus');
  const results = $('#careerResults');
  const retry = $('#careerRetry');
  let rows = [];
  let loading = false;
  let failed = false;

  function card(row) {
    let url;
    try { url = new URL(row.applyUrl); } catch { return ''; }
    if (url.protocol !== 'https:' || url.username || url.password) return '';
    if (!Object.hasOwn(typeLabels, row.type) || !Object.hasOwn(categoryLabels, row.category)) return '';
    const type = tr(typeLabels[row.type]);
    const category = tr(categoryLabels[row.category]);
    const deadline = row.deadline
      ? `<time datetime="${esc(row.deadline)}">${esc(row.deadline.split('-').reverse().join('.'))}</time>`
      : esc(tr('careerNoDeadline'));
    return `<article class="compass-card">
      <div class="compass-card-copy">
        <p class="compass-category-label">${esc(type)} · ${esc(category)}</p>
        <h2>${esc(row.title)}</h2>
        <p>${esc(row.company)}</p>
        ${row.schedule ? `<p>${esc(tr('careerSchedule'))} · ${esc(row.schedule)}</p>` : ''}
        ${row.location ? `<p>${esc(tr('careerLocation'))} · ${esc(row.location)}</p>` : ''}
        <p>${esc(tr('careerDeadline'))} · ${deadline}</p>
        ${row.description ? `<details class="career-details"><summary>${esc(tr('careerDetails'))}</summary>
          <p>${esc(row.description)}</p></details>` : ''}
        <p><a href="${esc(url.href)}" target="_blank" rel="noopener noreferrer">${esc(tr('careerApply'))}</a></p>
      </div>
    </article>`;
  }

  function render() {
    const today = new Date(Date.now() + 4 * 3600_000).toISOString().slice(0, 10);
    const cards = !loading && !failed
      ? rows.filter(row => (!row.deadline || row.deadline >= today) &&
        (!types.value || row.type === types.value) &&
        (!categories.value || row.category === categories.value)).map(card).join('')
      : '';
    results.innerHTML = cards;
    const message = loading ? 'careerLoading' : failed ? 'careerError' : cards ? '' : 'careerEmpty';
    status.textContent = message ? tr(message) : '';
    retry.hidden = !failed;
  }

  async function load() {
    if (loading) return;
    loading = true;
    failed = false;
    render();
    try {
      const response = await fetch(endpoint, { signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error('career_unavailable');
      const data = await response.json();
      if (!Array.isArray(data.opportunities)) throw new Error('invalid_response');
      rows = data.opportunities;
    } catch {
      failed = true;
    } finally {
      loading = false;
      render();
    }
  }

  types.addEventListener('change', render);
  categories.addEventListener('change', render);
  retry.addEventListener('click', load);
  window.addEventListener('unec:langchange', render);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && U.route?.tab === 'career') load();
  });
  U.loadCareer = load;
})();
