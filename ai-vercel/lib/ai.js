import crypto from 'node:crypto';
import { getDoc, createDoc, patchDoc, runQuery } from './firestore.js';

export const dayKey = now => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Baku', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
export function premiumPolicy(receipts, now = new Date()) {
  const days = { '7d': 7, '15d': 15, '32d': 32 };
  const premium = receipts.some(({ data: d }) => d.status === 'used' && (d.plan === 'lifetime' ||
    (days[d.plan] && Number.isFinite(Date.parse(d.redeemedAt)) && Date.parse(d.redeemedAt) + days[d.plan] * 86400000 > +now)));
  return { isPremium: premium, dailyLimit: premium ? 12 : 5, charLimit: premium ? 400 : 250 };
}
export async function getAiPolicy(uid, env = process.env) {
  // Premium is derived from server-controlled redemption receipts, never writable profile fields.
  const receipts = await runQuery({ from: [{ collectionId: 'premium_codes' }], where: { fieldFilter: {
    field: { fieldPath: 'redeemedByUid' }, op: 'EQUAL', value: { stringValue: uid }
  } }, limit: 100 }, env);
  return premiumPolicy(receipts);
}
export function usagePath(uid) { return 'ai_usage/' + crypto.createHash('sha256').update(uid).digest('hex'); }
const defaults = { get: getDoc, create: createDoc, patch: patchDoc };
export function usageView(data, policy, now = new Date()) {
  const count = data?.day === dayKey(now) ? Math.max(0, Number(data.count) || 0) : 0;
  return { ...policy, count, remaining: Math.max(0, policy.dailyLimit - count) };
}
export async function reserveAiUsage(uid, policy, env = process.env, store = defaults, now = new Date()) {
  const path = usagePath(uid), day = dayKey(now);
  for (let attempt = 0; attempt < 6; attempt++) {
    const previous = await store.get(path, env);
    const view = usageView(previous?.data, policy, now);
    if (!view.remaining) return { error: 'quota_exceeded', status: 429, usage: view };
    if (previous?.data.lastAt && +now - Date.parse(previous.data.lastAt) < 3000) return { error: 'too_fast', status: 429, usage: view };
    const next = { uid, day, count: view.count + 1, lastAt: now.toISOString() };
    try {
      if (previous) await store.patch(path, next, { ifUpdateTime: previous.updateTime }, env);
      else await store.create('ai_usage', path.split('/')[1], next, env);
      return { usage: usageView(next, policy, now), day };
    } catch (e) { if (!['exists', 'conflict'].includes(e.code)) throw e; }
  }
  return { error: 'too_fast', status: 429 };
}
export async function refundAiUsage(uid, day, env = process.env, store = defaults) {
  for (let i = 0; i < 5; i++) {
    const doc = await store.get(usagePath(uid), env);
    if (!doc || doc.data.day !== day || !doc.data.count) return;
    try { await store.patch(usagePath(uid), { count: doc.data.count - 1 }, { ifUpdateTime: doc.updateTime }, env); return; }
    catch (e) { if (e.code !== 'conflict') throw e; }
  }
}
