// Presentation and form handling for the shared Firebase sign-in dialog.
(function () {
  'use strict';
  let mode = 'login', busy = false;
  const root = () => document.getElementById('authOverlay');
  const copy = () => {
    const keys = mode === 'register' ? ['authCreateTitle', 'authCreateSub'] : mode === 'reset' ? ['authResetTitle', 'authResetSub'] : ['authWelcome', 'authWelcomeSub'];
    document.getElementById('authDialogTitle').textContent = t(keys[0]);
    document.getElementById('authDialogDescription').textContent = t(keys[1]);
    root().querySelectorAll('[data-password-for]').forEach(button => {
      const shown = document.getElementById(button.dataset.passwordFor).type === 'text';
      button.textContent = t(shown ? 'authHidePassword' : 'authShowPassword');
      button.setAttribute('aria-label', button.textContent + ' · ' + t(button.dataset.passwordFor === 'reg-confirm' ? 'authConfirmPassword' : 'authPasswordLabel'));
    });
    if (busy) root().querySelectorAll('.auth-submit-btn').forEach(button => { button.textContent = t('authBusy'); });
  };
  function clearPasswords() {
    root().querySelectorAll('input[autocomplete*="password"]').forEach(input => { input.value = ''; input.type = 'password'; input.setCustomValidity(''); });
    root().querySelectorAll('[data-password-for]').forEach(button => button.setAttribute('aria-pressed', 'false'));
  }
  function clearStatus() { root().querySelectorAll('.auth-error').forEach(el => { el.textContent = ''; delete el.dataset.status; }); }
  function focus() { document.querySelector('#auth-panel-' + mode + ' input')?.focus({ preventScroll: true }); }
  function setMode(next) {
    if (busy) return;
    if (!['login', 'register', 'reset'].includes(next)) next = 'login';
    const email = document.querySelector('#auth-panel-' + mode + ' input[type=email]')?.value || '';
    mode = next; clearPasswords(); clearStatus();
    root().querySelector('.auth-modal').scrollTop = 0;
    root().querySelectorAll('.auth-panel').forEach(panel => panel.classList.toggle('hidden', panel.id !== 'auth-panel-' + mode));
    root().querySelectorAll('[data-auth-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.authMode === mode)));
    const targetEmail = document.querySelector('#auth-panel-' + mode + ' input[type=email]');
    if (email && !targetEmail.value) targetEmail.value = email;
    root().querySelectorAll('[data-autofocus]').forEach(input => input.removeAttribute('data-autofocus'));
    document.querySelector('#auth-panel-' + mode + ' input').setAttribute('data-autofocus', '');
    copy(); focus();
  }
  async function run(action) {
    if (busy) return;
    busy = true; clearStatus(); root().querySelectorAll('button:not(.auth-modal-close)').forEach(button => { button.disabled = true; });
    root().querySelector('.auth-modal').setAttribute('aria-busy', 'true'); copy();
    try { await action(); }
    catch (_) { _showAuthError(t('authGenericError')); }
    finally {
      busy = false; root().querySelectorAll('button').forEach(button => { button.disabled = false; });
      root().querySelector('.auth-modal').removeAttribute('aria-busy');
      root().querySelectorAll('.auth-submit-btn').forEach(button => { button.textContent = t(button.dataset.i18n); }); copy();
    }
  }
  async function submit(kind) {
    if (busy || kind !== mode) return;
    const form = document.getElementById('auth-form-' + kind);
    if (!form.reportValidity()) return;
    const email = form.querySelector('input[type=email]').value.trim();
    if (kind === 'reset') return run(() => sendPasswordReset(email));
    const prefix = kind === 'register' ? 'reg' : 'login';
    const password = document.getElementById(prefix + '-password').value;
    if (kind === 'register') {
      if (password.length < 8 || !/\p{Lu}/u.test(password) || !/\d/.test(password)) { _showAuthError(t('authPasswordInvalid')); return; }
      if (password !== document.getElementById('reg-confirm').value) { _showAuthError(t('authMismatch')); return; }
      const name = document.getElementById('reg-name').value.trim();
      if (!name) { document.getElementById('reg-name').focus(); return; }
      return run(() => signUpWithEmail(email, password, name));
    }
    return run(() => signInWithEmail(email, password));
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-password-for]'); if (!button) return;
    const input = document.getElementById(button.dataset.passwordFor), shown = input.type === 'password';
    input.type = shown ? 'text' : 'password'; button.setAttribute('aria-pressed', String(shown)); copy();
  });
  window.UNECAuth = { submit, setMode, focus, google: () => run(() => signInWithGoogle()), reset: () => { clearPasswords(); clearStatus(); root().querySelector('.auth-modal').scrollTop = 0; copy(); } };
  window.addEventListener('unec:langchange', () => { if (root()) { clearStatus(); copy(); } });
})();
