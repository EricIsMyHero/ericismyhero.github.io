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
  if (sec < 60)   return t('reqTimeNow');
  const min = Math.floor(sec / 60);
  if (min < 60)   return t('reqTimeMin').replace('{n}', min);
  const hr = Math.floor(min / 60);
  if (hr < 24)    return t('reqTimeHour').replace('{n}', hr);
  const day = Math.floor(hr / 24);
  if (day < 7)    return t('reqTimeDay').replace('{n}', day);
  return date.toLocaleDateString(lang === 'en' ? 'en-GB' : 'az-AZ');
}

function _reqIc(name, cls) {
  return `<svg class="ic${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
}

// ── Başlat — tab açılanda çağırılır ──────────────────────────
// Firebase konfiqi şəbəkədən gəlir: birbaşa #/requests keçidində və ya səhifə
// yenilənəndə getDb() hələ hazır olmaya bilər. Dərhal "xəta" göstərmək əvəzinə
// qısa müddət (≈10 san) gözləyib yenidən cəhd edirik.
let _reqRetryTimer = null;

function initMaterialRequests() {
  clearTimeout(_reqRetryTimer);
  _reqStart(0);
}

function _reqStart(attempt) {
  if (_reqUnsub) { _renderRequestsList(); return; } // dinləyici artıq aktivdir

  const db   = typeof getDb === 'function' ? getDb() : null;
  const list = document.getElementById('req-list');
  if (!db) {
    if (attempt < 25) {
      if (attempt === 0 && list && list.querySelector('.req-empty')) {
        list.innerHTML = '<div class="req-loading skeleton skeleton-card" role="status"></div>';
      }
      _reqRetryTimer = setTimeout(() => _reqStart(attempt + 1), 400);
    } else if (list) {
      list.innerHTML = _reqStateBox('x-circle', t('appLoadFailed'));
    }
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
      if (list) list.innerHTML = _reqStateBox('x-circle', t('appLoadFailed'));
    });
}

// ── Filtr ─────────────────────────────────────────────────────
function setRequestsFilter(filter) {
  _reqFilter = filter;
  document.querySelectorAll('.req-filter-btn').forEach(b => {
    const on = b.dataset.filter === filter;
    b.classList.toggle('active', on);
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-pressed', String(on));
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
  document.getElementById('req-new-btn')?.setAttribute('aria-expanded', 'true');
  document.getElementById('req-text-input')?.focus();
}

function closeRequestForm() {
  document.getElementById('req-form')?.classList.add('hidden');
  document.getElementById('req-new-btn')?.setAttribute('aria-expanded', 'false');
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
  const name = profile?.name || user.displayName || user.email?.split('@')[0] || t('dashStudent');

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
function _reqStateBox(icon, text, sub) {
  return `<div class="req-empty">${_reqIc(icon)}<p>${_reqEscape(text)}</p>${sub ? `<small>${_reqEscape(sub)}</small>` : ''}</div>`;
}

function _renderRequestsList() {
  const list = document.getElementById('req-list');
  if (!list) return;

  let docs = _reqDocs;
  if (_reqFilter === 'open')      docs = docs.filter(d => d.status !== 'fulfilled');
  if (_reqFilter === 'fulfilled') docs = docs.filter(d => d.status === 'fulfilled');

  if (docs.length === 0) {
    list.innerHTML = _reqStateBox('folder-open', t('reqEmpty'), t('reqEmptySub'));
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
    const course      = d.course ? _reqCourseLabel(d.course) : '';

    const tags = [];
    if (course)    tags.push(`<span class="req-tag">${_reqEscape(course)}</span>`);
    if (d.subject) tags.push(`<span class="req-tag">${_reqEscape(d.subject)}</span>`);

    return `
      <article class="req-item ${isFulfilled ? 'req-item-fulfilled' : ''}">
        <div class="req-item-top">
          <span class="req-avatar" aria-hidden="true">${_reqEscape(initial)}</span>
          <div class="req-meta">
            <span class="req-name">${_reqEscape(d.name || t('dashStudent'))}</span>
            <span class="req-time">${_reqEscape(time)}</span>
          </div>
          <span class="req-status ${isFulfilled ? 'req-status-fulfilled' : 'req-status-open'}">
            ${isFulfilled ? _reqIc('circle-check') + _reqEscape(t('reqStatusFound')) : _reqIc('dot') + _reqEscape(t('reqStatusOpen'))}
          </span>
        </div>
        <p class="req-text">${_reqEscape(d.text || '')}</p>
        ${tags.length ? `<div class="req-tags">${tags.join('')}</div>` : ''}
        <div class="req-actions">
          <button type="button" class="req-upvote-btn ${hasUpvoted ? 'active' : ''}" aria-pressed="${hasUpvoted}" onclick="toggleRequestUpvote('${d.id}', ${hasUpvoted})">
            ${_reqIc('hand')}<span>${_reqEscape(t('reqUpvote'))}</span>${upvoters.length > 0 ? `<b class="req-upvote-count">${upvoters.length}</b>` : ''}
          </button>
          ${isMine && !isFulfilled ? `<button type="button" class="req-fulfill-btn" onclick="markRequestFulfilled('${d.id}')">${_reqIc('circle-check')}<span>${_reqEscape(t('reqMarkFound'))}</span></button>` : ''}
          ${isMine ? `<button type="button" class="req-delete-btn" onclick="deleteRequest('${d.id}')" aria-label="${_reqEscape(t('reqDelete'))}" title="${_reqEscape(t('reqDelete'))}">${_reqIc('trash')}</button>` : ''}
        </div>
      </article>
    `;
  }).join('');
}

// "1-ci kurs" → seçilmiş dildə
function _reqCourseLabel(course) {
  const m = /^(\d)-/.exec(course || '');
  return m ? t('dashYear' + m[1]) : course;
}

// Dil dəyişəndə siyahı yenilənsin
window.addEventListener('unec:langchange', () => { if (_reqUnsub || _reqDocs.length) _renderRequestsList(); });

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
  if (!confirm(t('reqDeleteConfirm'))) return;
  try {
    await db.collection('material_requests').doc(reqId).delete();
  } catch (e) {
    console.warn('[requests] silmə xətası:', e);
  }
}
