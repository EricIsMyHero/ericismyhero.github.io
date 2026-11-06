// Shared dialogs, local curriculum progress and offline status.
(function () {
  'use strict';
  const U = window.UNEC;
  const labels = {
    az: { done: 'Tamamladım', progress: 'Tamamlanan kreditlər', local: 'İrəliləyiş bu cihazda saxlanılır.', offline: 'İnternet yoxdur. Saxlanılmış plan və əsas alətlərdən istifadə edə bilərsən; PDF-lər və hesab xidmətləri internet tələb edir.' },
    en: { done: 'Completed', progress: 'Completed credits', local: 'Progress is stored on this device.', offline: 'You are offline. Saved plans and core tools remain available; PDFs and account services require an internet connection.' }
  };
  const txt = () => labels[lang] || labels.az;
  const userKey = () => typeof getCurrentUser === 'function' && getCurrentUser() ? getCurrentUser().uid : 'guest';
  const key = () => 'unec_completed_' + userKey();
  function completions() { try { const a = JSON.parse(localStorage.getItem(key()) || '[]'); return new Set(Array.isArray(a) ? a : []); } catch (_) { return new Set(); } }
  const itemKey = (sem, subject) => `${getSavedSpecialty()}|${sem}|${subject.code || subject.name}`;
  window.renderCurriculumProgress = function () {
    const plan = CURRICULUM_DATA[getSavedSpecialty()];
    const box = document.getElementById('currCompletionSummary');
    if (!plan || !box) return;
    const done = completions(); let total = 0, credits = 0;
    for (let sem = 1; sem <= 8; sem++) for (const subject of plan['semester' + sem] || []) {
      total += subject.credit; if (done.has(itemKey(sem, subject))) credits += subject.credit;
    }
    box.innerHTML = `<b>${U.esc(txt().progress)}: ${credits} / ${total}</b><progress value="${credits}" max="${total || 1}" aria-label="${U.esc(txt().progress)}"></progress><small>${U.esc(txt().local)}</small>`;
  };
  window.toggleCurriculumCompleted = function (sem, index, checked) {
    const subject = CURRICULUM_DATA[getSavedSpecialty()]?.['semester' + sem]?.[index];
    if (!subject) return;
    const done = completions(), id = itemKey(sem, subject);
    checked ? done.add(id) : done.delete(id);
    try { localStorage.setItem(key(), JSON.stringify([...done])); }
    catch (_) { U.toast(lang === 'en' ? 'Could not save progress.' : 'İrəliləyiş saxlanıla bilmədi.', 'error'); }
    renderCurriculumProgress();
  };
  const render = window.renderSemesterTable;
  window.renderSemesterTable = function (semKey, subjects) {
    const count = render(semKey, subjects), done = completions(), sem = Number(semKey.slice(1));
    document.querySelectorAll(`#curr-tbody-${semKey} tr[data-curr-index]`).forEach(row => {
      const index = Number(row.dataset.currIndex), subject = subjects[index];
      if (!subject) return;
      row.querySelector('.curr-td-name').insertAdjacentHTML('beforeend', `<label class="curr-complete-label"><input type="checkbox" ${done.has(itemKey(sem, subject)) ? 'checked' : ''} onchange="toggleCurriculumCompleted(${sem},${index},this.checked)"> ${U.esc(txt().done)}</label>`);
    });
    renderCurriculumProgress(); return count;
  };

  // Adapt legacy overlays to the same focus trap and focus restoration as sheets.
  let current = null;
  function open(id) {
    const el = document.getElementById(id); if (!el) return;
    if (current) U.closeAllLayers();
    el.classList.remove('hidden'); el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    const heading = el.querySelector('h2,.auth-title,.qr-pay-modal-title,.quiz-results-title');
    if (heading) { if (!heading.id) heading.id = id + '-title'; el.setAttribute('aria-labelledby', heading.id); }
    const siblings = [...document.body.children].filter(node => node !== el && !node.inert);
    U.openLayer(el, null, document.activeElement, () => { el.classList.add('hidden'); siblings.forEach(node => { node.inert = false; }); current = null; });
    siblings.forEach(node => { node.inert = true; }); current = id;
  }
  const close = id => { if (current === id) U.closeLayer(); else document.getElementById(id)?.classList.add('hidden'); };
  for (const [id, opener, closer] of [
    ['thanksOverlay', 'openThanks', 'closeThanks'], ['aboutOverlay', 'openAboutModal', 'closeAboutModal'],
    ['termsOverlay', 'openTermsModal', 'closeTermsModal'], ['privacyOverlay', 'openPrivacyModal', 'closePrivacyModal'],
    ['easterOverlay', 'openEaster', 'closeEaster'], ['reportOverlay', 'openReportModal', 'closeReportModal'],
    ['premiumOverlay', 'openPremiumModal', 'closePremiumModal'], ['qrPayOverlay', 'openQRModal', 'closeQRModal'],
    ['quizResultsOverlay', 'openQuizResultsModal', 'closeQuizResultsModal']
  ]) {
    const previous = window[opener];
    window[opener] = function (...args) {
      const result = previous(...args);
      if (!document.getElementById(id)?.classList.contains('hidden')) open(id);
      return result;
    };
    window[closer] = () => close(id);
  }
  const auth = window.openAuthModal, hideAuth = window._hideAuthModal;
  window.openAuthModal = function (...args) { auth(...args); open('authOverlay'); };
  window._hideAuthModal = () => { close('authOverlay'); hideAuth(); };
  document.addEventListener('click', event => {
    if (current === 'authOverlay' && (event.target.id === 'authOverlay' || event.target.closest('#authOverlay .auth-modal-close'))) {
      event.preventDefault(); event.stopImmediatePropagation(); close('authOverlay');
    }
  }, true);
  function refresh() {
    renderCurriculumProgress();
    document.querySelectorAll('.thanks-modal-close,.auth-modal-close,.qr-pay-modal-close,.quiz-results-close').forEach(button => button.setAttribute('aria-label', t('btnClose')));
    const status = document.getElementById('offlineStatus');
    if (status) { status.hidden = navigator.onLine; status.textContent = txt().offline; }
  }
  window.addEventListener('online', refresh); window.addEventListener('offline', refresh);
  window.addEventListener('unec:langchange', refresh);
  window.addEventListener('unec:authchange', () => {
    if (U.route?.tab === 'curriculum' && getSavedSpecialty()) selectSpecialty(getSavedSpecialty(), { keepScroll: true });
    refresh();
  });
  document.addEventListener('DOMContentLoaded', () => {
    refresh();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(() => {});
  });
})();
