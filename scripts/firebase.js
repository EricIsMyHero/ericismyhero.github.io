// ============================================================
// FIREBASE.JS  —  Auth + Firestore + Analytics
// Config Vercel serverless function-dan alınır (/api/firebase-config)
// ============================================================

let _app, _auth, _db;

// ── Firebase SDK yüklənib-yüklənmədiyini yoxla ───────────────
function _fbReady() {
  return typeof firebase !== 'undefined' &&
         typeof firebase.initializeApp === 'function';
}

// ── Config-i Vercel-dən al, sonra init et ────────────────────
async function initFirebase() {
  if (_app) return true;

  if (!_fbReady()) {
    console.error('[firebase] Firebase SDK yüklənməyib.');
    return false;
  }

  try {
    const res = await fetch('https://ericismyhero-github-io.vercel.app/api/firebase-config');
    if (!res.ok) throw new Error('Config alınmadı: ' + res.status);
    const config = await res.json();
    if (config.maintenance) {
      showMigrationMaintenance();
      return false;
    }

    _app  = firebase.initializeApp(config);
    _auth = firebase.auth();
    _db   = firebase.firestore();

    // Offline persistence söndürüldü (Firebase 9 compat SDK deprecation xəbərdarlığından qaçmaq üçün)

    // Qeyd: firebase.analytics() qəsdən çağırılmır — index.html-dəki
    // gtag (G-HZCMB8RSH3) tək analitika mənbəyidir. İkisi də aktiv olsaydı
    // hər hadisə iki fərqli GA4 stream-ə (ikiqat) yazılardı.

    _auth.onAuthStateChanged(onAuthStateChange);

    console.info('[firebase] Uğurla başladıldı.');
    return true;
  } catch (e) {
    console.error('[firebase] Init xətası:', e);
    return false;
  }
}

// ============================================================
// AUTH STATE
// ============================================================
let currentUser    = null;
let currentProfile = null;

async function onAuthStateChange(user) {
  currentUser = user;
  if (window.UNECStudy) window.UNECStudy.setUser(user);

  if (user) {
    await _ensureUserDoc(user);
    currentProfile = await _getUserProfile(user.uid);
    await _handleDailyLogin(user.uid);
    if (currentUser?.uid !== user.uid) return;

    _hideAuthModal();
    _showUserBadge(user);

    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof refreshChatAuthState === 'function') refreshChatAuthState();
    _logEvent('login', { method: user.providerData[0]?.providerId || 'unknown' });
  } else {
    currentUser    = null;
    currentProfile = null;
    _showGuestBadge();
    if (typeof refreshChatAuthState === 'function') refreshChatAuthState();
  }
}

async function _ensureUserDoc(user) {
  const ref  = _db.collection('users').doc(user.uid);
  const snap = await ref.get();

  if (!snap.exists) {
    const name = user.displayName || user.email?.split('@')[0] || 'Tələbə';
    await ref.set({
      name,
      email:      user.email || '',
      university: 'UNEC',
      faculty:    '',
      major:      '',
      year:       '',
      createdAt:  firebase.firestore.FieldValue.serverTimestamp(),
      photoURL:   user.photoURL || ''
    });

    await _db.collection('users').doc(user.uid)
             .collection('progress').doc('main').set({
      solvedTests:      0,
      streak:           0,
      lastActive:       null,
      xp:               0,
      rank:             'Freshman',
      lastLoginDate:    null,
      badges:           ['first_login'],
      totalComments:    0,
      totalRatings:     0,
      totalPdfOpens:    0,
      pomodoroSessions: 0,
    });
  }
}

async function _getUserProfile(uid) {
  try {
    const userSnap     = await _db.collection('users').doc(uid).get();
    const progressSnap = await _db.collection('users').doc(uid)
                                  .collection('progress').doc('main').get();
    return { ...userSnap.data(), progress: progressSnap.data() || {} };
  } catch (e) {
    console.warn('[firebase] Profil oxunmadı:', e);
    return null;
  }
}

// ============================================================
// AUTH METHODS
// ============================================================

async function signInWithGoogle() {
  if (!_auth) { _showAuthError(t('authNotReady')); return; }
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await _auth.signInWithPopup(provider);
    if (result.user) {
      _hideAuthModal();
    }
  } catch (e) {
    console.warn('[firebase] Google login:', e.code);
    _showAuthError(_authErrorMessage(e.code));
  }
}

async function signUpWithEmail(email, password, name) {
  if (!_auth) { _showAuthError(t('authNotReady')); return; }
  try {
    const cred = await _auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: name });
  } catch (e) {
    _showAuthError(_authErrorMessage(e.code));
  }
}

async function signInWithEmail(email, password) {
  if (!_auth) { _showAuthError(t('authNotReady')); return; }
  try {
    await _auth.signInWithEmailAndPassword(email, password);
  } catch (e) {
    _showAuthError(_authErrorMessage(e.code));
  }
}

async function signOut() {
  if (!_auth) return;
  await _auth.signOut();
  if (typeof switchBottomTab === 'function') switchBottomTab('home');
}

async function sendPasswordReset(email) {
  if (!_auth || !email) { _showAuthError(t('authNotReady')); return; }
  try {
    await _auth.sendPasswordResetEmail(email);
    _showAuthError(t('authResetSent'), 'success');
  } catch (e) {
    if (e.code === 'auth/user-not-found') _showAuthError(t('authResetSent'), 'success');
    else _showAuthError(_authErrorMessage(e.code));
  }
}

function _authErrorMessage(code) {
  if (['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(code)) return '';
  const keys = {
    'auth/email-already-in-use': 'authEmailInUse', 'auth/invalid-email': 'authEmailInvalid',
    'auth/weak-password': 'authPasswordInvalid', 'auth/password-does-not-meet-requirements': 'authPasswordInvalid',
    'auth/user-not-found': 'authBadCredentials', 'auth/wrong-password': 'authBadCredentials',
    'auth/invalid-credential': 'authBadCredentials', 'auth/invalid-login-credentials': 'authBadCredentials',
    'auth/too-many-requests': 'authTooMany', 'auth/network-request-failed': 'authNetwork',
    'auth/popup-blocked': 'authPopupBlocked', 'auth/operation-not-allowed': 'authProviderDisabled'
  };
  return t(keys[code] || 'authGenericError');
}

// ============================================================
// FIRESTORE — WRITE HELPERS
// ============================================================

async function saveQuizResult(subject, score, total, mistakes, options = {}) {
  if (!currentUser || (options.uid && options.uid !== currentUser.uid)) throw new Error('login_required');
  const uid = currentUser.uid;
  const resultId=options.id||crypto.randomUUID();
  const record=_db.collection('users').doc(uid).collection('quiz_results').doc(resultId);
  if((await record.get()).exists)return 0;
  const pct = Math.round((score / total) * 100);

  await record.set({
    subject, score, total, mistakes, format:'mcq', personal:!!options.personal, source:options.source||'',
    percent:   pct,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  let xpGain = 20;
  if (pct === 100) xpGain += 50;
  else if (pct >= 90) xpGain += 30;

  await _addXP(uid, xpGain);
  await _incrementSolvedTests(uid);
  await _updateStreak(uid, 'quiz');
  _logEvent('quiz_complete', { subject, score: pct });

  const updatedProfile = await _getUserProfile(uid);
  if(currentUser?.uid!==uid)return xpGain;
  currentProfile=updatedProfile;
  if (typeof renderDashboard === 'function') renderDashboard();

  // Badge yoxla
  const progressSnap = await _db.collection('users').doc(uid).collection('progress').doc('main').get();
  if (typeof checkBadges === 'function') await checkBadges(progressSnap.data() || {});

  return xpGain;
}

async function saveGpaUpdate(current, history) {
  if (!currentUser) return;
  const uid = currentUser.uid;
  await _db.collection('users').doc(uid)
           .collection('gpa').doc('main').set({
    current, history,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  await _updateStreak(uid, 'gpa');
  _logEvent('gpa_update', { gpa: current });
}

async function logPdfOpen(subject, fileName) {
  if (!_db) return;
  const uid = currentUser?.uid || 'anonymous';
  await _db.collection('analytics').doc('pdf_opens')
           .collection('events').add({
    uid, subject, fileName,
    ts: firebase.firestore.FieldValue.serverTimestamp()
  });
  if (currentUser) {
    await _updateStreak(currentUser.uid, 'pdf');
    _logEvent('pdf_open', { subject, file: fileName });
    if (typeof badgeOnPdfOpen === 'function') badgeOnPdfOpen();
  }
}

async function saveStudySession(subject, durationMinutes) {
  if (!currentUser || durationMinutes < 1) return;
  const uid = currentUser.uid;
  await _db.collection('users').doc(uid)
           .collection('study_sessions').add({
    subject, duration: durationMinutes,
    date: firebase.firestore.FieldValue.serverTimestamp()
  });
  await _updateStreak(uid, 'study');
  await _addXP(uid, Math.floor(durationMinutes / 5) * 2);
  _logEvent('study_session', { subject, duration: durationMinutes });
}

async function saveTeacherReview(teacher, rating, comment) {
  if (!currentUser) return;
  const uid = currentUser.uid;
  await _db.collection('users').doc(uid)
           .collection('teacher_reviews').add({
    teacher, rating, comment,
    ts: firebase.firestore.FieldValue.serverTimestamp()
  });
  await _db.collection('analytics').doc('teacher_ratings')
           .collection('reviews').add({ teacher, rating, uid });
}

// ============================================================
// GAMIFICATION — XP + RANK + STREAK
// ============================================================

const RANKS = [
  { name: 'Freshman',  minXP:    0, icon: 'eco' },
  { name: 'Scholar',   minXP:  100, icon: 'auto_stories' },
  { name: 'Analyst',   minXP:  300, icon: 'search' },
  { name: 'Expert',    minXP:  700, icon: 'bolt' },
  { name: 'Master',    minXP: 1500, icon: 'school' },
  { name: 'Professor', minXP: 3000, icon: 'emoji_events' },
];

function getRankInfo(xp) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.minXP) rank = r;
    else break;
  }
  const rankIdx  = RANKS.indexOf(rank);
  const nextRank = RANKS[rankIdx + 1] || null;
  const progress = nextRank
    ? Math.round(((xp - rank.minXP) / (nextRank.minXP - rank.minXP)) * 100)
    : 100;
  return { rank, nextRank, progress, xp };
}

async function _addXP(uid, amount) {
  const ref = _db.collection('users').doc(uid)
                 .collection('progress').doc('main');
  await ref.update({ xp: firebase.firestore.FieldValue.increment(amount) });
  const snap = await ref.get();
  const xp   = snap.data()?.xp || 0;
  await ref.update({ rank: getRankInfo(xp).rank.name });
}

async function _incrementSolvedTests(uid) {
  await _db.collection('users').doc(uid)
           .collection('progress').doc('main').update({
    solvedTests: firebase.firestore.FieldValue.increment(1)
  });
}

async function _handleDailyLogin(uid) {
  const ref  = _db.collection('users').doc(uid)
                  .collection('progress').doc('main');
  const snap = await ref.get();
  const data = snap.data() || {};
  const today = _todayStr();
  if (data.lastLoginDate !== today) {
    await ref.update({ lastLoginDate: today });
    await _addXP(uid, 5);
  }
}

async function _updateStreak(uid, activityType) {
  const ref  = _db.collection('users').doc(uid)
                  .collection('progress').doc('main');
  const snap = await ref.get();
  const data = snap.data() || {};

  const today     = _todayStr();
  const yesterday = _yesterdayStr();
  const last      = data.lastActive;

  let newStreak = data.streak || 0;

  if (last === today) {
    // Bu gün artıq aktivlik var — streak dəyişmir
  } else if (last === yesterday) {
    newStreak += 1;
  } else {
    newStreak = 1; // ilk dəfə və ya fasilə
  }

  await ref.update({ streak: newStreak, lastActive: today });

  if (newStreak > 0 && newStreak % 7 === 0) {
    await _addXP(uid, 30); // hər 7 günlük streak bonusu
  }

  // Badge yoxla
  const snapAfter = await ref.get();
  if (typeof checkBadges === 'function') await checkBadges(snapAfter.data() || {});
}

function _todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function _yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// ============================================================
// ANALYTICS
// ============================================================
function _logEvent(name, params = {}) {
  if (typeof gtag === 'function') gtag('event', name, params);
}

// ============================================================
// AUTH MODAL — UI
// ============================================================
function openAuthModal(mode = 'login') {
  const overlay = document.getElementById('authOverlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  setAuthMode(mode);
}

function _hideAuthModal() {
  window.UNECAuth?.reset();
  const overlay = document.getElementById('authOverlay');
  if (overlay) overlay.classList.add('hidden');
}

function setAuthMode(mode) {
  if (window.UNECAuth) return window.UNECAuth.setMode(mode);
  document.querySelectorAll('.auth-panel').forEach(p => p.classList.add('hidden'));
  const panel = document.getElementById(`auth-panel-${mode}`);
  if (panel) panel.classList.remove('hidden');
  document.querySelectorAll('.auth-error').forEach(e => e.textContent = '');
}

function _showAuthError(msg, type = 'error') {
  document.querySelectorAll('.auth-error').forEach(el => {
    if (el.closest('.auth-panel:not(.hidden)')) {
      el.textContent = msg;
      el.dataset.status = type;
      el.style.removeProperty('color');
    }
  });
}

function _showUserBadge(user) {
  const btn = document.getElementById('authHeaderBtn');
  if (btn) {
    const name = user.displayName || (user.email && user.email.split('@')[0]) || 'Profil';
    btn.classList.remove('is-guest');
    btn.textContent = '';
    const av = document.createElement('span');
    av.className = 'auth-avatar';
    if (user.photoURL) {
      const img = document.createElement('img');
      img.src = user.photoURL; img.alt = ''; img.referrerPolicy = 'no-referrer';
      av.appendChild(img);
    } else {
      av.textContent = name.charAt(0).toUpperCase();
    }
    btn.appendChild(av);
    btn.setAttribute('aria-label', name);
    btn.title = name;
    btn.onclick = () => switchBottomTab('dashboard');
  }
  window.dispatchEvent(new CustomEvent('unec:authchange'));
}

function _showGuestBadge() {
  const btn = document.getElementById('authHeaderBtn');
  if (btn) {
    const label = (typeof t === 'function') ? t('appLogin') : 'Daxil ol';
    btn.classList.add('is-guest');
    btn.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-user"/></svg>';
    btn.setAttribute('aria-label', label);
    btn.title = label;
    btn.onclick = () => openAuthModal('login');
  }
  window.dispatchEvent(new CustomEvent('unec:authchange'));
}

async function updateUserProfile(updates) {
  if (!currentUser || !updates) return;
  await _db.collection('users').doc(currentUser.uid).update(updates);
  currentProfile = await _getUserProfile(currentUser.uid);
  if (typeof renderDashboard === 'function') renderDashboard();
  window.dispatchEvent(new CustomEvent('unec:profilechange'));
}

// ── Public getters ────────────────────────────────────────────
function getCurrentUser() { return currentUser; }
function getProfile()     { return currentProfile; }
function getDb()          { return _db; }
function isLoggedIn()     { return !!currentUser; }

// ============================================================
// VISITOR COUNTER — aylıq göstərici
// ============================================================

function _currentMonthKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

async function trackMonthlyVisit() {
  if (!_db) return;

  const monthKey  = _currentMonthKey();
  const lsKey     = `visited_${monthKey}`;
  const lastVisit = localStorage.getItem(lsKey);
  const now       = Date.now();

  // Eyni ayda 24 saat ərzində yenidən saymaq
  if (lastVisit && now - parseInt(lastVisit) < 24 * 60 * 60 * 1000) return;

  const ref = _db.collection('stats').doc(`monthly_${monthKey}`);
  try {
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({ count: 1, month: monthKey });
    } else {
      await ref.update({ count: firebase.firestore.FieldValue.increment(1) });
    }
    localStorage.setItem(lsKey, String(now));
  } catch (e) {
    console.warn('[firebase] Visitor track xətası:', e);
  }
}

async function showMonthlyVisitors() {
  if (!_db) return;
  const monthKey = _currentMonthKey();
  const ref      = _db.collection('stats').doc(`monthly_${monthKey}`);
  try {
    const snap = await ref.get();
    const count = snap.exists ? (snap.data().count || 0) : 0;

    // Köhnə gizli element (uyğunluq üçün)
    const legacyEl = document.getElementById('stat-monthly-visitors');
    if (legacyEl) legacyEl.textContent = count.toLocaleString('az-AZ');

    // Yeni böyük stat kart — sc-students
    const scEl = document.getElementById('sc-students');
    if (scEl && count > 0) {
      // data-target-i real Firebase dəyəri ilə yenilə
      scEl.setAttribute('data-target', count);

      // Counter hələ 0-dursa → animated sayma işə düşsün
      if (scEl.textContent === '0' || scEl.textContent === '') {
        _animateCounter(scEl, count, 1800);
      } else {
        // Counter artıq işə düşüb (IntersectionObserver tez tetiklənib) — dərhal real dəyəri yaz
        scEl.textContent = count.toLocaleString('az-AZ') + '+';
      }
    }
  } catch (e) {
    console.warn('[firebase] Visitor oxuma xətası:', e);
  }
}

// ── Shared counter helper (firebase.js-dən çağırıla bilər) ───
function _animateCounter(el, target, duration) {
  let startTime = null;
  function step(ts) {
    if (!startTime) startTime = ts;
    const progress = Math.min((ts - startTime) / duration, 1);
    const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    el.textContent = Math.floor(ease * target).toLocaleString('az-AZ');
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString('az-AZ') + '+';
  }
  requestAnimationFrame(step);
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const ok = await initFirebase();
  if (!ok) {
    _showGuestBadge();
    return;
  }
  await trackMonthlyVisit();
  await showMonthlyVisitors();
});

// Temporary pause, controlled by the backend operator during data migration.
function showMigrationMaintenance() {
  if (document.getElementById('migrationMaintenance')) return;
  const overlay = document.createElement('div');
  overlay.id = 'migrationMaintenance';
  overlay.setAttribute('role', 'alertdialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'migrationMaintenanceTitle');
  Object.assign(overlay.style, { position: 'fixed', inset: '0', zIndex: '2147483647', background: '#071426', color: '#fff', display: 'grid', placeItems: 'center', padding: '24px', textAlign: 'center' });
  const box = document.createElement('div'), title = document.createElement('h1'), message = document.createElement('p'), retry = document.createElement('button');
  const english = typeof lang !== 'undefined' && lang === 'en';
  title.id = 'migrationMaintenanceTitle'; title.textContent = english ? 'We are updating the platform' : 'Platforma yenilənir';
  message.textContent = english ? 'Please return shortly. Your records are being preserved.' : 'Bir qədər sonra yenidən yoxla. Məlumatların qorunaraq köçürülür.';
  retry.type = 'button'; retry.textContent = english ? 'Check again' : 'Yenidən yoxla';
  Object.assign(retry.style, { padding: '12px 20px', font: 'inherit', cursor: 'pointer' });
  retry.onclick = () => location.reload();
  box.append(title, message, retry); overlay.append(box);
  [...document.body.children].forEach(child => { if (!['SCRIPT', 'STYLE'].includes(child.tagName)) child.inert = true; });
  document.body.append(overlay); retry.focus();
}
