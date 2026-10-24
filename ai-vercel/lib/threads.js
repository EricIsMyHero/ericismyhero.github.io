// lib/threads.js
// Material istəkləri üçün yazışma sistemi: istək yaratmaq, cavab yazmaq (fayl əlavəsi ilə), bildiriş, silmə + admin baxışı.
//
// Niyə server üzərindən? (1) giriş + bildiriş şərtini ancaq server məcbur edə bilər; (2) bildirişi göndərmək üçün FCM service account lazımdır;
// (3) fayl yoxlaması (növ, ölçü, əsl məzmun) brauzerə etibar etmədən aparılır.
// Brauzer yalnız OXUYUR (Firestore qaydaları: material_requests/{id}/messages → read: true, write: false).
//
// Firestore:
//   material_requests/{id}            — mövcud sənəd + yeni sahələr: msgCount, lastMessageAt, lastMessageBy
//   material_requests/{id}/messages/{msgId} — { uid, name, role: 'owner'|'helper', text, attachments: [{name,key,url,size,type}], createdAt }
//   push_log/{id}                     — hər avtomatik bildiriş üçün qeyd (kind: 'request-message'); admin paneldə görünür
// Fayllar: R2 → request-files/{requestId}/{uid}/{32 hex}.{uzantı}
import crypto from 'node:crypto';
import { verifyIdToken } from './payments.js';
import { getDoc, createDoc, deleteDoc, listDocs, runQuery, commitUpdate } from './firestore.js';
import { LOG_COLLECTION, cleanText, listTokens, sendMany, pushEnabled, siteUrl } from './push.js';
import { r2Enabled, presignPut, publicUrl, r2Head, r2Range, r2Delete, sniffOk } from './r2.js';

export const REQUESTS = 'material_requests';
export const LIMITS = {
  text: 1000,            // cavabın uzunluğu
  requestText: 300,      // istəyin uzunluğu (əvvəlki limit)
  subject: 80,
  maxFiles: 3,           // bir mesajda
  maxBytes: 10 * 1024 * 1024,
  maxMessages: 300,      // bir istəkdə
  burst: 5,              // 1 dəqiqədə bir istifadəçinin bir istəkdə yaza biləcəyi mesaj sayı
  requestsPerHour: 5,    // 1 saatda bir istifadəçinin yarada biləcəyi istək sayı
  urlTtl: 600,           // yükləmə linkinin ömrü (san.)
};
/** İcazə verilən fayl növləri (video, arxiv, icra olunan fayl, svg/html yoxdur). */
export const FILE_TYPES = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  txt: 'text/plain',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};
const COURSES = ['1-ci kurs', '2-ci kurs', '3-cü kurs', '4-cü kurs'];
const REQ_ID_RE = /^[A-Za-z0-9]{10,40}$/;
const MSG_ID_RE = /^[0-9a-z]{9,30}$/;

// Əməliyyat adları api/push.js-dədir (modul yüklənməsə belə düzgün cavab verə bilsin deyə).

// ── Kiçik köməkçilər ──────────────────────────────────────────
const ok = (json) => ({ status: 200, json });
const fail = (status, error, extra = {}) => ({ status, json: { error, ...extra } });
const randHex = (n) => crypto.randomBytes(n).toString('hex');
const ALNUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const autoId = () => Array.from(crypto.randomBytes(20), b => ALNUM[b % ALNUM.length]).join('');
const msgId = () => Date.now().toString(36).padStart(9, '0') + randHex(4);   // vaxta görə sıralanır
const reEsc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const tsMs = (v) => { const t = Date.parse(v); return Number.isFinite(t) ? t : 0; };

/** Konfiqurasiya (ictimai): sayt bunu GET /api/push cavabından oxuyur. */
export function requirePush(env = process.env) { return pushEnabled(env) && env.REQUESTS_REQUIRE_PUSH !== '0'; }
export function threadsConfig(env = process.env) {
  return {
    requirePush: requirePush(env),
    files: r2Enabled(env),
    maxFiles: LIMITS.maxFiles,
    maxBytes: LIMITS.maxBytes,
    types: Object.keys(FILE_TYPES),
    textMax: LIMITS.text,
  };
}

export function cleanFileName(v) {
  if (typeof v !== 'string') return '';
  let s = v.normalize('NFC').split(/[\\/]/).pop();
  s = s.replace(/[\u0000-\u001f\u007f<>:"|?*]/g, ' ').replace(/\s+/g, ' ').trim();
  if (s.length > 80) {
    const dot = s.lastIndexOf('.');
    const ext = dot > 0 && s.length - dot <= 6 ? s.slice(dot) : '';
    s = s.slice(0, 80 - ext.length).trim() + ext;
  }
  return s;
}
export const extOf = (name) => { const m = /\.([A-Za-z0-9]{1,5})$/.exec(name || ''); return m ? m[1].toLowerCase() : ''; };

async function authUser(b, env) {
  const u = await verifyIdToken(b.idToken, env);
  return u && u.uid ? u : null;
}

async function displayName(u, env) {
  let name = '';
  try { const doc = await getDoc(`users/${u.uid}`, env); name = doc && doc.data && doc.data.name; } catch (_) { /* aşağıda ehtiyat ad */ }
  return cleanText(name || u.name || (u.email ? u.email.split('@')[0] : '') || 'Tələbə', 60) || 'Tələbə';
}

/** "Bildiriş açıq olmalıdır" şərti: istifadəçinin hesabına bağlı ən azı bir cihaz tokeni. */
async function hasPushDevice(uid, env) {
  if (!requirePush(env)) return true;
  return (await listTokens({ uid }, env)).length > 0;
}

async function listAll(path, cap, env) {
  const out = [];
  let pageToken = null;
  do {
    const page = await listDocs(path, { pageSize: 300, pageToken }, env);
    out.push(...page.docs);
    pageToken = page.nextPageToken;
  } while (pageToken && out.length < cap);
  return out;
}
const toMessage = (d) => ({
  id: d.id, uid: d.data.uid || '', name: d.data.name || '', role: d.data.role || 'helper', text: d.data.text || '',
  attachments: Array.isArray(d.data.attachments) ? d.data.attachments : [], createdAt: d.data.createdAt || null,
});

async function loadRequest(id, env) {
  if (typeof id !== 'string' || !REQ_ID_RE.test(id)) return null;
  const doc = await getDoc(`${REQUESTS}/${id}`, env);
  return doc ? { id: doc.id, ...doc.data } : null;
}

// ── Fayl yükləmə linki ────────────────────────────────────────
async function fileUrl(b, env) {
  const u = await authUser(b, env);
  if (!u) return fail(401, 'login_required');
  if (!r2Enabled(env)) return fail(503, 'files_disabled');
  const request = await loadRequest(b.requestId, env);
  if (!request) return fail(404, 'request_not_found');
  if (!(await hasPushDevice(u.uid, env))) return fail(403, 'push_required');

  const name = cleanFileName(b.name);
  const ext = extOf(name);
  if (!FILE_TYPES[ext]) return fail(400, 'file_type_not_allowed');
  const size = Number(b.size);
  if (!Number.isInteger(size) || size < 1) return fail(400, 'invalid_size');
  if (size > LIMITS.maxBytes) return fail(400, 'file_too_large');

  const key = `request-files/${request.id}/${u.uid}/${randHex(16)}.${ext}`;
  const contentType = FILE_TYPES[ext];
  return ok({ uploadUrl: presignPut(key, contentType, { expires: LIMITS.urlTtl }, env), key, url: publicUrl(key, env), contentType, name, expiresIn: LIMITS.urlTtl });
}

// ── Yeni istək ────────────────────────────────────────────────
async function reqCreate(b, env) {
  const u = await authUser(b, env);
  if (!u) return fail(401, 'login_required');
  if (!(await hasPushDevice(u.uid, env))) return fail(403, 'push_required');

  const text = cleanText(b.text, LIMITS.requestText, true);
  if (!text) return fail(400, 'text_required');
  const course = COURSES.includes(b.course) ? b.course : '';
  const subject = cleanText(b.subject, LIMITS.subject);

  const mine = await runQuery({
    from: [{ collectionId: REQUESTS }],
    where: { fieldFilter: { field: { fieldPath: 'uid' }, op: 'EQUAL', value: { stringValue: u.uid } } },
    limit: 50,
  }, env);
  const hourAgo = Date.now() - 3600 * 1000;
  if (mine.filter(r => tsMs(r.data.createdAt) > hourAgo).length >= LIMITS.requestsPerHour) return fail(429, 'too_many_requests');

  const id = autoId();
  const name = await displayName(u, env);
  await createDoc(REQUESTS, id, {
    uid: u.uid, name, text, course, subject, status: 'open', upvoterIds: [], msgCount: 0, createdAt: new Date(), lastMessageAt: null,
  }, env);
  return ok({ ok: true, id });
}

// ── Cavab / mesaj ─────────────────────────────────────────────
/** Əlavələri yoxla: açar bizim verdiyimiz formada olmalı, R2-də mövcud, ölçü/növ/ilk baytlar uyğun. Uyğunsuz fayl silinir. */
async function checkAttachments(list, request, uid, usedKeys, env) {
  const out = [];
  for (const a of list) {
    const key = a && typeof a.key === 'string' ? a.key : '';
    const m = new RegExp(`^request-files/${reEsc(request.id)}/${reEsc(uid)}/[0-9a-f]{32}\\.([a-z0-9]{2,4})$`).exec(key);
    if (!m || !FILE_TYPES[m[1]]) return { error: fail(400, 'attachment_invalid') };
    if (usedKeys.has(key)) return { error: fail(400, 'attachment_invalid') };
    const ext = m[1];
    const head = await r2Head(key, env);
    if (!head.exists) return { error: fail(400, 'attachment_missing') };
    const bad = async (code) => { await r2Delete(key, env).catch(() => {}); return { error: fail(400, code) }; };
    if (head.size < 1 || head.size > LIMITS.maxBytes) return bad('file_too_large');
    if (head.contentType.split(';')[0].trim() !== FILE_TYPES[ext]) return bad('file_type_mismatch');
    if (!sniffOk(ext, await r2Range(key, 512, env))) return bad('file_content_mismatch');
    const name = cleanFileName(a.name) || `file.${ext}`;
    out.push({ name: extOf(name) === ext ? name : `${name}.${ext}`.slice(-80), key, url: publicUrl(key, env), size: head.size, type: FILE_TYPES[ext] });
  }
  return { attachments: out };
}

const TEXTS = {
  az: {
    toOwner: 'Sənin istəyinə cavab gəldi',
    toPeer: 'İstək yazışmasında yeni mesaj',
    file: (n) => `📎 ${n} fayl göndərdi`,
  },
  en: {
    toOwner: 'New reply to your request',
    toPeer: 'New message in a request you replied to',
    file: (n) => `📎 sent ${n} file${n > 1 ? 's' : ''}`,
  },
};
function snippet(text, files, lang) {
  const t = cleanText(text, 120);
  if (t) return files ? `${t} 📎` : t;
  return TEXTS[lang].file(files);
}

/** Bir istifadəçinin bütün cihazlarına bildiriş (dilə görə qruplanır) + push_log qeydi. Heç vaxt istisna atmır. */
async function notifyUser({ toUid, toName, kind, requestId, messageId, from, text, files }, env) {
  const stats = { devices: 0, sent: 0, failed: 0, removed: 0, errors: {} };
  const url = `${siteUrl(env)}/#/requests/${requestId}`;
  const titles = {};
  try {
    const items = await listTokens({ uid: toUid }, env);
    stats.devices = items.length;
    for (const lang of ['az', 'en']) {
      const group = items.filter(x => x.lang === lang);
      titles[lang] = kind === 'owner' ? TEXTS[lang].toOwner : TEXTS[lang].toPeer;
      if (!group.length) continue;
      const body = cleanText(`${from.name}: ${snippet(text, files, lang)}`, 240, true);
      const r = await sendMany(group, { title: titles[lang], body, url }, {});
      stats.sent += r.sent; stats.failed += r.failed; stats.removed += r.removed;
      for (const [k, v] of Object.entries(r.errors)) stats.errors[k] = (stats.errors[k] || 0) + v;
    }
  } catch (e) {
    console.warn('[threads] bildiriş xətası:', e.message);
    stats.failed += Math.max(stats.devices - stats.sent - stats.removed, 1);
    stats.errors.SERVER = (stats.errors.SERVER || 0) + 1;
  }
  try {
    await createDoc(LOG_COLLECTION, Date.now().toString(36) + randHex(3), {
      kind: 'request-message', audience: 'request', requestId, messageId,
      fromUid: from.uid, fromName: from.name, toUid, toName: toName || '', recipientRole: kind,
      title: titles.az || TEXTS.az.toOwner, body: cleanText(`${from.name}: ${snippet(text, files, 'az')}`, 240, true), url,
      total: stats.devices, devices: stats.devices, sent: stats.sent, failed: stats.failed, removed: stats.removed,
      errors: JSON.stringify(stats.errors), createdAt: new Date(),
    }, env);
  } catch (e) { console.warn('[threads] jurnal yazılmadı:', e.message); }
  return stats;
}

async function reqSend(b, env) {
  const u = await authUser(b, env);
  if (!u) return fail(401, 'login_required');
  const request = await loadRequest(b.requestId, env);
  if (!request) return fail(404, 'request_not_found');
  if (!(await hasPushDevice(u.uid, env))) return fail(403, 'push_required');

  const text = cleanText(b.text, LIMITS.text, true);
  const files = Array.isArray(b.attachments) ? b.attachments : [];
  if (files.length > LIMITS.maxFiles) return fail(400, 'too_many_files');
  if (!text && !files.length) return fail(400, 'empty_message');
  if (files.length && !r2Enabled(env)) return fail(503, 'files_disabled');

  const msgs = (await listAll(`${REQUESTS}/${request.id}/messages`, LIMITS.maxMessages + 1, env)).map(toMessage);
  if (msgs.length >= LIMITS.maxMessages) return fail(409, 'thread_full');
  const minuteAgo = Date.now() - 60 * 1000;
  if (msgs.filter(m => m.uid === u.uid && tsMs(m.createdAt) > minuteAgo).length >= LIMITS.burst) return fail(429, 'too_fast');

  const used = new Set(msgs.flatMap(m => m.attachments.map(a => a && a.key)));
  const checked = await checkAttachments(files, request, u.uid, used, env);
  if (checked.error) return checked.error;

  const isOwner = request.uid === u.uid;
  const name = await displayName(u, env);
  const id = msgId();
  await createDoc(`${REQUESTS}/${request.id}/messages`, id, {
    uid: u.uid, name, role: isOwner ? 'owner' : 'helper', text, attachments: checked.attachments, createdAt: new Date(),
  }, env);
  try { await commitUpdate(`${REQUESTS}/${request.id}`, { lastMessageBy: u.uid }, { increments: { msgCount: 1 }, serverTimes: ['lastMessageAt'] }, env); }
  catch (e) { console.warn('[threads] sayğac yenilənmədi:', e.message); }

  // Kimə bildiriş? İstək sahibi yazmayıbsa → ona. Sahibi yazıbsa → əvvəl yazmış digər iştirakçılara. Müəllifin özünə getmir.
  let recipients;
  if (!isOwner) recipients = [{ uid: request.uid, name: request.name, kind: 'owner' }];
  else {
    const seen = new Map();
    for (const m of msgs) if (m.uid && m.uid !== request.uid && m.uid !== u.uid && !seen.has(m.uid)) seen.set(m.uid, m.name);
    recipients = [...seen].map(([uid, n]) => ({ uid, name: n, kind: 'peer' }));
  }
  const from = { uid: u.uid, name };
  let devices = 0, sent = 0;
  if (pushEnabled(env)) {
    for (const r of recipients) {
      const s = await notifyUser({ toUid: r.uid, toName: r.name, kind: r.kind, requestId: request.id, messageId: id, from, text, files: checked.attachments.length }, env);
      devices += s.devices; sent += s.sent;
    }
  }
  return ok({ ok: true, id, notified: { recipients: recipients.length, devices, sent } });
}

// ── Silmə ─────────────────────────────────────────────────────
async function removeMessage(requestId, msg, env, { decrement = true } = {}) {
  for (const a of msg.attachments || []) if (a && typeof a.key === 'string' && a.key.startsWith(`request-files/${requestId}/`)) await r2Delete(a.key, env).catch(() => {});
  await deleteDoc(`${REQUESTS}/${requestId}/messages/${msg.id}`, env);
  if (decrement) { try { await commitUpdate(`${REQUESTS}/${requestId}`, { updatedAt: new Date() }, { increments: { msgCount: -1 } }, env); } catch (_) { /* istək silinib */ } }
}
async function removeRequest(request, env) {
  const msgs = (await listAll(`${REQUESTS}/${request.id}/messages`, 1000, env)).map(toMessage);
  for (const m of msgs) await removeMessage(request.id, m, env, { decrement: false });
  await deleteDoc(`${REQUESTS}/${request.id}`, env);
  return msgs.length;
}

async function msgDelete(b, env, { admin = false } = {}) {
  let u = null;
  if (!admin) { u = await authUser(b, env); if (!u) return fail(401, 'login_required'); }
  const request = await loadRequest(b.requestId, env);
  if (!request) return fail(404, 'request_not_found');
  if (typeof b.messageId !== 'string' || !MSG_ID_RE.test(b.messageId)) return fail(400, 'invalid_message');
  const doc = await getDoc(`${REQUESTS}/${request.id}/messages/${b.messageId}`, env);
  if (!doc) return fail(404, 'message_not_found');
  const msg = toMessage(doc);
  if (!admin && msg.uid !== u.uid) return fail(403, 'forbidden');
  await removeMessage(request.id, msg, env);
  return ok({ ok: true });
}

async function reqDelete(b, env, { admin = false } = {}) {
  let u = null;
  if (!admin) { u = await authUser(b, env); if (!u) return fail(401, 'login_required'); }
  const request = await loadRequest(b.requestId, env);
  if (!request) return fail(404, 'request_not_found');
  if (!admin && request.uid !== u.uid) return fail(403, 'forbidden');
  const removed = await removeRequest(request, env);
  return ok({ ok: true, messages: removed });
}

// ── Admin ─────────────────────────────────────────────────────
async function adminRequests(env) {
  const docs = await listAll(REQUESTS, 500, env);
  const rows = docs.map(d => ({
    id: d.id, uid: d.data.uid || '', name: d.data.name || '', text: d.data.text || '', course: d.data.course || '', subject: d.data.subject || '',
    status: d.data.status === 'fulfilled' ? 'fulfilled' : 'open', upvotes: Array.isArray(d.data.upvoterIds) ? d.data.upvoterIds.length : 0,
    msgCount: Number.isInteger(d.data.msgCount) ? d.data.msgCount : 0, createdAt: d.data.createdAt || null,
    lastMessageAt: d.data.lastMessageAt || null, lastMessageBy: d.data.lastMessageBy || '',
  }));
  rows.sort((a, b) => Math.max(tsMs(b.lastMessageAt), tsMs(b.createdAt)) - Math.max(tsMs(a.lastMessageAt), tsMs(a.createdAt)));
  return ok({ ok: true, requests: rows, totals: { requests: rows.length, open: rows.filter(r => r.status === 'open').length, messages: rows.reduce((n, r) => n + r.msgCount, 0) } });
}

async function adminRequest(b, env) {
  const request = await loadRequest(b.requestId, env);
  if (!request) return fail(404, 'request_not_found');
  const msgs = (await listAll(`${REQUESTS}/${request.id}/messages`, 1000, env)).map(toMessage);
  const users = new Map();
  const userInfo = async (uid) => {
    if (!uid) return { email: '', name: '' };
    if (!users.has(uid)) {
      let info = { email: '', name: '' };
      try { const d = await getDoc(`users/${uid}`, env); if (d) info = { email: d.data.email || '', name: d.data.name || '' }; } catch (_) { /* göstərilməyəcək */ }
      users.set(uid, info);
    }
    return users.get(uid);
  };
  const owner = await userInfo(request.uid);
  const messages = [];
  for (const m of msgs) messages.push({ ...m, email: (await userInfo(m.uid)).email });

  const logs = await runQuery({
    from: [{ collectionId: LOG_COLLECTION }],
    where: { fieldFilter: { field: { fieldPath: 'requestId' }, op: 'EQUAL', value: { stringValue: request.id } } },
    limit: 500,
  }, env);
  const notifications = logs.map(l => ({
    id: l.id, messageId: l.data.messageId || '', fromUid: l.data.fromUid || '', fromName: l.data.fromName || '', toUid: l.data.toUid || '', toName: l.data.toName || '',
    recipientRole: l.data.recipientRole || '', devices: l.data.devices || 0, sent: l.data.sent || 0, failed: l.data.failed || 0, removed: l.data.removed || 0,
    errors: safeJson(l.data.errors), title: l.data.title || '', body: l.data.body || '', createdAt: l.data.createdAt || null,
  })).sort((a, b) => tsMs(a.createdAt) - tsMs(b.createdAt));
  for (const n of notifications) n.toEmail = (await userInfo(n.toUid)).email;

  return ok({
    ok: true,
    request: {
      id: request.id, uid: request.uid || '', name: request.name || '', email: owner.email, text: request.text || '', course: request.course || '', subject: request.subject || '',
      status: request.status === 'fulfilled' ? 'fulfilled' : 'open', upvotes: Array.isArray(request.upvoterIds) ? request.upvoterIds.length : 0, createdAt: request.createdAt || null,
      fulfilledAt: request.fulfilledAt || null,
    },
    messages, notifications,
  });
}
function safeJson(s) { try { const v = JSON.parse(s || '{}'); return v && typeof v === 'object' ? v : {}; } catch (_) { return {}; } }

async function adminPushLog(b, env) {
  const limit = Math.min(Math.max(parseInt(b.limit, 10) || 50, 1), 200);
  const rows = await runQuery({ from: [{ collectionId: LOG_COLLECTION }], orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }], limit }, env);
  return ok({
    ok: true,
    items: rows.map(r => ({
      id: r.id, kind: r.data.kind || 'manual', title: r.data.title || '', body: r.data.body || '', url: r.data.url || '', audience: r.data.audience || '',
      total: r.data.total || r.data.devices || 0, sent: r.data.sent || 0, failed: r.data.failed || 0, removed: r.data.removed || 0, createdAt: r.data.createdAt || null,
      requestId: r.data.requestId || '', fromName: r.data.fromName || '', toName: r.data.toName || '', errors: safeJson(r.data.errors),
    })),
  });
}

// ── Giriş nöqtələri (api/push.js çağırır) ─────────────────────
export async function publicThreadAction(action, b, env = process.env) {
  switch (action) {
    case 'file-url':   return fileUrl(b, env);
    case 'req-create': return reqCreate(b, env);
    case 'req-send':   return reqSend(b, env);
    case 'req-delete': return reqDelete(b, env);
    case 'msg-delete': return msgDelete(b, env);
    default:           return null;
  }
}
export async function adminThreadAction(action, b, env = process.env) {
  switch (action) {
    case 'admin-requests':   return adminRequests(env);
    case 'admin-request':    return adminRequest(b, env);
    case 'admin-req-delete': return reqDelete(b, env, { admin: true });
    case 'admin-msg-delete': return msgDelete(b, env, { admin: true });
    case 'admin-push-log':   return adminPushLog(b, env);
    default:                 return null;
  }
}
