// ============================================================
// REQUESTS.JS  —  Material istək sistemi: siyahı + açıq yazışma (cavab, fayl əlavəsi, bildiriş)
//
// Firestore (brauzer yalnız OXUYUR):
//   material_requests/{id}                     — istək
//   material_requests/{id}/messages/{msgId}    — cavablar (mətn + fayl əlavələri)
// Yazma əməliyyatları server üzərindən gedir: POST {BACKEND}/api/push
//   req-create · req-send · file-url (R2-yə yükləmə linki) · req-delete · msg-delete
// Giriş + bildirişlərin açıq olması şərti serverdə də yoxlanılır (burada yalnız istifadəçiyə başa salınır).
// "Mən də axtarıram" və "Tapıldı et" əvvəlki kimi birbaşa Firestore-a yazır.
// ============================================================

let _reqUnsub  = null;
let _reqDocs   = [];
let _reqFilter = 'all';

// Yazışma görünüşü
let _thrId = null;            // açıq istəyin id-si (null — siyahı görünür)
let _thrUnsubReq = null;
let _thrUnsubMsgs = null;
let _thrReq = null;           // undefined/null — yüklənir, false — tapılmadı, obyekt — istək
let _thrMsgs = null;          // null — yüklənir, [] — mesaj yoxdur
let _thrFiles = [];           // seçilmiş fayllar: { file, name, key? }
let _thrBusy = false;
let _thrCfg = null;           // serverin istək konfiqurasiyası (fayl limitləri və s.)
let _thrRetryTimer = null;

const _REQ_API = ((typeof BACKEND_URL !== 'undefined' && BACKEND_URL) || 'https://ericismyhero-github-io.vercel.app') + '/api/push';
const _REQ_DEFAULT_CFG = {
  requirePush: true, files: true, maxFiles: 3, maxBytes: 10 * 1024 * 1024, textMax: 1000,
  types: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'png', 'jpg', 'jpeg', 'webp'],
};
const _REQ_IMG_EXT = ['png', 'jpg', 'jpeg', 'webp'];

// ── Köməkçilər ────────────────────────────────────────────────
function _reqEscape(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
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
function _reqWhen(ts) { return ts && ts.toDate ? _reqTimeAgo(ts.toDate()) : ''; }

function _reqIc(name, cls) {
  return `<svg class="ic${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
}
function _reqToast(msg, type) { if (window.UNEC && UNEC.toast) UNEC.toast(msg, type); }
function _reqSize(b) {
  if (!(b > 0)) return '';
  return b >= 1048576 ? (b / 1048576).toFixed(1).replace(/\.0$/, '') + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
}
function _reqExt(name) { const m = /\.([A-Za-z0-9]{1,5})$/.exec(name || ''); return m ? m[1].toLowerCase() : ''; }
function _reqSafeUrl(u) { return typeof u === 'string' && /^https:\/\//i.test(u) ? u : '#'; }
const _reqMe = () => (typeof getCurrentUser === 'function' ? getCurrentUser() : null);
const _reqDb = () => (typeof getDb === 'function' ? getDb() : null);

// ── Server ────────────────────────────────────────────────────
let _reqCfgP = null;
/** Serverin istək konfiqurasiyası (bildiriş məcburidir?, fayl dəstəyi, limitlər). Alınmasa susmaya görə dəyərlər. */
function _reqConfig() {
  if (!_reqCfgP) {
    _reqCfgP = fetch(_REQ_API).then(r => r.json()).then(j => ({ ..._REQ_DEFAULT_CFG, ...(j && j.requests ? j.requests : {}) }))
      .catch(() => { _reqCfgP = null; return { ..._REQ_DEFAULT_CFG }; });
  }
  return _reqCfgP;
}

async function _reqApi(payload) {
  const user = _reqMe();
  const idToken = user ? await user.getIdToken() : null;
  const res = await fetch(_REQ_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, idToken }) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || j.error) { const e = new Error(j.error || 'HTTP ' + res.status); e.code = j.error || 'http_' + res.status; throw e; }
  return j;
}

const _REQ_ERRORS = {
  login_required: 'rqErrLogin', push_required: 'rqErrPush', too_many_requests: 'rqErrTooMany', too_fast: 'rqErrTooFast', thread_full: 'rqErrFull',
  file_type_not_allowed: 'rqErrFileType', file_too_large: 'rqErrFileSize', file_content_mismatch: 'rqErrFileContent', file_type_mismatch: 'rqErrFileContent',
  files_disabled: 'rqErrFilesOff', request_not_found: 'rqErrNotFound', message_not_found: 'rqErrNotFound', too_many_files: 'rqErrTooManyFiles',
  empty_message: 'rqErrEmpty', text_required: 'rqErrEmpty', attachment_missing: 'rqErrUpload', attachment_invalid: 'rqErrUpload', forbidden: 'rqErrForbidden',
};
function _reqFail(e, cfg) {
  console.warn('[requests]', e);
  const key = _REQ_ERRORS[e && e.code] || 'rqErrGeneric';
  let msg = t(key);
  if (key === 'rqErrFileSize') msg = msg.replace('{mb}', Math.round(((cfg || _REQ_DEFAULT_CFG).maxBytes) / 1048576));
  if (key === 'rqErrTooManyFiles') msg = msg.replace('{n}', (cfg || _REQ_DEFAULT_CFG).maxFiles);
  _reqToast(msg, 'error');
  if (e && e.code === 'push_required') _reqRenderGates();
}

// ── Şərt: giriş + bildirişlər açıq ────────────────────────────
const _reqPushState = () => (window.UNEC && UNEC.push && UNEC.push.state) ? UNEC.push.state() : 'unsupported';

/** null — hər şey qaydasındadır; əks halda: 'login' | 'off' | 'denied' | 'ios' | 'unsupported' */
function _reqGateKind(cfg) {
  if (typeof isLoggedIn !== 'function' || !isLoggedIn()) return 'login';
  if (cfg.requirePush) { const s = _reqPushState(); if (s !== 'on') return s; }
  return null;
}

function _reqGateHtml(kind) {
  if (!kind) return '';
  const map = {
    login:       { ic: 'log-in', title: 'rqGateLoginTitle', desc: 'rqGateLoginDesc', btn: ['rqGateLoginBtn', "openAuthModal('login')"] },
    off:         { ic: 'bell',   title: 'rqGateOffTitle',   desc: 'rqGateOffDesc',   btn: ['rqGateEnable', 'reqEnablePush()'] },
    denied:      { ic: 'bell',   title: 'rqGateOffTitle',   desc: 'rqGateDeniedDesc' },
    ios:         { ic: 'bell',   title: 'rqGateOffTitle',   desc: 'rqGateIosDesc' },
    unsupported: { ic: 'info',   title: 'rqGateOffTitle',   desc: 'rqGateUnsupportedDesc' },
  };
  const g = map[kind];
  const btn = g.btn ? `<button type="button" class="btn btn--primary btn--sm" onclick="${g.btn[1]}">${_reqEscape(t(g.btn[0]))}</button>` : '';
  return `<div class="req-gate" role="status" data-gate="${kind}"><span class="req-gate-ic">${_reqIc(g.ic)}</span><div class="req-gate-text"><b>${_reqEscape(t(g.title))}</b><small>${_reqEscape(t(g.desc))}</small></div>${btn}</div>`;
}

/** Yalnız "Material İstəkləri" ekranı açıqkən işləyir — başqa ekranlarda serverə sorğu getməsin */
const _reqActive = () => !!(window.UNEC && UNEC.route && UNEC.route.tab === 'requests');

async function _reqRenderGates() {
  if (!_reqActive()) return;
  const cfg = await _reqConfig();
  const kind = _reqGateKind(cfg);
  const html = _reqGateHtml(kind);
  const fg = document.getElementById('req-form-gate');
  if (fg) fg.innerHTML = html;
  const sub = document.getElementById('req-submit-btn');
  if (sub) sub.disabled = !!kind || _thrBusy;
  const cg = document.getElementById('req-composer-gate');
  if (cg) cg.innerHTML = html;
  const cb = document.getElementById('req-composer-body');
  if (cb) cb.classList.toggle('is-gated', !!kind);
  const send = document.getElementById('req-send-btn');
  if (send) send.disabled = !!kind || _thrBusy;
}

async function reqEnablePush() {
  if (window.UNEC && UNEC.push && UNEC.push.enable) await UNEC.push.enable();
  if (window.UNEC && UNEC.push && UNEC.push.sync) { try { await UNEC.push.sync(); } catch (e) { /* aşağıdakı serverin cavabı həll edər */ } }
  _reqRenderGates();
}

// ── Başlat — tab açılanda çağırılır ──────────────────────────
// Firebase konfiqi şəbəkədən gəlir: birbaşa #/requests keçidində və ya səhifə
// yenilənəndə getDb() hələ hazır olmaya bilər. Dərhal "xəta" göstərmək əvəzinə
// qısa müddət (≈10 san) gözləyib yenidən cəhd edirik.
let _reqRetryTimer = null;

function initMaterialRequests() {
  clearTimeout(_reqRetryTimer);
  const r = (window.UNEC && UNEC.route) || {};
  if (r.view === 'thread' && r.id) { _thrOpen(r.id); return; }
  _thrClose();
  _reqShowView('list');
  _reqStart(0);
  _reqRenderGates();
}

function _reqShowView(which) {
  document.getElementById('req-list-view')?.classList.toggle('hidden', which !== 'list');
  document.getElementById('req-thread-view')?.classList.toggle('hidden', which !== 'thread');
}

function _reqStart(attempt) {
  if (_reqUnsub) { _renderRequestsList(); return; } // dinləyici artıq aktivdir

  const db   = _reqDb();
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
  _reqRenderGates();
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
  const cfg = await _reqConfig();
  const gate = _reqGateKind(cfg);
  if (gate === 'login') { if (typeof openAuthModal === 'function') openAuthModal('login'); return; }
  if (gate) { _reqRenderGates(); return; }

  const textEl = document.getElementById('req-text-input');
  const text   = textEl?.value?.trim() || '';
  if (!text) { textEl?.focus(); return; }
  const course  = document.getElementById('req-course-input')?.value || '';
  const subject = document.getElementById('req-subject-input')?.value?.trim() || '';

  const btn = document.getElementById('req-submit-btn');
  if (btn) btn.disabled = true;
  try {
    if (window.UNEC && UNEC.push && UNEC.push.sync) await UNEC.push.sync();   // cihazın hesabla bağlı olduğundan əmin ol
    await _reqApi({ action: 'req-create', text, course, subject });
    closeRequestForm();
    _reqToast(t('rqToastReqSent'));
  } catch (e) {
    _reqFail(e, cfg);
  } finally {
    if (btn) btn.disabled = false;
    _reqRenderGates();
  }
}

// ── Siyahını render et ──────────────────────────────────────
function _reqStateBox(icon, text, sub) {
  return `<div class="req-empty">${_reqIc(icon)}<p>${_reqEscape(text)}</p>${sub ? `<small>${_reqEscape(sub)}</small>` : ''}</div>`;
}

/** İstək kartı (siyahıda və yazışmanın başlığında eyni). `thread` — yazışma səhifəsidir: "Cavablar" düyməsi yoxdur. */
function _reqCardHtml(d, thread) {
  const uid = _reqMe() ? _reqMe().uid : null;
  const isMine      = !!(uid && d.uid === uid);
  const isFulfilled = d.status === 'fulfilled';
  const upvoters    = d.upvoterIds || [];
  const hasUpvoted  = !!(uid && upvoters.includes(uid));
  const initial     = (d.name || '?').charAt(0).toUpperCase();
  const time        = _reqWhen(d.createdAt);
  const course      = d.course ? _reqCourseLabel(d.course) : '';
  const count       = Number.isInteger(d.msgCount) && d.msgCount > 0 ? d.msgCount : 0;

  const tags = [];
  if (course)    tags.push(`<span class="req-tag">${_reqEscape(course)}</span>`);
  if (d.subject) tags.push(`<span class="req-tag">${_reqEscape(d.subject)}</span>`);

  const replies = thread ? '' : `
          <a class="req-replies-btn" href="#/requests/${_reqEscape(d.id)}">${_reqIc('message')}<span>${_reqEscape(count ? t('rqRepliesN').replace('{n}', count) : t('rqWriteReply'))}</span></a>`;

  return `
      <article class="req-item ${isFulfilled ? 'req-item-fulfilled' : ''}" data-req-id="${_reqEscape(d.id)}">
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
        <div class="req-actions">${replies}
          <button type="button" class="req-upvote-btn ${hasUpvoted ? 'active' : ''}" aria-pressed="${hasUpvoted}" onclick="toggleRequestUpvote('${_reqEscape(d.id)}', ${hasUpvoted})">
            ${_reqIc('hand')}<span>${_reqEscape(t('reqUpvote'))}</span>${upvoters.length > 0 ? `<b class="req-upvote-count">${upvoters.length}</b>` : ''}
          </button>
          ${isMine && !isFulfilled ? `<button type="button" class="req-fulfill-btn" onclick="markRequestFulfilled('${_reqEscape(d.id)}')">${_reqIc('circle-check')}<span>${_reqEscape(t('reqMarkFound'))}</span></button>` : ''}
          ${isMine ? `<button type="button" class="req-delete-btn" onclick="deleteRequest('${_reqEscape(d.id)}')" aria-label="${_reqEscape(t('reqDelete'))}" title="${_reqEscape(t('reqDelete'))}">${_reqIc('trash')}</button>` : ''}
        </div>
      </article>`;
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
  list.innerHTML = docs.map(d => _reqCardHtml(d, false)).join('');
}

// "1-ci kurs" → seçilmiş dildə
function _reqCourseLabel(course) {
  const m = /^(\d)-/.exec(course || '');
  return m ? t('dashYear' + m[1]) : course;
}

// Dil / giriş / bildiriş vəziyyəti dəyişəndə ekran yenilənsin
window.addEventListener('unec:langchange', () => {
  if (_reqUnsub || _reqDocs.length) _renderRequestsList();
  if (_thrId) { _thrRenderHead(); _thrRenderMsgs(); _thrRenderFiles(); _thrRenderHint(); }
  _reqRenderGates();
});
window.addEventListener('unec:authchange', () => {
  if (_reqUnsub || _reqDocs.length) _renderRequestsList();
  if (_thrId) { _thrRenderHead(); _thrRenderMsgs(); }
  _reqRenderGates();
});
window.addEventListener('unec:pushchange', _reqRenderGates);

// ── Mən də axtarıram (upvote) ────────────────────────────────
async function toggleRequestUpvote(reqId, hasUpvoted) {
  if (typeof isLoggedIn !== 'function' || !isLoggedIn()) {
    if (typeof openAuthModal === 'function') openAuthModal('login');
    return;
  }
  const db   = _reqDb();
  const user = _reqMe();
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
  const db = _reqDb();
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

// ── Sil — müəllif üçün (server: cavabları və faylları da silir) ─
async function deleteRequest(reqId) {
  if (!confirm(t('reqDeleteConfirm'))) return;
  try {
    await _reqApi({ action: 'req-delete', requestId: reqId });
  } catch (e) {
    _reqFail(e);
  }
}

// ============================================================
// YAZIŞMA (#/requests/<id>)
// ============================================================
function _thrOpen(id) {
  _reqShowView('thread');
  if (_thrId !== id) {
    _thrCloseListeners();
    _thrId = id; _thrReq = null; _thrMsgs = null; _thrFiles = [];
    const ta = document.getElementById('req-msg-input'); if (ta) ta.value = '';
    _thrSetStatus('');
  }
  _thrRenderHead(); _thrRenderMsgs(); _thrRenderFiles();
  _thrListen(0);
  _reqRenderGates();
  _reqConfig().then(cfg => {
    _thrCfg = cfg;
    const ta = document.getElementById('req-msg-input'); if (ta) ta.maxLength = cfg.textMax;
    const fi = document.getElementById('req-file-input'); if (fi) fi.accept = cfg.types.map(x => '.' + x).join(',');
    document.getElementById('req-attach-btn')?.toggleAttribute('hidden', !cfg.files);
    _thrRenderHint();
  });
}

/** Fayl qaydaları haqqında qısa izah (dil dəyişəndə yenilənir) */
function _thrRenderHint() {
  const hint = document.getElementById('req-file-hint');
  if (!hint || !_thrCfg) return;
  hint.textContent = _thrCfg.files ? t('rqFileHint').replace('{mb}', Math.round(_thrCfg.maxBytes / 1048576)).replace('{n}', _thrCfg.maxFiles) : t('rqErrFilesOff');
}

function _thrCloseListeners() {
  clearTimeout(_thrRetryTimer);
  if (_thrUnsubReq) { _thrUnsubReq(); _thrUnsubReq = null; }
  if (_thrUnsubMsgs) { _thrUnsubMsgs(); _thrUnsubMsgs = null; }
}
function _thrClose() { _thrCloseListeners(); _thrId = null; _thrReq = null; _thrMsgs = null; }

function _thrListen(attempt) {
  if (_thrUnsubReq || !_thrId) return;
  const db = _reqDb();
  if (!db) {
    if (attempt < 25) _thrRetryTimer = setTimeout(() => _thrListen(attempt + 1), 400);
    else { _thrReq = false; _thrRenderHead(); }
    return;
  }
  const id = _thrId;
  const ref = db.collection('material_requests').doc(id);
  _thrUnsubReq = ref.onSnapshot(snap => {
    if (_thrId !== id) return;
    _thrReq = snap.exists ? { id: snap.id, ...snap.data() } : false;
    _thrRenderHead();
  }, err => { console.warn('[requests] istək dinləyicisi:', err); if (_thrId === id) { _thrReq = false; _thrRenderHead(); } });

  _thrUnsubMsgs = ref.collection('messages').orderBy('createdAt', 'asc').limit(300).onSnapshot(snap => {
    if (_thrId !== id) return;
    const first = _thrMsgs === null;
    const prev = _thrMsgs ? _thrMsgs.length : 0;
    _thrMsgs = [];
    snap.forEach(doc => _thrMsgs.push({ id: doc.id, ...doc.data() }));
    const me = _reqMe();
    const last = _thrMsgs[_thrMsgs.length - 1];
    _thrRenderMsgs(first || (last && me && last.uid === me.uid) || _thrNearBottom() ? (_thrMsgs.length > prev) : false);
  }, err => {
    console.warn('[requests] mesaj dinləyicisi:', err);
    if (_thrId !== id) return;
    _thrMsgs = false;                                  // yükləmə xətası (adətən Firestore qaydaları — REQUESTS-SETUP.md)
    _thrRenderMsgs();
  });
}

function _thrNearBottom() { return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 160; }

function _thrRenderHead() {
  const box = document.getElementById('req-thread-head');
  if (!box) return;
  if (_thrReq === null) { box.innerHTML = '<div class="req-loading skeleton skeleton-card" role="status"></div>'; return; }
  if (_thrReq === false) {
    box.innerHTML = _reqStateBox('x-circle', t('rqRequestGone')) + `<a class="btn btn--secondary btn--sm req-gone-back" href="#/requests">${_reqEscape(t('rqBackToList'))}</a>`;
    document.getElementById('req-composer')?.classList.add('hidden');
    return;
  }
  document.getElementById('req-composer')?.classList.remove('hidden');
  box.innerHTML = _reqCardHtml(_thrReq, true);
}

function _thrMsgHtml(m, me) {
  const mine = !!(me && m.uid === me.uid);
  const owner = m.role === 'owner';
  const atts = (Array.isArray(m.attachments) ? m.attachments : []).map(a => {
    if (!a) return '';
    const url = _reqSafeUrl(a.url), name = a.name || 'file', ext = _reqExt(name);
    if (_REQ_IMG_EXT.includes(ext)) return `<a class="req-att req-att--img" href="${_reqEscape(url)}" target="_blank" rel="noopener noreferrer" title="${_reqEscape(name)}"><img src="${_reqEscape(url)}" alt="${_reqEscape(name)}" loading="lazy"></a>`;
    return `<a class="req-att" href="${_reqEscape(url)}" target="_blank" rel="noopener noreferrer">${_reqIc('file-text')}<span class="req-att-name">${_reqEscape(name)}</span><small>${_reqEscape(_reqSize(a.size))}</small></a>`;
  }).join('');
  return `
      <article class="req-msg ${mine ? 'req-msg--mine' : ''} ${owner ? 'req-msg--owner' : ''}" data-msg-id="${_reqEscape(m.id)}">
        <span class="req-avatar" aria-hidden="true">${_reqEscape((m.name || '?').charAt(0).toUpperCase())}</span>
        <div class="req-msg-body">
          <div class="req-msg-head">
            <span class="req-name">${_reqEscape(mine ? t('rqYou') : (m.name || t('dashStudent')))}</span>
            ${owner ? `<span class="req-owner-badge">${_reqEscape(t('rqOwnerBadge'))}</span>` : ''}
            <span class="req-time">${_reqEscape(_reqWhen(m.createdAt))}</span>
            ${mine ? `<button type="button" class="req-msg-del" onclick="deleteThreadMessage('${_reqEscape(m.id)}')" aria-label="${_reqEscape(t('rqDeleteMsg'))}" title="${_reqEscape(t('rqDeleteMsg'))}">${_reqIc('trash')}</button>` : ''}
          </div>
          ${m.text ? `<p class="req-msg-text">${_reqEscape(m.text)}</p>` : ''}
          ${atts ? `<div class="req-atts">${atts}</div>` : ''}
        </div>
      </article>`;
}

function _thrRenderMsgs(scrollToEnd) {
  const box = document.getElementById('req-thread-msgs');
  if (!box) return;
  if (_thrMsgs === null) { box.innerHTML = '<div class="req-loading skeleton skeleton-card" role="status"></div>'; return; }
  if (_thrMsgs === false) { box.innerHTML = _reqStateBox('x-circle', t('rqThreadLoadFailed')); return; }
  if (!_thrMsgs.length) { box.innerHTML = _reqStateBox('message', t('rqThreadEmpty'), t('rqThreadEmptySub')); return; }
  const me = _reqMe();
  box.innerHTML = _thrMsgs.map(m => _thrMsgHtml(m, me)).join('');
  if (scrollToEnd) box.lastElementChild?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

// ── Fayl seçimi ───────────────────────────────────────────────
function _thrSetStatus(msg, isErr) {
  const el = document.getElementById('req-send-status');
  if (!el) return;
  el.textContent = msg || '';
  el.classList.toggle('is-error', !!isErr);
}

function _thrRenderFiles() {
  const box = document.getElementById('req-files');
  if (!box) return;
  box.innerHTML = _thrFiles.map((f, i) => `
      <span class="req-file-chip">${_reqIc('file-text')}<span class="req-att-name">${_reqEscape(f.name)}</span><small>${_reqEscape(_reqSize(f.file.size))}</small>
        <button type="button" onclick="removeThreadFile(${i})" aria-label="${_reqEscape(t('rqRemoveFile'))}" ${_thrBusy ? 'disabled' : ''}>${_reqIc('x')}</button></span>`).join('');
}

async function pickThreadFiles(input) {
  const cfg = await _reqConfig();
  const picked = Array.from(input.files || []);
  input.value = '';                                    // eyni faylı yenidən seçmək mümkün olsun
  for (const file of picked) {
    if (_thrFiles.length >= cfg.maxFiles) { _reqToast(t('rqErrTooManyFiles').replace('{n}', cfg.maxFiles), 'error'); break; }
    if (!cfg.types.includes(_reqExt(file.name))) { _reqToast(t('rqErrFileType'), 'error'); continue; }
    if (file.size > cfg.maxBytes) { _reqToast(t('rqErrFileSize').replace('{mb}', Math.round(cfg.maxBytes / 1048576)), 'error'); continue; }
    if (!(file.size > 0)) continue;
    _thrFiles.push({ file, name: file.name });
  }
  _thrRenderFiles();
}

function removeThreadFile(i) {
  if (_thrBusy) return;
  _thrFiles.splice(i, 1);
  _thrRenderFiles();
}

// ── Mesaj göndər ──────────────────────────────────────────────
async function sendThreadMessage() {
  if (_thrBusy || !_thrId) return;
  const cfg = await _reqConfig();
  const gate = _reqGateKind(cfg);
  if (gate === 'login') { if (typeof openAuthModal === 'function') openAuthModal('login'); return; }
  if (gate) { _reqRenderGates(); return; }

  const ta = document.getElementById('req-msg-input');
  const text = (ta && ta.value || '').trim();
  if (!text && !_thrFiles.length) { _thrSetStatus(t('rqErrEmpty'), true); ta?.focus(); return; }

  const id = _thrId;
  _thrBusy = true; _reqRenderGates(); _thrRenderFiles(); _thrSetStatus(t('rqSending'));
  try {
    if (window.UNEC && UNEC.push && UNEC.push.sync) await UNEC.push.sync();
    const attachments = [];
    for (let i = 0; i < _thrFiles.length; i++) {
      const f = _thrFiles[i];
      if (!f.key) {
        _thrSetStatus(t('rqUploading').replace('{i}', i + 1).replace('{n}', _thrFiles.length));
        const info = await _reqApi({ action: 'file-url', requestId: id, name: f.file.name, size: f.file.size });
        let put;
        try { put = await fetch(info.uploadUrl, { method: 'PUT', headers: { 'Content-Type': info.contentType }, body: f.file }); }
        catch (e) { const err = new Error('upload_failed'); err.code = 'attachment_missing'; throw err; }
        if (!put.ok) { const err = new Error('upload_failed'); err.code = 'attachment_missing'; throw err; }
        f.key = info.key; f.serverName = info.name;
      }
      attachments.push({ key: f.key, name: f.serverName || f.name });
    }
    _thrSetStatus(t('rqSending'));
    await _reqApi({ action: 'req-send', requestId: id, text, attachments });
    if (_thrId === id) { if (ta) ta.value = ''; _thrFiles = []; }
    _thrSetStatus('');
    _reqToast(t('rqToastSent'));
  } catch (e) {
    _thrFiles.forEach(f => { delete f.key; });         // server yüklənmiş faylı rədd etmiş ola bilər → növbəti cəhddə yenidən yüklənsin
    _thrSetStatus('');
    _reqFail(e, cfg);
  } finally {
    _thrBusy = false; _reqRenderGates(); _thrRenderFiles();
  }
}

async function deleteThreadMessage(msgId) {
  if (!_thrId || !confirm(t('rqDeleteMsgConfirm'))) return;
  try { await _reqApi({ action: 'msg-delete', requestId: _thrId, messageId: msgId }); }
  catch (e) { _reqFail(e); }
}
