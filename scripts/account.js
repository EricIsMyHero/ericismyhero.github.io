// Export only explicitly selected local data, never Firebase SDK storage or tokens.
(function () {
  'use strict';
  const U = window.UNEC, endpoint = 'https://ericismyhero-github-io.vercel.app/api/push';
  const copy = {
    az: { title: 'Hesab məlumatları', export: 'Məlumatlarımı endir', remove: 'Hesabımı sil', cancel: 'Ləğv et', password: 'Cari şifrə',
      hint: 'Profil və şəxsi təhsil qeydlərini JSON kimi endirə bilərsən. Açıq yazışmalar bu surətə daxil deyil.',
      warning: 'Hesabın və şəxsi təhsil qeydlərin geri qaytarılmadan silinəcək. Öz mesajların və əlavələrin silinəcək, digər iştirakçıların yazışması qalacaq. Anonim reytinqlər və əməliyyat qeydləri saxlanıla bilər. Əvvəl məlumatlarını endirə bilərsən. Davam etmək üçün yenidən giriş tələb olunur.',
      busy: 'Silinir… Bu pəncərəni açıq saxla.', error: 'Əməliyyat tamamlanmadı. Bağlantını və giriş məlumatlarını yoxlayıb yenidən cəhd et. Başlamış silmə növbəti cəhddə davam edəcək.', done: 'Hesab silindi.', download: 'Məlumatlar hazırlanır…' },
    en: { title: 'Account data', export: 'Download my data', remove: 'Delete my account', cancel: 'Cancel', password: 'Current password',
      hint: 'Download your profile and private study records as JSON. Public discussions are not included in this copy.',
      warning: 'Your account and private study records will be permanently deleted. Your messages and attachments will be removed; other participants’ messages will remain. Anonymous ratings and transaction records may be retained. You can download your data first. Signing in again is required to continue.',
      busy: 'Deleting… Keep this window open.', error: 'The operation could not finish. Check your connection and login details, then try again. Any deletion already started will resume on your next attempt.', done: 'Account deleted.', download: 'Preparing your data…' }
  };
  Object.assign(copy.az, { sync: 'Təhsil qeydləri', retry: 'Sinxronlaşdır', syncing: 'Qeydlər hesabınla sinxronlaşdırılır…', saved: 'Qeydlər hesabınla sinxronlaşdırılıb.', pending: 'Qeydlər cihazda saxlanılıb. Sinxronlaşma gözləyir.', errorSync: 'Sinxronlaşma alınmadı. Qeydlər cihazda saxlanılıb; yenidən yoxla.' });
  Object.assign(copy.en, { sync: 'Study records', retry: 'Sync now', syncing: 'Syncing records with your account…', saved: 'Records are synced with your account.', pending: 'Records are saved on this device and waiting to sync.', errorSync: 'Sync failed. Records are saved on this device; please retry.' });
  const text = () => copy[lang] || copy.az;
  const localKeys = uid => ['favorites', 'unec_compass_saved', 'unec_gpa_subjects', 'unec_gpa_history', 'unec_selected_specialty', 'exam_countdowns', 'unec_completed_' + uid, 'unec_curriculum_overrides_' + uid];
  let busy = false;
  async function call(action, user, extra = {}) {
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, idToken: await user.getIdToken(), ...extra }) });
    const data = await res.json(); if (!res.ok) throw new Error(data.error || 'account_service_unavailable'); return data;
  }
  function refresh() {
    const box = document.getElementById('moreAccountTools'); if (!box) return;
    box.hidden = !getCurrentUser();
    box.innerHTML = `<h2>${U.esc(text().title)}</h2><p>${U.esc(text().hint)}</p><p id="studySyncStatus" role="status"></p><button class="menu-row" type="button" id="studySyncRetry">${U.ic('rotate')}<span>${U.esc(text().retry)}</span></button><button class="menu-row" type="button" id="accountExport">${U.ic('download')}<span>${U.esc(text().export)}</span></button><button class="menu-row menu-row--danger" type="button" id="accountRemove">${U.ic('trash')}<span>${U.esc(text().remove)}</span></button>`;
    syncStatus();
  }
  function syncStatus() {
    const label = document.getElementById('studySyncStatus'), button = document.getElementById('studySyncRetry');
    const status = window.UNECStudy.getStatus();
    if (label) label.textContent = text()[status === 'error' ? 'errorSync' : status] || '';
    if (button) button.disabled = status === 'syncing';
  }
  async function download(button) {
    const user = getCurrentUser(); if (!user || busy) return; button.disabled = true;
    try {
      U.toast(text().download); const data = await call('account-export', user); data.deviceData = {};
      for (const key of localKeys(user.uid)) { try { data.deviceData[key] = JSON.parse(window.UNECStudy.keys.includes(key) ? window.UNECStudy.getItem(key) : localStorage.getItem(key)); } catch (_) {} }
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const a = document.createElement('a'); a.href = url; a.download = 'unec-account-' + new Date().toISOString().slice(0, 10) + '.json'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (_) { U.toast(text().error, 'error'); } finally { button.disabled = false; }
  }
  function confirm(opener) {
    const user = getCurrentUser(); if (!user || busy) return;
    const password = user.providerData.some(p => p.providerId === 'password');
    document.getElementById('accountDeleteBody').innerHTML = `<p>${U.esc(text().warning)}</p><form id="accountDeleteForm">${password ? `<label for="accountPassword">${U.esc(text().password)}</label><input id="accountPassword" type="password" autocomplete="current-password" required>` : ''}<p id="accountDeleteStatus" role="status"></p><button class="btn btn--secondary" type="button" data-sheet-close>${U.esc(text().cancel)}</button><button class="btn menu-row--danger" type="submit">${U.esc(text().remove)}</button></form>`;
    document.getElementById('accountDeleteTitle').textContent = text().remove;
    document.getElementById('accountDeleteForm').onsubmit = event => { event.preventDefault(); remove(user, password); };
    U.openSheet('sheet-account-delete', opener);
  }
  async function remove(user, password) {
    if (busy) return;
    const form = document.getElementById('accountDeleteForm'), status = document.getElementById('accountDeleteStatus');
    busy = true; let paused = false, started = false;
    form.querySelectorAll('button').forEach(b => { b.disabled = true; });
    try {
      if (password) {
        const input = document.getElementById('accountPassword');
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, input.value); input.value = '';
        await user.reauthenticateWithCredential(credential);
      } else await user.reauthenticateWithPopup(new firebase.auth.GoogleAuthProvider());
      status.textContent = text().busy;
      window.UNECStudy.pause();
      if (getDb()) { await getDb().disableNetwork(); paused = true; }
      let result;
      do { started = true; result = await call('account-delete', user, { confirm: 'DELETE' }); status.textContent = text().busy + ' (' + result.processed + ')'; } while (result.more);
      window.UNECStudy.clearUser(user.uid);
      for (const key of localKeys(user.uid)) { try { localStorage.removeItem(key); } catch (_) {} }
      await firebase.auth().signOut(); U.closeSheet(); U.go('/home'); U.toast(text().done);
    } catch (_) {
      status.textContent = text().error;
      if (started) await firebase.auth().signOut().catch(() => {});
    } finally {
      busy = false; form.querySelectorAll('button').forEach(b => { b.disabled = false; });
      if (paused) await getDb().enableNetwork();
      if (!started) window.UNECStudy.resume();
    }
  }
  document.addEventListener('click', event => {
    const exp = event.target.closest('#accountExport'), del = event.target.closest('#accountRemove');
    if (exp) download(exp); if (del) confirm(del);
    if (event.target.closest('#studySyncRetry')) window.UNECStudy.sync();
  });
  document.addEventListener('click', event => {
    if (busy && !event.target.closest('#accountDeleteBody')) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  document.addEventListener('keydown', event => {
    if (busy && event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  window.addEventListener('beforeunload', event => { if (busy) { event.preventDefault(); event.returnValue = ''; } });
  document.addEventListener('DOMContentLoaded', refresh);
  window.addEventListener('unec:authchange', refresh); window.addEventListener('unec:langchange', refresh);
  window.addEventListener('unec:studystatus', syncStatus);
})();
