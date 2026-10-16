// api/payment-create.js
// POST { amount, name?, visibility, lang?, idToken? } → sifariş yaradır, şlüz yönləndirməsini qaytarır.
// Kart məlumatı bu sorğudan keçmir. Daxil olmuş istifadəçinin idToken-i server tərəfdə yoxlanılır.
import crypto from 'node:crypto';
import {
  getConfig, setCors, body, parseAmount, cleanName, newOrderId, verifyIdToken,
  VISIBILITIES, createDoc, patchDoc, toAzn,
} from '../lib/payments.js';

export default async function handler(req, res) {
  setCors(req, res, 'POST, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const cfg = getConfig();
  if (!cfg.enabled) return res.status(503).json({ error: 'disabled' });

  const b = body(req);
  const amt = parseAmount(b.amount, cfg.min, cfg.max);
  if (amt.error) return res.status(400).json({ error: amt.error, min: cfg.min, max: cfg.max });
  const visibility = VISIBILITIES.includes(b.visibility) ? b.visibility : 'anon';
  const name = cleanName(b.name);
  const lang = ['az', 'en', 'ru'].includes(b.lang) ? b.lang : 'az';

  let uid = null;
  if (b.idToken) {
    const u = await verifyIdToken(b.idToken);
    if (!u) return res.status(401).json({ error: 'invalid_token' });
    uid = u.uid;
  }

  const orderId = newOrderId();
  const now = new Date();
  const order = {
    orderId, provider: cfg.provider, mode: cfg.mode, status: 'pending',
    amount: amt.qepik, currency: cfg.currency,
    uid, name, visibility, lang,
    testToken: cfg.provider === 'test' ? crypto.randomBytes(16).toString('hex') : null,
    createdAt: now, updatedAt: now,
  };

  try {
    await createDoc('donations', orderId, order);
  } catch (e) {
    console.error('[payment-create] saxlanmadı:', e.message);
    return res.status(500).json({ error: 'server_error' });
  }

  try {
    const checkout = await cfg.impl.createCheckout(order, {
      env: process.env,
      returnUrl: `${cfg.siteUrl}/?order=${orderId}#/support`,
    });
    if (checkout.transaction) await patchDoc(`donations/${orderId}`, { transaction: checkout.transaction, updatedAt: new Date() }).catch(() => {});
    if (checkout.type === 'redirect') return res.status(200).json({ orderId, redirectUrl: checkout.redirectUrl, amount: toAzn(order.amount) });
    return res.status(200).json({ orderId, test: true, payToken: checkout.payToken, amount: toAzn(order.amount) });
  } catch (e) {
    console.error('[payment-create] şlüz xətası:', e.message, e.detail || '');
    await patchDoc(`donations/${orderId}`, { status: 'failed', failReason: 'gateway_error', updatedAt: new Date() }).catch(() => {});
    return res.status(502).json({ error: 'gateway_error' });
  }
}
