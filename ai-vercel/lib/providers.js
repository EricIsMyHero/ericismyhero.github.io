// lib/providers.js
// Ödəniş şlüzü adapterləri. Kart məlumatı heç vaxt bu serverdən keçmir:
// istifadəçi şlüzün öz təhlükəsiz səhifəsinə yönləndirilir, nəticə callback ilə gəlir.
import crypto from 'node:crypto';

const EPOINT_BASE = 'https://epoint.az';

function timingSafeEq(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

// ── Epoint.az ─────────────────────────────────────────────────
// Sənəd: "API Epoint" (rəsmi PDF). signature = base64(sha1_raw(private_key + data + private_key)),
// data = base64(JSON). POST https://epoint.az/api/1/request → { status, transaction, redirect_url }.
// Nəticə (result_url — Epoint merchant panelində təyin edilir) POST data+signature ilə gəlir.
export const epoint = {
  name: 'epoint',
  configured(env) { return !!(env.EPOINT_PUBLIC_KEY && env.EPOINT_PRIVATE_KEY); },

  sign(data, env) {
    return crypto.createHash('sha1').update(env.EPOINT_PRIVATE_KEY + data + env.EPOINT_PRIVATE_KEY).digest('base64');
  },

  async createCheckout(order, ctx) {
    const { env } = ctx;
    const payload = {
      public_key: env.EPOINT_PUBLIC_KEY,
      amount: order.amount / 100,
      currency: 'AZN',
      language: ['az', 'en', 'ru'].includes(order.lang) ? order.lang : 'az',
      order_id: order.orderId,
      description: 'UNEC Students Hub — dəstək',
      success_redirect_url: ctx.returnUrl,
      error_redirect_url: ctx.returnUrl,
    };
    const data = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');
    const body = new URLSearchParams({ data, signature: this.sign(data, env) });

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    let res;
    try {
      res = await fetch(`${EPOINT_BASE}/api/1/request`, {
        method: 'POST', body, signal: ctrl.signal,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
    } finally { clearTimeout(timer); }
    const json = await res.json().catch(() => null);
    if (!res.ok || !json || json.status !== 'success' || !json.redirect_url) {
      const e = new Error('gateway_error');
      e.detail = json && (json.message || json.status);
      throw e;
    }
    return { type: 'redirect', redirectUrl: json.redirect_url, transaction: json.transaction || null };
  },

  /** Callback gövdəsini yoxla → { ok, result } ; result: { orderId, paid, amountQepik, transaction, code, rrn } */
  verifyCallback(body, env) {
    const data = body && body.data, signature = body && body.signature;
    if (typeof data !== 'string' || typeof signature !== 'string') return { ok: false, reason: 'missing' };
    if (!timingSafeEq(this.sign(data, env), signature)) return { ok: false, reason: 'signature' };
    let p;
    try { p = JSON.parse(Buffer.from(data, 'base64').toString('utf8')); } catch (_) { return { ok: false, reason: 'data' }; }
    if (!p || typeof p.order_id !== 'string') return { ok: false, reason: 'data' };
    return {
      ok: true,
      result: {
        orderId: p.order_id,
        paid: p.status === 'success',
        amountQepik: Math.round(Number(p.amount) * 100),
        transaction: p.transaction ? String(p.transaction) : null,
        code: p.code ? String(p.code) : null,
        rrn: p.rrn ? String(p.rrn) : null,
      },
    };
  },
};

// ── Test rejimi ───────────────────────────────────────────────
// Real pul çıxmır. Sifarişə xas gizli token ilə "uğurlu/uğursuz" simulyasiya edilir.
// Test ödənişləri ictimai "Dəstəkçilər" siyahısına düşmür.
export const test = {
  name: 'test',
  configured() { return true; },
  async createCheckout(order) { return { type: 'test', payToken: order.testToken }; },
};

export function getProvider(name) {
  if (name === 'epoint') return epoint;
  if (name === 'test') return test;
  return null;
}
