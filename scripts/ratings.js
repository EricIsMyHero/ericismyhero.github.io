// ============================================================
// RATINGS.JS  —  Material reytinqi (⭐ 1-5) + Lider lövhəsi
// Firestore: pdf_ratings/{course__subject__file}
//            pdf_ratings/{id}/votes/{uid}
// ============================================================

let _ratingUnsubs = [];

// ── Köməkçilər ────────────────────────────────────────────────
function _ratingSlug(str) {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9əğıöşüç\-.]/gi, '')
    .slice(0, 60);
}

function ratingDocId(courseName, subjectName, fileName) {
  return `${_ratingSlug(courseName)}__${_ratingSlug(subjectName)}__${_ratingSlug(fileName)}`;
}

function _ratingsEscape(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function unsubscribePdfRatings() {
  _ratingUnsubs.forEach(u => u && u());
  _ratingUnsubs = [];
}

// ── Hər .pdf-rating konteynerini başlat (PDF siyahısı) ───────
function renderAllPdfRatings() {
  unsubscribePdfRatings();

  const db = typeof getDb === 'function' ? getDb() : null;
  if (!db) return;

  document.querySelectorAll('.pdf-rating[data-file]').forEach(el => {
    const course  = el.dataset.course;
    const subject = el.dataset.subject;
    const file     = el.dataset.file;
    const id       = ratingDocId(course, subject, file);

    el.innerHTML = _ratingMarkup();
    _bindRatingWidget(el, id);

    const unsub = db.collection('pdf_ratings').doc(id).onSnapshot(snap => {
      const d = snap.exists ? snap.data() : { avg: 0, count: 0 };
      _updateViewStars(el, d.avg || 0, d.count || 0);
    }, err => console.warn('[ratings] dinləyici xətası:', err));

    _ratingUnsubs.push(unsub);
  });
}

// ── Markup: baxış rejimi (rəngli, sabit) + reyting rejimi (boş, klikləyiə bilən) ──
function _ratingMarkup() {
  const viewStars = Array.from({ length: 5 }, () => `<span>★</span>`).join('');
  const inputStars = Array.from({ length: 5 }, (_, i) =>
    `<button type="button" class="pdf-star" data-value="${i + 1}" aria-label="${i + 1} ulduz ver">★</button>`
  ).join('');

  return `
    <div class="rating-view">
      <span class="rating-view-stars">${viewStars}</span>
      <span class="rating-view-count">Hələ qiymət yoxdur</span>
    </div>
    <button type="button" class="rating-toggle-btn">⭐ Reytinq ver</button>
    <div class="rating-input hidden">
      <div class="pdf-stars">${inputStars}</div>
      <button type="button" class="rating-back-btn" aria-label="Geri qayıt">✕</button>
    </div>
  `;
}

function _updateViewStars(el, avg, count) {
  el.dataset.avg   = avg;
  el.dataset.count = count;

  const rounded = Math.round(avg);
  el.querySelectorAll('.rating-view-stars span').forEach((span, i) => {
    span.classList.toggle('filled', i < rounded);
  });

  const countEl = el.querySelector('.rating-view-count');
  if (countEl) {
    countEl.textContent = count > 0 ? `${avg.toFixed(1)} (${count})` : 'Hələ qiymət yoxdur';
  }
}

function _paintInputStars(el, filledCount) {
  el.querySelectorAll('.pdf-star').forEach(btn => {
    btn.classList.toggle('filled', Number(btn.dataset.value) <= filledCount);
  });
}

function _enterRatingMode(el) {
  el.querySelector('.rating-view').classList.add('hidden');
  el.querySelector('.rating-toggle-btn').classList.add('hidden');
  el.querySelector('.rating-input').classList.remove('hidden');
  _paintInputStars(el, 0); // rənglər silinir — boş başlayır
}

function _exitRatingMode(el) {
  el.querySelector('.rating-input').classList.add('hidden');
  el.querySelector('.rating-view').classList.remove('hidden');
  el.querySelector('.rating-toggle-btn').classList.remove('hidden');
}

function _bindRatingWidget(el, ratingId) {
  const toggleBtn = el.querySelector('.rating-toggle-btn');
  const backBtn   = el.querySelector('.rating-back-btn');
  const input     = el.querySelector('.rating-input');

  toggleBtn.addEventListener('click', () => {
    if (typeof isLoggedIn !== 'function' || !isLoggedIn()) {
      if (typeof openAuthModal === 'function') openAuthModal('login');
      return;
    }
    _enterRatingMode(el);
  });

  backBtn.addEventListener('click', () => _exitRatingMode(el));

  el.querySelectorAll('.pdf-star').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      await submitPdfRating(ratingId, Number(btn.dataset.value));
      _exitRatingMode(el); // ulduz verdikdə ümumi reytinq görünür
    });
    btn.addEventListener('mouseenter', () => _paintInputStars(el, Number(btn.dataset.value)));
  });

  input.addEventListener('mouseleave', () => {
    if (!input.classList.contains('hidden')) _paintInputStars(el, 0);
  });
}

// ── Qiymət göndərmək — giriş tələb olunur ────────────────────
async function submitPdfRating(ratingId, stars) {
  if (typeof isLoggedIn !== 'function' || !isLoggedIn()) {
    if (typeof openAuthModal === 'function') openAuthModal('login');
    return;
  }

  const db   = typeof getDb === 'function' ? getDb() : null;
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!db || !user) return;

  const ratingRef = db.collection('pdf_ratings').doc(ratingId);
  const voteRef    = ratingRef.collection('votes').doc(user.uid);

  try {
    await db.runTransaction(async tx => {
      const voteSnap   = await tx.get(voteRef);
      const ratingSnap = await tx.get(ratingRef);

      const prevStars = voteSnap.exists ? (voteSnap.data().stars || 0) : 0;
      const curSum    = ratingSnap.exists ? (ratingSnap.data().sum   || 0) : 0;
      const curCount  = ratingSnap.exists ? (ratingSnap.data().count || 0) : 0;

      const newSum   = curSum - prevStars + stars;
      const newCount = voteSnap.exists ? curCount : curCount + 1;

      tx.set(ratingRef, {
        sum:   newSum,
        count: newCount,
        avg:   newSum / newCount
      }, { merge: true });

      tx.set(voteRef, {
        stars,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    });
  } catch (e) {
    console.warn('[ratings] qiymət göndərmə xətası:', e);
  }
}

// ── Lider lövhəsi — fənn chatının yuxarısında ────────────────
async function renderMaterialLeaderboard(courseName, subjectName, pdfFiles) {
  const wrap = document.getElementById('material-leaderboard');
  if (!wrap) return;

  if (!pdfFiles || pdfFiles.length === 0) {
    wrap.innerHTML = '';
    return;
  }

  const db = typeof getDb === 'function' ? getDb() : null;
  if (!db) { wrap.innerHTML = ''; return; }

  wrap.innerHTML = `<div class="leaderboard-loading">Reytinqlər yüklənir...</div>`;

  const items = pdfFiles.map(p => ({
    name:  p.name,
    file:  p.file,
    id:    ratingDocId(courseName, subjectName, p.file),
    avg:   0,
    count: 0
  }));

  // Firestore 'in' sorğusu — 10-luq qruplar
  const ids    = items.map(i => i.id);
  const chunks = [];
  for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));

  try {
    const results = await Promise.all(
      chunks.map(chunk =>
        db.collection('pdf_ratings')
          .where(firebase.firestore.FieldPath.documentId(), 'in', chunk)
          .get()
      )
    );
    const byId = {};
    results.forEach(snap => snap.forEach(doc => { byId[doc.id] = doc.data(); }));

    items.forEach(it => {
      const d = byId[it.id];
      it.avg   = d?.avg   || 0;
      it.count = d?.count || 0;
    });
  } catch (e) {
    console.warn('[ratings] lider lövhəsi xətası:', e);
  }

  items.sort((a, b) => (b.avg - a.avg) || (b.count - a.count));

  wrap.innerHTML = items.map((it, idx) => `
    <div class="leaderboard-item">
      <span class="leaderboard-rank">${idx + 1}</span>
      <span class="leaderboard-name">${_ratingsEscape(it.name)}</span>
      <span class="leaderboard-stars">${it.count > 0 ? '★ ' + it.avg.toFixed(1) : '— qiymət yoxdur'}</span>
    </div>
  `).join('');
}
