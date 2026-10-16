// api/payment-config.js
// GET — ödəniş sistemi aktivdirmi, hədlər, hazır məbləğlər. Gizli heç nə qaytarmır.
import { getConfig, publicConfig, setCors } from '../lib/payments.js';

export default function handler(req, res) {
  setCors(req, res, 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  return res.status(200).json(publicConfig(getConfig()));
}
