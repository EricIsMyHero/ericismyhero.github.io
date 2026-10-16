// api/payment-callback.js
// POST — şlüzdən (server→server) ödəniş nəticəsi.
//   epoint : form-urlencoded { data, signature }  → Epoint merchant panelində result_url olaraq bu ünvan göstərilir.
//   test   : JSON { provider:'test', orderId, token, result:'success'|'failed' } (yalnız PAYMENT_PROVIDER=test olanda)
// Nəticə idempotent tətbiq olunur; təkrar callback heç nəyi dəyişmir.
import { getConfig, setCors, body, applyResult, getDoc, ORDER_RE } from '../lib/payments.js';
import { epoint } from '../lib/providers.js';

export default async function handler(req, res) {
  setCors(req, res, 'POST, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const cfg = getConfig();
  if (!cfg.enabled) return res.status(503).json({ error: 'disabled' });
  const b = body(req);

  try {
    // ── Test rejimi ──
    if (b.provider === 'test') {
      if (cfg.provider !== 'test') return res.status(400).json({ error: 'bad_request' });
      if (typeof b.orderId !== 'string' || !ORDER_RE.test(b.orderId)) return res.status(400).json({ error: 'bad_request' });
      const cur = await getDoc(`donations/${b.orderId}`);
      if (!cur || cur.data.provider !== 'test' || !cur.data.testToken || cur.data.testToken !== b.token) return res.status(403).json({ error: 'forbidden' });
      const r = await applyResult(b.orderId, { paid: b.result === 'success', code: b.result === 'success' ? null : 'test_declined' });
      return res.status(200).json({ ok: true, outcome: r.outcome });
    }

    // ── Epoint ──
    if (cfg.provider !== 'epoint') return res.status(400).json({ error: 'bad_request' });
    const v = epoint.verifyCallback(b, process.env);
    if (!v.ok) { console.warn('[payment-callback] rədd edildi:', v.reason); return res.status(400).json({ error: 'invalid_signature' }); }
    if (!ORDER_RE.test(v.result.orderId)) return res.status(400).json({ error: 'bad_request' });

    const r = await applyResult(v.result.orderId, v.result);
    if (r.outcome === 'unknown') return res.status(404).json({ error: 'unknown_order' });
    if (r.outcome === 'mismatch') console.error('[payment-callback] MƏBLƏĞ UYĞUNSUZLUĞU:', v.result.orderId, v.result.amountQepik);
    return res.status(200).json({ ok: true, outcome: r.outcome });
  } catch (e) {
    console.error('[payment-callback] xəta:', e.message);
    return res.status(500).json({ error: 'server_error' });   // şlüz yenidən cəhd edə bilsin
  }
}
