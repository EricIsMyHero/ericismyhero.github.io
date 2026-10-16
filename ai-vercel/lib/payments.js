// lib/payments.js
// Ödəniş sisteminin ümumi məntiqi: konfiqurasiya, doğrulama, sifariş modeli, nəticənin tətbiqi.
import crypto from 'node:crypto';
import { getProvider } from './providers.js';
import { getDoc, createDoc, patchDoc, runQuery, serviceAccount } from './firestore.js';

export const ALLOWED_ORIGINS = [
  'https://unecstudentshub.com',
  'https://www.unecstudentshub.com',
  'https://ericismyhero.github.io',
  'https://ericismyhero-github-io.vercel.app',
];
export const VISIBILITIES = ['full', 'name', 'anon'];

export function setCors(req, res, methods = 'GET, POST, OPTIONS') {
  const origin = req.headers && req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// ── Konfiqurasiya ─────────────────────────────────────────────
export function getConfig(env = process.env) {
  const provider = (env.PAYMENT_PROVIDER || '').trim().toLowerCase();
  const impl = getProvider(provider);
  const hasStore = !!env.FIREBASE_SERVICE_ACCOUNT;
  const enabled = !!(impl && impl.configured(env) && hasStore);
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) && n > 0 ? n : d; };
  const min = num(env.PAYMENT_MIN_AZN, 1);
  const max = Math.max(min, num(env.PAYMENT_MAX_AZN, 500));
  const presets = (env.PAYMENT_PRESETS || '3,5,7,10').split(',').map(Number).filter(n => n >= min && n <= max).slice(0, 6);
  return {
    provider, impl, enabled,
    mode: provider === 'test' ? 'test' : 'live',
    currency: 'AZN',
    min, max,
    presets: presets.length ? presets : [3, 5, 7, 10],
    siteUrl: (env.SITE_URL || 'https://unecstudentshub.com').replace(/\/+$/, ''),
  };
}
export function publicConfig(c) {
  return { enabled: c.enabled, mode: c.enabled ? c.mode : null, currency: c.currency, min: c.min, max: c.max, presets: c.presets };
}

// ── Doğrulama ─────────────────────────────────────────────────
/** Məbləği qəpiyə (tam ədəd) çevir. Yalnız ≤2 onluq rəqəm. */
export function parseAmount(v, min, max) {
  if (v === null || v === undefined || v === '') return { error: 'amount_required' };
  if (typeof v !== 'string' && typeof v !== 'number') return { error: 'amount_invalid' };
  const s = (typeof v === 'number' ? String(v) : String(v).trim()).replace(',', '.');
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(s)) return { error: 'amount_invalid' };
  const q = Math.round(parseFloat(s) * 100);
  if (q < Math.round(min * 100)) return { error: 'amount_too_small' };
  if (q > Math.round(max * 100)) return { error: 'amount_too_large' };
  return { qepik: q };
}

export function cleanName(v) {
  if (typeof v !== 'string') return null;
  const s = v.normalize('NFC')
    .replace(/<[^>]*>/g, ' ')
    .replace(/https?:\/\/\S*|www\.\S*/gi, ' ')
    .replace(/[\u0000-\u001f\u007f<>]/g, ' ')
    .replace(/\s+/g, ' ').trim().slice(0, 40).trim();
  return s || null;
}

export function newOrderId() {
  return 'UNEC-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(8).toString('hex').toUpperCase();
}
export const ORDER_RE = /^UNEC-[0-9A-Z]{6,12}-[0-9A-F]{16}$/;

export function body(req) {
  const b = req.body;
  if (b && typeof b === 'object') return b;
  if (typeof b === 'string' && b) {
    try { return JSON.parse(b); } catch (_) { return Object.fromEntries(new URLSearchParams(b)); }
  }
  return {};
}

// ── Firebase ID token → uid ───────────────────────────────────
export async function verifyIdToken(idToken, env = process.env) {
  if (typeof idToken !== 'string' || idToken.length < 20 || !env.FIREBASE_API_KEY) return null;
  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(env.FIREBASE_API_KEY)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }),
    });
    if (!res.ok) return null;
    const j = await res.json();
    const u = j && j.users && j.users[0];
    return u && u.localId ? { uid: u.localId, name: u.displayName || null } : null;
  } catch (_) { return null; }
}

// ── Sifariş / nəticə ──────────────────────────────────────────
export const toAzn = (q) => Math.round(q) / 100;

export function publicOrder(o) {
  return { orderId: o.orderId, status: o.status, amount: toAzn(o.amount), currency: o.currency, visibility: o.visibility, mode: o.mode };
}

/**
 * Şlüzdən gələn nəticəni sifarişə tətbiq et. İdempotentdir: yalnız 'pending' sifariş dəyişir.
 * Qaytarır: { outcome: 'paid'|'failed'|'duplicate'|'mismatch'|'unknown' }
 */
export async function applyResult(orderId, result, env = process.env) {
  const cur = await getDoc(`donations/${orderId}`, env);
  if (!cur) return { outcome: 'unknown' };
  const o = cur.data;
  if (o.status !== 'pending') return { outcome: 'duplicate', order: o };
  if (result.paid && result.amountQepik !== undefined && result.amountQepik !== null && result.amountQepik !== o.amount) {
    // Şlüz fərqli məbləğ təsdiqləyib: 'paid' yazmırıq, əl ilə yoxlanılsın deyə 'review' statusu veririk.
    await patchDoc(`donations/${orderId}`, { status: 'review', failReason: 'amount_mismatch', updatedAt: new Date(), transaction: result.transaction || null }, { ifUpdateTime: cur.updateTime }, env).catch(() => {});
    return { outcome: 'mismatch', order: o };
  }

  const now = new Date();
  const patch = result.paid
    ? { status: 'paid', paidAt: now, updatedAt: now, transaction: result.transaction || null, rrn: result.rrn || null }
    : { status: 'failed', failReason: (result.code || 'declined').slice(0, 40), updatedAt: now, transaction: result.transaction || null };
  try {
    await patchDoc(`donations/${orderId}`, patch, { ifUpdateTime: cur.updateTime }, env);
  } catch (e) {
    if (e.code === 'conflict') return { outcome: 'duplicate', order: o };   // paralel callback artıq işlədi
    throw e;
  }

  // Ictimai siyahı: yalnız REAL (live) ödənişlər. Test ödənişləri heç vaxt görünmür.
  if (result.paid && o.mode === 'live') {
    try {
      await createDoc('supporters', orderId, {
        name: o.visibility === 'anon' ? null : (o.name || null),
        amount: o.visibility === 'full' ? o.amount : null,
        anonymous: o.visibility === 'anon',
        createdAt: now,
      }, env);
    } catch (e) { if (e.code !== 'exists') throw e; }
  }
  return { outcome: result.paid ? 'paid' : 'failed', order: o };
}

/** İctimai siyahı üçün: sənəd → təhlükəsiz obyekt */
export function publicSupporter(d) {
  return { name: d.anonymous ? null : (d.name || null), amount: d.amount == null ? null : toAzn(d.amount), anonymous: !!d.anonymous, date: d.createdAt };
}

export async function listSupporters(limit = 30, env = process.env) {
  const docs = await runQuery({
    from: [{ collectionId: 'supporters' }],
    orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
    limit,
  }, env);
  return docs.map(d => publicSupporter(d.data));
}

export async function listUserDonations(uid, env = process.env) {
  const docs = await runQuery({
    from: [{ collectionId: 'donations' }],
    where: { fieldFilter: { field: { fieldPath: 'uid' }, op: 'EQUAL', value: { stringValue: uid } } },
    limit: 200,
  }, env);
  const rows = docs.map(d => d.data).filter(o => o.status === 'paid')
    .sort((a, b) => String(b.paidAt || b.createdAt).localeCompare(String(a.paidAt || a.createdAt)));
  const live = rows.filter(o => o.mode === 'live');
  return {
    donations: rows.slice(0, 50).map(o => ({ orderId: o.orderId, amount: toAzn(o.amount), date: o.paidAt || o.createdAt, visibility: o.visibility, mode: o.mode })),
    total: toAzn(live.reduce((s, o) => s + o.amount, 0)),
    count: live.length,
  };
}

export { createDoc, getDoc, patchDoc, serviceAccount };
