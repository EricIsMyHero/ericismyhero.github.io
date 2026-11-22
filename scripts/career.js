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

  function applyLink(value) {
    if (!value) return '';
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
    } catch { return ''; }
  }

  function card(row) {
    const link = applyLink(row.applyUrl);
    const type = Object.hasOwn(typeLabels, row.type) ? tr(typeLabels[row.type]) : '';
    const category = Object.hasOwn(categoryLabels, row.category) ? tr(categoryLabels[row.category]) : '';
    const details = [type, category].filter(Boolean).join(' · ');
    const deadline = row.deadline
      ? `<time datetime="${esc(row.deadline)}">${esc(row.deadline.split('-').reverse().join('.'))}</time>`
      : '';
    return `<article class="compass-card">
      <div class="compass-card-copy">
        ${details ? `<p class="compass-category-label">${esc(details)}</p>` : ''}
        <h2>${esc(row.title || row.company || tr('careerUntitled'))}</h2>
        ${row.title && row.company ? `<p>${esc(row.company)}</p>` : ''}
        ${row.schedule ? `<p>${esc(tr('careerSchedule'))} · ${esc(row.schedule)}</p>` : ''}
        ${row.location ? `<p>${esc(tr('careerLocation'))} · ${esc(row.location)}</p>` : ''}
        ${deadline ? `<p>${esc(tr('careerDeadline'))} · ${deadline}</p>` : ''}
        ${row.description ? `<details class="career-details"><summary>${esc(tr('careerDetails'))}</summary>
          <p>${esc(row.description)}</p></details>` : ''}
        ${link ? `<p><a href="${esc(link)}" target="_blank" rel="noopener noreferrer">${esc(tr('careerApply'))}</a></p>` : ''}
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
