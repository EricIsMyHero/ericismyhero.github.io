// ============================================================
// DASHBOARD.JS  —  Dashboard + Gamification render
// ============================================================

// ── Dashboard tab render ──────────────────────────────────────
function renderDashboard() {
  const profile  = getProfile();
  const user     = getCurrentUser();
  const progress = profile?.progress || {};

  const xp      = progress.xp          || 0;
  const streak  = progress.streak       || 0;
  const solved  = progress.solvedTests  || 0;
  const rankInfo = getRankInfo(xp);

  // Salamlama
  const firstName = profile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || t('dashStudent');
  const hour = new Date().getHours();
  const greeting = t(hour < 12 ? 'dashGreetMorning' : hour < 18 ? 'dashGreetDay' : 'dashGreetEvening');

  document.getElementById('dash-greeting').textContent  = `${greeting}, ${firstName}`;
  document.getElementById('dash-date').textContent      = _formatDate();

  // Profil kartı — şəxsiyyət + faktlar
  _renderProfileCard(profile, rankInfo, solved);

  // Statistika kartları
  document.getElementById('dash-streak').textContent    = streak;
  document.getElementById('dash-solved').textContent    = solved;
  document.getElementById('dash-xp').textContent        = xp;

  // GPA
  _loadDashGpa(user.uid);

  // Rank + progress bar
  document.getElementById('dash-rank-icon').innerHTML    = _dashIcon(rankInfo.rank.icon);
  document.getElementById('dash-rank-name').textContent  = rankInfo.rank.name;
  document.getElementById('dash-rank-xp').textContent    = `${xp} XP`;
  document.getElementById('dash-rank-next').textContent  =
    rankInfo.nextRank
      ? t('dashRankNext').replace('{rank}', rankInfo.nextRank.name).replace('{xp}', rankInfo.nextRank.minXP - xp)
      : t('dashRankMax');
  setTimeout(() => {
    const bar = document.getElementById('dash-rank-bar');
    if (bar) bar.style.width = rankInfo.progress + '%';
  }, 100);

  // Son quiz nəticələri
  _loadRecentQuizzes(user.uid);

  // Streak vəziyyəti
  _renderStreakStatus(progress);

  // Badges
  if (typeof renderBadges === 'function') renderBadges(progress);
}

// ── Profil kartı — avatar, ad, email, faktlar ────────────────
function _renderProfileCard(profile, rankInfo, solved) {
  const avatarEl = document.getElementById('dash-avatar');
  const nameEl   = document.getElementById('dash-pname');
  const emailEl  = document.getElementById('dash-pemail');
  if (avatarEl) avatarEl.textContent = (profile?.name || '?').charAt(0).toUpperCase();
  if (nameEl)   nameEl.textContent   = profile?.name  || '—';
  if (emailEl)  emailEl.textContent  = profile?.email || '—';

  const setFact = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setFact('dash-fact-faculty', profile?.faculty || '—');
  setFact('dash-fact-major',   profile?.major    || '—');
  setFact('dash-fact-year',    _yearLabel(profile?.year) || '—');
  setFact('dash-fact-rank',    rankInfo.rank.name);
  setFact('dash-fact-solved',  String(solved));
}

// ── Profil redaktə rejimi açıb-bağlamaq ──────────────────────
function toggleProfileEdit(forceShow) {
  const facts = document.getElementById('dash-profile-facts');
  const edit  = document.getElementById('dash-profile-edit');
  if (!facts || !edit) return;

  const opening = forceShow !== undefined ? forceShow : edit.classList.contains('hidden');

  if (opening) {
    const p = getProfile();
    const fEl = document.getElementById('dash-faculty-input');
    const mEl = document.getElementById('dash-major-input');
    const yEl = document.getElementById('dash-year-input');
    if (fEl) fEl.value = p?.faculty || '';
    if (mEl) mEl.value = p?.major   || '';
    if (yEl) yEl.value = p?.year    || '';
    facts.classList.add('hidden');
    edit.classList.remove('hidden');
  } else {
    edit.classList.add('hidden');
    facts.classList.remove('hidden');
  }
}

// ── Profil yeniləməsini saxla ─────────────────────────────────
async function handleProfileUpdate() {
  const faculty = document.getElementById('dash-faculty-input')?.value?.trim() || '';
  const major   = document.getElementById('dash-major-input')?.value?.trim()  || '';
  const year    = document.getElementById('dash-year-input')?.value || '';

  const btn = document.getElementById('dash-profile-save-btn');
  if (btn) { btn.disabled = true; btn.textContent = t('dashSaving'); }

  await updateUserProfile({ faculty, major, year });

  if (btn) { btn.disabled = false; btn.textContent = t('btnSave'); }
  toggleProfileEdit(false);
}

async function _loadDashGpa(uid) {
  try {
    const snap = await getDb().collection('users').doc(uid)
                              .collection('gpa').doc('main').get();
    const gpa  = snap.exists ? (snap.data().current || 0) : 0;
    document.getElementById('dash-gpa').textContent = gpa ? gpa.toFixed(1) : '—';
  } catch (_) {
    document.getElementById('dash-gpa').textContent = '—';
  }
}

async function _loadRecentQuizzes(uid) {
  try {
    const snap = await getDb().collection('users').doc(uid)
                              .collection('quiz_results')
                              .orderBy('timestamp', 'desc')
                              .limit(4).get();

    const container = document.getElementById('dash-recent-quizzes');
    if (!container) return;

    if (snap.empty) {
      container.innerHTML = `<div class="dash-empty">${_dashIcon('clipboard-check')}<span>${t('dashNoTests')}</span></div>`;
      return;
    }

    container.innerHTML = snap.docs.map(doc => {
      const d   = doc.data();
      const pct = d.percent ?? Math.round((d.score / d.total) * 100);
      const cls = pct >= 75 ? 'dash-quiz-good' : pct >= 50 ? 'dash-quiz-mid' : 'dash-quiz-bad';
      const icon = _subjectIcon(d.subject);
      return `
        <div class="dash-quiz-item ${cls}">
          <div class="dash-quiz-icon">${icon}</div>
          <div class="dash-quiz-subj">${_dashEsc(d.subject || '—')}</div>
          <div class="dash-quiz-score">${d.score}/${d.total}</div>
          <div class="dash-quiz-pct">${pct}%</div>
        </div>`;
    }).join('');
  } catch (e) {
    console.warn('[dashboard] quiz load xətası:', e);
  }
}

function _renderStreakStatus(progress) {
  const el   = document.getElementById('dash-streak-msg');
  const txt  = document.getElementById('dash-streak-msg-text');
  const ico  = document.getElementById('dash-streak-msg-icon');
  if (!el) return;
  const last  = progress.lastActive;
  const today = new Date().toISOString().slice(0, 10);
  const yest  = (() => { const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10); })();

  if (last === today) {
    if (txt) txt.textContent = t('dashStreakOk');
    if (ico) ico.innerHTML = _dashIcon('check_circle');
    el.className = 'dash-streak-msg dash-streak-ok';
  } else if (last === yest) {
    if (txt) txt.textContent = t('dashStreakWarn');
    if (ico) ico.innerHTML = _dashIcon('bolt');
    el.className = 'dash-streak-msg dash-streak-warn';
  } else {
    if (txt) txt.textContent = t('dashStreakDead');
    if (ico) ico.innerHTML = _dashIcon('cancel');
    el.className = 'dash-streak-msg dash-streak-dead';
  }
}

function toggleStreakInfo() {
  const panel = document.getElementById('streak-info-panel');
  const btn   = document.getElementById('dash-streak-msg');
  if (!panel) return;
  panel.classList.toggle('hidden');
  if (btn) btn.setAttribute('aria-expanded', String(!panel.classList.contains('hidden')));
}

// ── XP toast bildirişi ────────────────────────────────────────
function showXpToast(amount, reason) {
  const toast = document.getElementById('xp-toast');
  if (!toast) return;
  toast.textContent = `+${amount} XP — ${reason}`;
  toast.classList.add('xp-toast-show');
  setTimeout(() => toast.classList.remove('xp-toast-show'), 2800);
}

// ── Quiz bitdikdə avtomatik saxla ────────────────────────────
// features.js-dəki finishTest() sonrası çağırılır
async function onQuizFinished(subject, score, total, mistakes) {
  if (!isLoggedIn()) return;
  const xpGain = await saveQuizResult(subject, score, total, mistakes);
  if (xpGain) showXpToast(xpGain, t('dashXpQuizDone'));
}

// ── GPA yeniləndikdə hook ─────────────────────────────────────
async function onGpaUpdated(current, history) {
  if (!isLoggedIn()) return;
  await saveGpaUpdate(current, history);
  // Dashboard stat-ı dərhal yenilə
  const gpaEl = document.getElementById('dash-gpa');
  if (gpaEl) gpaEl.textContent = current.toFixed(1);
}

// ── PDF açılışı hook ──────────────────────────────────────────
async function onPdfOpened(subject, fileName) {
  await logPdfOpen(subject, fileName);
  if (!isLoggedIn()) return;
  // Streak yeniləndi — profili yenidən yüklə və dashboard-u refresh et
  const uid = getCurrentUser().uid;
  try {
    const snap = await getDb().collection('users').doc(uid)
                              .collection('progress').doc('main').get();
    const data = snap.data() || {};
    // dash-streak-ı dərhal yenilə
    const streakEl = document.getElementById('dash-streak');
    if (streakEl) streakEl.textContent = data.streak || 0;
    _renderStreakStatus(data);
  } catch(e) {}
}

// ── Auth form submit handlers ─────────────────────────────────
function handleLoginSubmit() {
  const email    = document.getElementById('login-email')?.value?.trim();
  const password = document.getElementById('login-password')?.value;
  if (!email || !password) return;
  signInWithEmail(email, password);
}

function handleRegisterSubmit() {
  const name     = document.getElementById('reg-name')?.value?.trim();
  const email    = document.getElementById('reg-email')?.value?.trim();
  const password = document.getElementById('reg-password')?.value;
  if (!name || !email || !password) return;
  signUpWithEmail(email, password, name);
}

function handleResetSubmit() {
  const email = document.getElementById('reset-email')?.value?.trim();
  if (!email) return;
  sendPasswordReset(email);
}

// ── Köməkçi ──────────────────────────────────────────────────
function _formatDate() {
  return new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'az-AZ', {
    weekday: 'long', day: 'numeric', month: 'long'
  });
}

function _dashEsc(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Köhnə Material Symbols adı → yeni ikon (UNEC.mi); UNEC yüklənməyibsə boş qalır
function _dashIcon(materialName) {
  return (window.UNEC && UNEC.mi) ? UNEC.mi(materialName) : '';
}

// Saxlanmış kurs dəyəri ("1-ci kurs") → seçilmiş dildə etiket
function _yearLabel(year) {
  const m = /^(\d)-/.exec(year || '');
  return m ? t('dashYear' + m[1]) : year;
}

// ── Dashboard tab göstər (giriş olmadan) ─────────────────────
function openDashboardTab() {
  if (!isLoggedIn()) {
    openAuthModal('login');
    return;
  }
  switchBottomTab('dashboard');
}

// ── Fənn ikonu ────────────────────────────────────────────────
function _subjectIcon(subject) {
  const name = (typeof subjectIconName === 'function') ? subjectIconName(subject || '') : 'book-open';
  return `<svg class="ic" aria-hidden="true"><use href="#i-${name}"/></svg>`;
}

// ── Quiz nəticələri modali ────────────────────────────────────
async function openQuizResultsModal() {
  const overlay = document.getElementById('quizResultsOverlay');
  const body    = document.getElementById('quiz-results-body');
  if (!overlay || !body) return;
  overlay.classList.remove('hidden');
  body.innerHTML = `<div class="quiz-results-loading">${t('loadingText')}</div>`;

  if (!isLoggedIn()) {
    body.innerHTML = `<div class="quiz-results-empty">${t('dashQrLogin')}</div>`;
    return;
  }

  try {
    const snap = await getDb()
      .collection('users').doc(getCurrentUser().uid)
      .collection('quiz_results')
      .orderBy('timestamp', 'desc')
      .limit(20).get();

    if (snap.empty) {
      body.innerHTML = `<div class="quiz-results-empty">${t('dashNoTests')}</div>`;
      return;
    }

    body.innerHTML = snap.docs.map(doc => {
      const d   = doc.data();
      const pct = d.percent ?? Math.round((d.score / d.total) * 100);
      const cls = pct >= 75 ? 'qr-good' : pct >= 50 ? 'qr-mid' : 'qr-bad';
      const icon = _subjectIcon(d.subject);
      const ts   = d.timestamp?.toDate
        ? d.timestamp.toDate().toLocaleDateString(lang === 'en' ? 'en-GB' : 'az-AZ', { day:'numeric', month:'short' })
        : '';
      return `
        <div class="qr-item">
          <div class="qr-icon">${icon}</div>
          <div class="qr-info">
            <div class="qr-subj">${_dashEsc(d.subject || '—')}</div>
            <div class="qr-date">${ts}</div>
          </div>
          <div class="qr-right">
            <div class="qr-score">${d.score}/${d.total}</div>
            <div class="qr-pct ${cls}">${pct}%</div>
          </div>
        </div>`;
    }).join('');
  } catch (e) {
    body.innerHTML = `<div class="quiz-results-empty">${t('appLoadFailed')}</div>`;
    console.warn('[dashboard] quiz modal xəta:', e);
  }
}

function closeQuizResultsModal() {
  const overlay = document.getElementById('quizResultsOverlay');
  if (overlay) overlay.classList.add('hidden');
}

// Dil dəyişəndə dinamik mətnləri (salam, tarix, streak, rank, badgelər) yenilə
window.addEventListener('unec:langchange', () => {
  if (document.body.getAttribute('data-route') !== 'dashboard') return;
  if (typeof isLoggedIn === 'function' && isLoggedIn() && typeof renderDashboard === 'function') renderDashboard();
});
