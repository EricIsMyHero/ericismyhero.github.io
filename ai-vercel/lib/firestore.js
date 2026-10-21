// lib/firestore.js
// Firestore REST (service account) — yalnız server tərəfdə, ödəniş qeydləri və push abunəçiləri üçün.
// Brauzer bu kolleksiyalara birbaşa yazmır; qaydalar üçün PAYMENTS-SETUP.md və PUSH-SETUP.md-ə bax.
import crypto from 'node:crypto';

// Eyni access token həm Firestore-a (datastore), həm də FCM push göndərişinə (firebase.messaging) yarayır.
const SCOPE = 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/firebase.messaging';
let _tok = { value: null, exp: 0 };

export function serviceAccount(env = process.env) {
  if (!env.FIREBASE_SERVICE_ACCOUNT) throw new Error('FIREBASE_SERVICE_ACCOUNT təyin edilməyib');
  return JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
}

export async function getAccessToken(env = process.env) {
  const now = Math.floor(Date.now() / 1000);
  if (_tok.value && _tok.exp - 120 > now) return _tok.value;

  const sa = serviceAccount(env);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: sa.client_email, sub: sa.client_email,
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600, scope: SCOPE,
  })}`;
  const sig = crypto.createSign('RSA-SHA256').update(unsigned).sign(sa.private_key, 'base64url');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${unsigned}.${sig}`,
  });
  const data = await res.json().catch(() => ({}));
  if (!data.access_token) throw new Error('Firebase token alınmadı');
  _tok = { value: data.access_token, exp: now + (data.expires_in || 3600) };
  return _tok.value;
}
export function _resetTokenCache() { _tok = { value: null, exp: 0 }; }

// ── Dəyər çevirmələri ─────────────────────────────────────────
export function toFields(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (v === null)                 out[k] = { nullValue: null };
    else if (v instanceof Date)     out[k] = { timestampValue: v.toISOString() };
    else if (typeof v === 'string') out[k] = { stringValue: v };
    else if (typeof v === 'boolean') out[k] = { booleanValue: v };
    else if (typeof v === 'number') out[k] = Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    else throw new Error('Dəstəklənməyən sahə növü: ' + k);
  }
  return out;
}
export function fromFields(fields) {
  const out = {};
  for (const [k, f] of Object.entries(fields || {})) {
    if (f.stringValue !== undefined)         out[k] = f.stringValue;
    else if (f.integerValue !== undefined)   out[k] = parseInt(f.integerValue, 10);
    else if (f.doubleValue !== undefined)    out[k] = parseFloat(f.doubleValue);
    else if (f.booleanValue !== undefined)   out[k] = f.booleanValue;
    else if (f.timestampValue !== undefined) out[k] = f.timestampValue;
    else                                     out[k] = null;
  }
  return out;
}

function base(env) {
  const pid = serviceAccount(env).project_id;
  return `https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents`;
}
async function authed(env, init = {}) {
  const token = await getAccessToken(env);
  return { ...init, headers: { ...(init.headers || {}), Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
}
function docResult(json) {
  const id = json.name.split('/').pop();
  return { id, data: fromFields(json.fields), updateTime: json.updateTime };
}

/** Sənədi oxu → { id, data, updateTime } | null */
export async function getDoc(path, env = process.env) {
  const res = await fetch(`${base(env)}/${path}`, await authed(env));
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Firestore oxuma xətası: ${res.status}`);
  return docResult(await res.json());
}

/** Yeni sənəd yarat (id artıq varsa → 'exists' xətası) */
export async function createDoc(collection, id, data, env = process.env) {
  const url = `${base(env)}/${collection}?documentId=${encodeURIComponent(id)}`;
  const res = await fetch(url, await authed(env, { method: 'POST', body: JSON.stringify({ fields: toFields(data) }) }));
  if (res.status === 409) { const e = new Error('exists'); e.code = 'exists'; throw e; }
  if (!res.ok) throw new Error(`Firestore yazma xətası: ${res.status}`);
  return docResult(await res.json());
}

/** Sahələri yenilə. opts.ifUpdateTime verilibsə — yalnız sənəd dəyişməyibsə (yarış qorunması). */
export async function patchDoc(path, data, { ifUpdateTime } = {}, env = process.env) {
  const params = Object.keys(data).map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`);
  // Precondition yalnız biri ola bilər: updateTime (yarış qorunması) və ya exists
  if (ifUpdateTime) params.push(`currentDocument.updateTime=${encodeURIComponent(ifUpdateTime)}`);
  else params.push('currentDocument.exists=true');
  const res = await fetch(`${base(env)}/${path}?${params.join('&')}`, await authed(env, { method: 'PATCH', body: JSON.stringify({ fields: toFields(data) }) }));
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const st = body && body.error && body.error.status;
    // updateTime uyğunsuzluğu (FAILED_PRECONDITION / ABORTED) və ya sənəd yoxdur (NOT_FOUND) → başqa sorğu artıq dəyişib
    if (['FAILED_PRECONDITION', 'ABORTED', 'NOT_FOUND'].includes(st) || res.status === 409 || res.status === 412) {
      const e = new Error('conflict'); e.code = 'conflict'; e.status = res.status; throw e;
    }
    throw new Error(`Firestore yeniləmə xətası: ${res.status}`);
  }
  return docResult(await res.json());
}

/** structuredQuery → [{ id, data }] */
export async function runQuery(structuredQuery, env = process.env) {
  const res = await fetch(`${base(env)}:runQuery`, await authed(env, { method: 'POST', body: JSON.stringify({ structuredQuery }) }));
  if (!res.ok) throw new Error(`Firestore sorğu xətası: ${res.status}`);
  const rows = await res.json();
  return rows.filter(r => r.document).map(r => docResult(r.document));
}

/** Sənədi tam əvəz et; yoxdursa yarat (upsert). */
export async function setDoc(path, data, env = process.env) {
  const res = await fetch(`${base(env)}/${path}`, await authed(env, { method: 'PATCH', body: JSON.stringify({ fields: toFields(data) }) }));
  if (!res.ok) throw new Error(`Firestore yazma xətası: ${res.status}`);
  return docResult(await res.json());
}

/** Sənədi sil (olmayan sənəd xəta sayılmır). */
export async function deleteDoc(path, env = process.env) {
  const res = await fetch(`${base(env)}/${path}`, await authed(env, { method: 'DELETE' }));
  if (!res.ok && res.status !== 404) throw new Error(`Firestore silmə xətası: ${res.status}`);
  return true;
}

/** Kolleksiyanı səhifə-səhifə oxu → { docs: [{ id, data }], nextPageToken } */
export async function listDocs(collection, { pageSize = 300, pageToken } = {}, env = process.env) {
  const q = new URLSearchParams({ pageSize: String(pageSize) });
  if (pageToken) q.set('pageToken', pageToken);
  const res = await fetch(`${base(env)}/${collection}?${q}`, await authed(env));
  if (!res.ok) throw new Error(`Firestore siyahı xətası: ${res.status}`);
  const json = await res.json();
  return { docs: (json.documents || []).map(docResult), nextPageToken: json.nextPageToken || null };
}
