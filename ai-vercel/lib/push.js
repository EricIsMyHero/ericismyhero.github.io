// lib/push.js
// Web Push bildirişləri (Firebase Cloud Messaging, HTTP v1): abunəçi saxlama + göndərmə məntiqi.
// Abunəçi tokenləri Firestore-da `push_tokens` kolleksiyasındadır; brauzer ora birbaşa yazmır
// (qaydalar: allow read, write: if false) — hamısı service account ilə server tərəfdən gedir.
import crypto from 'node:crypto';
import { getAccessToken, serviceAccount, deleteDoc, listDocs, runQuery } from './firestore.js';

export const COLLECTION = 'push_tokens';
export const LOG_COLLECTION = 'push_log';
export const LIMITS = { title: 80, body: 240 };
export const AUDIENCES = ['all', 'az', 'en', 'user'];

const LINK_HOSTS = ['unecstudentshub.com', 'www.unecstudentshub.com', 't.me'];
// Bu cavablar tokenin artıq işləmədiyini göstərir → bazadan silinir
const DEAD_CODES = new Set(['UNREGISTERED', 'SENDER_ID_MISMATCH']);
// Bu xətalarda davam etməyin mənası yoxdur (icazə / API söndürülüb) → göndəriş dayandırılır
const FATAL_CODES = new Set(['PERMISSION_DENIED', 'UNAUTHENTICATED']);

export const siteUrl = (env = process.env) => (env.SITE_URL || 'https://unecstudentshub.com').replace(/\/+$/, '');
export const pushEnabled = (env = process.env) => !!(env.FIREBASE_SERVICE_ACCOUNT && env.FIREBASE_VAPID_KEY);

// ── Tokenlər ──────────────────────────────────────────────────
export const tokenId = (token) => crypto.createHash('sha256').update(token).digest('hex');
export const isTokenShape = (t) => typeof t === 'string' && /^[A-Za-z0-9_:.\-]{50,4096}$/.test(t);

// ── Mətnin təmizlənməsi ───────────────────────────────────────
/** Bildiriş mətni düz mətndir (HTML yoxdur). Nəzarət simvolları silinir, uzunluq məhdudlaşdırılır. */
export function cleanText(v, max, multiline = false) {
  if (typeof v !== 'string') return '';
  let s = v.normalize('NFC').replace(/\r\n?/g, '\n');
  s = s.replace(multiline ? /[\u0000-\u0009\u000b-\u001f\u007f]/g : /[\u0000-\u001f\u007f]/g, ' ');
  s = multiline ? s.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n') : s.replace(/\s+/g, ' ');
  return s.trim().slice(0, max).trim();
}

/**
 * Klik linki: boşdursa → sayt; "/yol" və ya "#/marşrut" → saytın daxilində; tam link yalnız etibarlı domenlərdən.
 * Qaytarır: mütləq URL (string) və ya yanlışdırsa null.
 */
export function cleanUrl(v, env = process.env) {
  const site = siteUrl(env);
  const s = typeof v === 'string' ? v.trim() : '';
  if (!s) return site + '/';
  if (s.startsWith('/') && !s.startsWith('//')) return site + s;
  if (s.startsWith('#')) return site + '/' + s;
  try {
    const u = new URL(s);
    if (u.protocol === 'https:' && LINK_HOSTS.includes(u.hostname)) return u.href;
  } catch (_) { /* aşağıda null */ }
  return null;
}

// ── FCM HTTP v1 ───────────────────────────────────────────────
/** Data-only mesaj: bildirişi sw.js özü göstərir (title/body/url data-dadır). Bütün data dəyərləri string olmalıdır. */
export function buildMessage(token, { title, body, url }) {
  return {
    token,
    data: { title: String(title), body: String(body), url: String(url) },
    webpush: { headers: { TTL: '86400', Urgency: 'normal' } },
  };
}

/** Tək mesaj göndər (validateOnly=true → real göndərmir, yalnız tokeni və mesajı yoxlayır). */
export async function fcmSend(message, { validateOnly = false } = {}, env = process.env) {
  const sa = serviceAccount(env);
  const accessToken = await getAccessToken(env);
  const res = await fetch(`https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ validate_only: !!validateOnly, message }),
  });
  if (res.ok) return { ok: true };
  const j = await res.json().catch(() => ({}));
  const err = (j && j.error) || {};
  const detail = (err.details || []).find(d => d && d.errorCode) || {};
  return { ok: false, status: res.status, code: detail.errorCode || err.status || 'UNKNOWN', message: err.message || '' };
}

export function isDeadToken(r) {
  if (!r || r.ok) return false;
  if (DEAD_CODES.has(r.code) || r.status === 404) return true;
  return r.code === 'INVALID_ARGUMENT' && /registration token/i.test(r.message || '');
}

// ── Abunəçilər ────────────────────────────────────────────────
const toItem = (r) => ({ id: r.id, token: r.data.token, uid: r.data.uid || null, lang: r.data.lang || 'az' });

/** Abunəçi siyahısı. Filtr: { uid } və ya { lang }; filtrsiz — hamısı. */
export async function listTokens({ uid, lang } = {}, env = process.env) {
  if (uid || lang) {
    const field = uid ? 'uid' : 'lang';
    const rows = await runQuery({
      from: [{ collectionId: COLLECTION }],
      where: { fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: { stringValue: uid || lang } } },
    }, env);
    return rows.map(toItem).filter(x => x.token);
  }
  const out = [];
  let pageToken = null;
  do {
    const page = await listDocs(COLLECTION, { pageSize: 300, pageToken }, env);
    for (const d of page.docs) { const it = toItem(d); if (it.token) out.push(it); }
    pageToken = page.nextPageToken;
  } while (pageToken);
  return out;
}

/** Email → uid (users/{uid} sənədlərindəki `email` sahəsi). Tapılmasa null. */
export async function findUidByEmail(email, env = process.env) {
  const e = typeof email === 'string' ? email.trim() : '';
  if (!e || e.length > 200) return null;
  for (const candidate of Array.from(new Set([e, e.toLowerCase()]))) {
    const rows = await runQuery({
      from: [{ collectionId: 'users' }],
      where: { fieldFilter: { field: { fieldPath: 'email' }, op: 'EQUAL', value: { stringValue: candidate } } },
      limit: 1,
    }, env);
    if (rows[0]) return rows[0].id;
  }
  return null;
}

// ── Kütləvi göndəriş ──────────────────────────────────────────
/**
 * items = [{ id, token }]. Eyni anda `concurrency` sorğu; `deadlineMs`-dən sonra yeni sorğu başlamır
 * (serverless vaxt limiti üçün). Ölü tokenlər bazadan silinir.
 * `send` yalnız testlər üçün dəyişdirilə bilər.
 */
export async function sendMany(items, payload, { concurrency = 25, deadlineMs = 50000, send = fcmSend } = {}) {
  const started = Date.now();
  const stats = { total: items.length, sent: 0, failed: 0, removed: 0, notAttempted: 0, errors: {} };
  let next = 0;
  let fatal = false;

  async function worker() {
    while (!fatal && Date.now() - started < deadlineMs) {
      const idx = next++;
      if (idx >= items.length) return;
      const it = items[idx];
      try {
        const r = await send(buildMessage(it.token, payload));
        if (r.ok) stats.sent++;
        else if (isDeadToken(r)) {
          stats.removed++;
          await deleteDoc(`${COLLECTION}/${it.id}`).catch(() => {});
        } else {
          stats.failed++;
          stats.errors[r.code] = (stats.errors[r.code] || 0) + 1;
          if (FATAL_CODES.has(r.code)) fatal = true;
        }
      } catch (_) {
        stats.failed++;
        stats.errors.NETWORK = (stats.errors.NETWORK || 0) + 1;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  stats.notAttempted = stats.total - stats.sent - stats.failed - stats.removed;
  return stats;
}
