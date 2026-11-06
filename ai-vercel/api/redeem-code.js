import { verifyIdToken, body } from '../lib/payments.js';
import { getDoc, patchDoc } from '../lib/firestore.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const b = body(req), user = await verifyIdToken(b.idToken);
  if (!user) return res.status(401).json({ error: 'login_required' });
  if (b.uid && b.uid !== user.uid) return res.status(403).json({ error: 'forbidden' });
  const code = typeof b.code === 'string' ? b.code.trim().toUpperCase() : '';
  if (!/^[A-Z0-9-]{4,80}$/.test(code)) return res.status(400).json({ error: 'invalid_code' });
  try {
    let doc = await getDoc(`premium_codes/${code}`);
    if (!doc) return res.status(404).json({ error: 'Kod tapılmadı' });
    const days = { '7d': 7, '15d': 15, '32d': 32 };
    const { plan } = doc.data;
    if (plan !== 'lifetime' && !days[plan]) return res.status(400).json({ error: 'invalid_plan' });
    if (doc.data.status === 'used' && doc.data.redeemedByUid !== user.uid) return res.status(409).json({ error: 'Bu kod artıq istifadə olunub' });
    if (doc.data.status !== 'used') {
      try { doc = await patchDoc(`premium_codes/${code}`, { status: 'used', redeemedByUid: user.uid, redeemedAt: new Date().toISOString() }, { ifUpdateTime: doc.updateTime }); }
      catch (e) { if (e.code === 'conflict') return res.status(409).json({ error: 'Bu kod artıq istifadə olunub' }); throw e; }
    }
    const isLifetime = plan === 'lifetime';
    const expiresAt = isLifetime ? null : new Date(Date.parse(doc.data.redeemedAt) + days[plan] * 86400000).toISOString();
    // Mirrored for the UI; the AI server trusts the private code receipt instead.
    await patchDoc(`users/${user.uid}/progress/main`, { premiumPlan: plan, premiumLifetime: isLifetime, premiumExpiresAt: expiresAt });
    return res.status(200).json({ ok: true, plan, isLifetime, expiresAt });
  } catch (_) { return res.status(503).json({ error: 'service_unavailable' }); }
}
