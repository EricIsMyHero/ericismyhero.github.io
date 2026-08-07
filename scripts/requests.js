// ============================================================
// REQUESTS.JS  —  Material istək sistemi
// Firestore: material_requests/{id}
// ============================================================

let _reqUnsub  = null;
let _reqDocs   = [];
let _reqFilter = 'all';

// ── Köməkçilər ────────────────────────────────────────────────
function _reqEscape(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function _reqTimeAgo(date) {
  if (!date) return '';
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60)   return 'indicə';
  const min = Math.floor(sec / 60);
  if (min < 60)   return `${min} dəq əvvəl`;
  const hr = Math.floor(min / 60);
  if (hr < 24)    return `${hr} saat əvvəl`;
  const day = Math.floor(hr / 24);
  if (day < 7)    return `${day} gün əvvəl`;
  return date.toLocaleDateString('az-AZ');
}

// ── Başlat — tab açılanda çağırılır ──────────────────────────
function initMaterialRequests() {
  if (_reqUnsub) { _renderRequestsList(); return; } // dinləyici artıq aktivdir

  const db   = typeof getDb === 'function' ? getDb() : null;
  const list = document.getElementById('req-list');
  if (!db) {
    if (list) list.innerHTML = '<div class="req-empty">Yüklənə bilmədi.</div>';
    return;
  }

  _reqUnsub = db.collection('material_requests')
    .orderBy('createdAt', 'desc')
    .limit(100)
    .onSnapshot(snap => {
      _reqDocs = [];
      snap.forEach(doc => _reqDocs.push({ id: doc.id, ...doc.data() }));
      _renderRequestsList();
    }, err => {
      console.warn('[requests] dinləyici xətası:', err);
      if (list) list.innerHTML = '<div class="req-empty">Yüklənə bilmədi.</div>';
    });
}

// ── Filtr ─────────────────────────────────────────────────────
function setRequestsFilter(filter) {
  _reqFilter = filter;
  document.querySelectorAll('.req-filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === filter);
  });
  _renderRequestsList();
}

// ── Form aç / bağla ──────────────────────────────────────────
function openRequestForm() {
  if (typeof isLoggedIn !== 'function' || !isLoggedIn()) {
    if (typeof openAuthModal === 'function') openAuthModal('login');
    return;
  }
  document.getElementById('req-form')?.classList.remove('hidden');
  document.getElementById('req-text-input')?.focus();
}

function closeRequestForm() {
  document.getElementById('req-form')?.classList.add('hidden');
  const t = document.getElementById('req-text-input');
  const c = document.getElementById('req-course-input');
  const s = document.getElementById('req-subject-input');
  if (t) t.value = '';
  if (c) c.value = '';
  if (s) s.value = '';
}

// ── Göndər ────────────────────────────────────────────────────
async function submitMaterialRequest() {
  if (typeof isLoggedIn !== 'function' || !isLoggedIn()) {
    if (typeof openAuthModal === 'function') openAuthModal('login');
    return;
  }

  const textEl = document.getElementById('req-text-input');
  const text   = textEl?.value?.trim() || '';
  if (!text) { textEl?.focus(); return; }

  const course  = document.getElementById('req-course-input')?.value || '';
  const subject = document.getElementById('req-subject-input')?.value?.trim() || '';

  const db   = typeof getDb === 'function' ? getDb() : null;
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!db || !user) return;

  const profile = typeof getProfile === 'function' ? getProfile() : null;
  const name = profile?.name || user.displayName || user.email?.split('@')[0] || 'Tələbə';

  const btn = document.getElementById('req-submit-btn');
  if (btn) btn.disabled = true;

  try {
    await db.collection('material_requests').add({
      uid:        user.uid,
      name,
      text:       text.slice(0, 300),
      course,
      subject,
      status:     'open',
      upvoterIds: [],
      createdAt:  firebase.firestore.FieldValue.serverTimestamp()
    });
    closeRequestForm();
  } catch (e) {
    console.warn('[requests] göndərmə xətası:', e);
  } finally {
    if (btn) btn.disabled = false;
  }
}

// ── Siyahını render et ──────────────────────────────────────
function _renderRequestsList() {
  const list = document.getElementById('req-list');
  if (!list) return;

  let docs = _reqDocs;
  if (_reqFilter === 'open')      docs = docs.filter(d => d.status !== 'fulfilled');
  if (_reqFilter === 'fulfilled') docs = docs.filter(d => d.status === 'fulfilled');

  if (docs.length === 0) {
    list.innerHTML = '<div class="req-empty">Hələ istək yoxdur. İlk istəyi sən yaz!</div>';
    return;
  }

  const uid = (typeof getCurrentUser === 'function' && getCurrentUser()) ? getCurrentUser().uid : null;

  list.innerHTML = docs.map(d => {
    const isMine      = !!(uid && d.uid === uid);
    const isFulfilled = d.status === 'fulfilled';
    const upvoters    = d.upvoterIds || [];
    const hasUpvoted  = !!(uid && upvoters.includes(uid));
    const initial     = (d.name || '?').charAt(0).toUpperCase();
    const time        = d.createdAt?.toDate ? _reqTimeAgo(d.createdAt.toDate()) : '';

    const tags = [];
    if (d.course)  tags.push(`<span class="req-tag">${_reqEscape(d.course)}</span>`);
    if (d.subject) tags.push(`<span class="req-tag">${_reqEscape(d.subject)}</span>`);

    return `
      <div class="req-item ${isFulfilled ? 'req-item-fulfilled' : ''}">
        <div class="req-item-top">
          <span class="req-avatar">${_reqEscape(initial)}</span>
          <div class="req-meta">
            <span class="req-name">${_reqEscape(d.name || 'Tələbə')}</span>
            <span class="req-time">${time}</span>
          </div>
          <span class="req-status ${isFulfilled ? 'req-status-fulfilled' : 'req-status-open'}">
            ${isFulfilled ? '<span class="material-symbols-outlined msi">check_circle</span>Tapılıb' : '<span class="material-symbols-outlined msi">fiber_manual_record</span>Açıq'}
          </span>
        </div>
        <div class="req-text">${_reqEscape(d.text || '')}</div>
        ${tags.length ? `<div class="req-tags">${tags.join('')}</div>` : ''}
        <div class="req-actions">
          <button type="button" class="req-upvote-btn ${hasUpvoted ? 'active' : ''}" onclick="toggleRequestUpvote('${d.id}', ${hasUpvoted})">
            <span class="material-symbols-outlined msi">front_hand</span>Mən də axtarıram${upvoters.length > 0 ? ` (${upvoters.length})` : ''}
          </button>
          ${isMine && !isFulfilled ? `<button type="button" class="req-fulfill-btn" onclick="markRequestFulfilled('${d.id}')"><span class="material-symbols-outlined msi">check_circle</span>Tapıldı et</button>` : ''}
          ${isMine ? `<button type="button" class="req-delete-btn" onclick="deleteRequest('${d.id}')" aria-label="Sil">✕</button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ── Mən də axtarıram (upvote) ────────────────────────────────
async function toggleRequestUpvote(reqId, hasUpvoted) {
  if (typeof isLoggedIn !== 'function' || !isLoggedIn()) {
    if (typeof openAuthModal === 'function') openAuthModal('login');
    return;
  }
  const db   = typeof getDb === 'function' ? getDb() : null;
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!db || !user) return;

  try {
    await db.collection('material_requests').doc(reqId).update({
      upvoterIds: hasUpvoted
        ? firebase.firestore.FieldValue.arrayRemove(user.uid)
        : firebase.firestore.FieldValue.arrayUnion(user.uid)
    });
  } catch (e) {
    console.warn('[requests] upvote xətası:', e);
  }
}

// ── Tapıldı et — müəllif üçün ──────────────────────────────────
async function markRequestFulfilled(reqId) {
  const db = typeof getDb === 'function' ? getDb() : null;
  if (!db) return;
  try {
    await db.collection('material_requests').doc(reqId).update({
      status:      'fulfilled',
      fulfilledAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (e) {
    console.warn('[requests] tapıldı-et xətası:', e);
  }
}

// ── Sil — müəllif üçün ────────────────────────────────────────
async function deleteRequest(reqId) {
  const db = typeof getDb === 'function' ? getDb() : null;
  if (!db) return;
  if (!confirm('Bu istəyi silmək istəyirsən?')) return;
  try {
    await db.collection('material_requests').doc(reqId).delete();
  } catch (e) {
    console.warn('[requests] silmə xətası:', e);
  }
}
