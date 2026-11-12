// Shared dialogs and offline status.
(function () {
  'use strict';
  const U = window.UNEC;
  const labels = {
    az: { offline: 'İnternet yoxdur. Saxlanılmış plan və əsas alətlərdən istifadə edə bilərsən; PDF-lər və hesab xidmətləri internet tələb edir.' },
    en: { offline: 'You are offline. Saved plans and core tools remain available; PDFs and account services require an internet connection.' }
  };
  const txt = () => labels[lang] || labels.az;
  // Adapt legacy overlays to the same focus trap and focus restoration as sheets.
  let current = null;
  function open(id, opener) {
    const el = document.getElementById(id); if (!el) return;
    if (current) U.closeAllLayers();
    el.classList.remove('hidden'); el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    const heading = el.querySelector('h2,.auth-title,.qr-pay-modal-title,.quiz-results-title');
    if (heading) { if (!heading.id) heading.id = id + '-title'; el.setAttribute('aria-labelledby', heading.id); }
    const siblings = [...document.body.children].filter(node => node !== el && !node.inert);
    U.openLayer(el, null, opener || document.activeElement, () => { if (id === 'authOverlay') window.UNECAuth?.reset(); el.classList.add('hidden'); siblings.forEach(node => { node.inert = false; }); current = null; });
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
  window.openAuthModal = function (...args) { const opener = document.activeElement; auth(...args); open('authOverlay', opener); };
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
    refresh();
  });
  document.addEventListener('DOMContentLoaded', () => {
    refresh();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(() => {});
  });
})();
