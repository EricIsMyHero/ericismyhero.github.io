// ============================================================
// BADGES.JS — Badge sistemi
// ============================================================
// Firestore: users/{uid}/progress/main → badges: ['first_login', ...]
// Hər trigger nöqtəsindən checkBadges() çağırılır

(function () {
'use strict';

// ── Badge tərifi ──────────────────────────────────────────────
const BADGE_DEFS = [
  {
    id:    'first_login',
    icon:  '🥉',
    name:  'İlk Addım',
    desc:  'Hesab yaratdı',
    check: (p) => true, // qeydiyyatda avtomatik
  },
  {
    id:    'first_comment',
    icon:  '💬',
    name:  'İlk Şərh',
    desc:  'İlk şərhini yazdı',
    check: (p) => (p.totalComments || 0) >= 1,
  },
  {
    id:    'first_rating',
    icon:  '⭐',
    name:  'İlk Reytinq',
    desc:  'İlk dəfə material qiymətləndirdi',
    check: (p) => (p.totalRatings || 0) >= 1,
  },
  {
    id:    'first_pdf',
    icon:  '📚',
    name:  'Oxumağa Başladı',
    desc:  'İlk PDF-i açdı',
    check: (p) => (p.totalPdfOpens || 0) >= 1,
  },
  {
    id:    'streak_3',
    icon:  '🔥',
    name:  '3 Günlük Streak',
    desc:  '3 gün ardıcıl daxil oldu',
    check: (p) => (p.streak || 0) >= 3,
  },
  {
    id:    'streak_7',
    icon:  '🔥',
    name:  '7 Günlük Streak',
    desc:  '7 gün ardıcıl daxil oldu',
    check: (p) => (p.streak || 0) >= 7,
  },
  {
    id:    'streak_30',
    icon:  '🔥',
    name:  '30 Günlük Streak',
    desc:  '30 gün ardıcıl daxil oldu',
    check: (p) => (p.streak || 0) >= 30,
  },
  {
    id:    'focus_master',
    icon:  '⏰',
    name:  'Fokus Ustası',
    desc:  'Pomodoro timerini 10 dəfə tamamladı',
    check: (p) => (p.pomodoroSessions || 0) >= 10,
  },
  {
    id:    'test_fan',
    icon:  '🎯',
    name:  'Test Həvəskarı',
    desc:  '10 test tamamladı',
    check: (p) => (p.solvedTests || 0) >= 10,
  },
  {
    id:    'test_expert',
    icon:  '🧠',
    name:  'Test Eksperti',
    desc:  '50 test tamamladı',
    check: (p) => (p.solvedTests || 0) >= 50,
  },
  {
    id:    'pdf_hunter',
    icon:  '📄',
    name:  'Material Ovçusu',
    desc:  '25 material açdı',
    check: (p) => (p.totalPdfOpens || 0) >= 25,
  },
  {
    id:    'helpful',
    icon:  '📝',
    name:  'Köməksevər',
    desc:  '10 şərh yazdı',
    check: (p) => (p.totalComments || 0) >= 10,
  },
  {
    id:    'active_student',
    icon:  '🌟',
    name:  'Aktiv Tələbə',
    desc:  '500 XP qazandı',
    check: (p) => (p.xp || 0) >= 500,
  },
  {
    id:    'unec_legend',
    icon:  '🏆',
    name:  'UNEC Əfsanəsi',
    desc:  '2000 XP qazandı',
    check: (p) => (p.xp || 0) >= 2000,
  },
];

// ── Core: badge yoxla və unlock et ───────────────────────────
window.checkBadges = async function (progress) {
  if (!currentUser || !_db) return;
  const uid = currentUser.uid;

  const existing = new Set(progress.badges || []);
  const newBadges = [];

  for (const def of BADGE_DEFS) {
    if (!existing.has(def.id) && def.check(progress)) {
      newBadges.push(def.id);
    }
  }

  if (newBadges.length === 0) return;

  // Firestore-a yaz
  await _db.collection('users').doc(uid)
    .collection('progress').doc('main').update({
      badges: firebase.firestore.FieldValue.arrayUnion(...newBadges),
    });

  // Bildiriş göstər (bir-bir, 2.5 saniyə ara ilə)
  for (let i = 0; i < newBadges.length; i++) {
    const def = BADGE_DEFS.find(d => d.id === newBadges[i]);
    if (def) setTimeout(() => showBadgeToast(def), i * 2600);
  }

  // Dashboard-u yenilə
  if (typeof renderDashboard === 'function') renderDashboard();
};

// ── Toast bildirişi ───────────────────────────────────────────
function showBadgeToast(def) {
  let el = document.getElementById('badge-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'badge-toast';
    el.className = 'badge-toast';
    document.body.appendChild(el);
  }

  el.innerHTML = `
    <div class="badge-toast-icon">${def.icon}</div>
    <div class="badge-toast-body">
      <div class="badge-toast-title">Yeni badge qazandın!</div>
      <div class="badge-toast-name">${def.name}</div>
      <div class="badge-toast-desc">${def.desc}</div>
    </div>
  `;

  el.classList.remove('badge-toast-hide');
  el.classList.add('badge-toast-show');

  setTimeout(() => {
    el.classList.remove('badge-toast-show');
    el.classList.add('badge-toast-hide');
  }, 3800);
}

// ── Render: dashboard-da badge bölməsi ───────────────────────
window.renderBadges = function (progress) {
  const container = document.getElementById('dash-badges-grid');
  if (!container) return;

  const earned = new Set(progress.badges || []);

  container.innerHTML = BADGE_DEFS.map(def => {
    const has = earned.has(def.id);
    return `
      <div class="badge-item ${has ? 'badge-earned' : 'badge-locked'}" title="${def.desc}">
        <div class="badge-item-icon">${def.icon}</div>
        <div class="badge-item-name">${def.name}</div>
      </div>`;
  }).join('');

  // Say
  const countEl = document.getElementById('dash-badges-count');
  if (countEl) countEl.textContent = `${earned.size}/${BADGE_DEFS.length}`;
};

// ── Sayaç artırıcılar ─────────────────────────────────────────
// Chat mesajı göndərildikdə çağırılır
window.badgeOnComment = async function () {
  if (!currentUser || !_db) return;
  const uid = currentUser.uid;
  const ref = _db.collection('users').doc(uid).collection('progress').doc('main');
  await ref.update({ totalComments: firebase.firestore.FieldValue.increment(1) });
  const snap = await ref.get();
  await checkBadges(snap.data() || {});
};

// PDF açıldığında çağırılır
window.badgeOnPdfOpen = async function () {
  if (!currentUser || !_db) return;
  const uid = currentUser.uid;
  const ref = _db.collection('users').doc(uid).collection('progress').doc('main');
  await ref.update({ totalPdfOpens: firebase.firestore.FieldValue.increment(1) });
  const snap = await ref.get();
  await checkBadges(snap.data() || {});
};

// Material reytinqi verildikdə çağırılır
window.badgeOnRating = async function () {
  if (!currentUser || !_db) return;
  const uid = currentUser.uid;
  const ref = _db.collection('users').doc(uid).collection('progress').doc('main');
  await ref.update({ totalRatings: firebase.firestore.FieldValue.increment(1) });
  const snap = await ref.get();
  await checkBadges(snap.data() || {});
};

// Pomodoro sessiyası bitdikdə çağırılır
window.badgeOnPomodoro = async function () {
  if (!currentUser || !_db) return;
  const uid = currentUser.uid;
  const ref = _db.collection('users').doc(uid).collection('progress').doc('main');
  await ref.update({ pomodoroSessions: firebase.firestore.FieldValue.increment(1) });
  const snap = await ref.get();
  await checkBadges(snap.data() || {});
};

// ── Export: BADGE_DEFS (admin panel üçün) ────────────────────
window.BADGE_DEFS = BADGE_DEFS;

})();
