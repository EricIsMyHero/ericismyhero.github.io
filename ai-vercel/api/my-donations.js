// api/my-donations.js
// POST { idToken } → daxil olmuş istifadəçinin öz ödənişləri və ümumi məbləği (yalnız real ödənişlər cəmə daxildir).
import { setCors, body, verifyIdToken, listUserDonations, getConfig } from '../lib/payments.js';

export default async function handler(req, res) {
  setCors(req, res, 'POST, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!getConfig().enabled) return res.status(200).json({ donations: [], total: 0, count: 0 });

  const u = await verifyIdToken(body(req).idToken);
  if (!u) return res.status(401).json({ error: 'invalid_token' });
  try {
    return res.status(200).json(await listUserDonations(u.uid));
  } catch (e) {
    console.error('[my-donations] xəta:', e.message);
    return res.status(502).json({ error: 'server_error' });
  }
}
