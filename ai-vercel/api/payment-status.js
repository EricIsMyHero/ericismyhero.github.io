// api/payment-status.js
// GET ?order=UNEC-… → { status: pending|paid|failed|review, amount, visibility, mode }
// Qayıdış səhifəsi bununla yoxlayır; URL-dəki parametrlərə yox, serverdəki vəziyyətə etibar edilir.
import { setCors, getDoc, publicOrder, ORDER_RE, getConfig } from '../lib/payments.js';

export default async function handler(req, res) {
  setCors(req, res, 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
  if (!getConfig().enabled) return res.status(503).json({ error: 'disabled' });

  const id = String((req.query && req.query.order) || '');
  if (!ORDER_RE.test(id)) return res.status(400).json({ error: 'bad_request' });
  try {
    const cur = await getDoc(`donations/${id}`);
    if (!cur) return res.status(404).json({ error: 'not_found' });
    return res.status(200).json(publicOrder(cur.data));
  } catch (e) {
    console.error('[payment-status] xəta:', e.message);
    return res.status(500).json({ error: 'server_error' });
  }
}
