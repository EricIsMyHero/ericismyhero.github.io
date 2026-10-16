// api/supporters.js
// GET — ictimai "Dəstəkçilər" siyahısı. Yalnız donorun görünməsinə icazə verdiyi məlumat qaytarılır:
//   anonim → ad və məbləğ yoxdur; "yalnız ad" → məbləğ yoxdur; "ad + məbləğ" → ikisi də.
// Test rejimindəki ödənişlər bu siyahıya heç vaxt yazılmır.
import { setCors, listSupporters, getConfig } from '../lib/payments.js';

export default async function handler(req, res) {
  setCors(req, res, 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
  if (!getConfig().enabled) return res.status(200).json({ supporters: [] });
  try {
    const supporters = await listSupporters(30);
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ supporters });
  } catch (e) {
    console.error('[supporters] xəta:', e.message);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'server_error' });
  }
}
