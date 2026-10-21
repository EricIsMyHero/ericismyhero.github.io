// api/push-subscribe.js
// Sayt tərəfindən çağırılır (bildiriş icazəsi verən istifadəçi):
//   GET                                   → { enabled, vapidKey }     (public açar — sirr deyil)
//   POST { action: 'subscribe', token, lang?, idToken? }  → tokeni Firestore-a yazır / yeniləyir
//   POST { action: 'unsubscribe', token }                 → tokeni silir
// Token əvvəlcə FCM-də `validate_only` ilə yoxlanılır: uydurma tokenlərlə bazanı doldurmaq mümkün olmur.
import { setCors, body, verifyIdToken } from '../lib/payments.js';
import { getDoc, setDoc, deleteDoc } from '../lib/firestore.js';
import { COLLECTION, tokenId, isTokenShape, pushEnabled, fcmSend, isDeadToken } from '../lib/push.js';

export default async function handler(req, res) {
  setCors(req, res, 'GET, POST, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'GET') {
    const enabled = pushEnabled();
    return res.status(200).json({ enabled, vapidKey: enabled ? process.env.FIREBASE_VAPID_KEY : null });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!pushEnabled()) return res.status(503).json({ error: 'push_disabled' });

  const b = body(req);
  if (!isTokenShape(b.token)) return res.status(400).json({ error: 'invalid_token' });
  const id = tokenId(b.token);

  try {
    if (b.action === 'unsubscribe') {
      await deleteDoc(`${COLLECTION}/${id}`);
      return res.status(200).json({ ok: true });
    }
    if (b.action !== 'subscribe') return res.status(400).json({ error: 'invalid_action' });

    const check = await fcmSend({ token: b.token, data: { ping: '1' } }, { validateOnly: true });
    if (!check.ok) {
      if (isDeadToken(check)) return res.status(400).json({ error: 'invalid_token' });
      console.error('[push-subscribe] FCM yoxlama xətası:', check.status, check.code, check.message);
      return res.status(502).json({ error: 'fcm_error', code: check.code });
    }

    // Daxil olmuş istifadəçi tokeni hesaba bağlayır; keçərsiz/boş idToken → qonaq (uid=null)
    let uid = null;
    if (b.idToken) { const u = await verifyIdToken(b.idToken); if (u) uid = u.uid; }
    const lang = b.lang === 'en' ? 'en' : 'az';

    const prev = await getDoc(`${COLLECTION}/${id}`);
    const now = new Date();
    const created = prev && prev.data.createdAt ? new Date(prev.data.createdAt) : now;
    await setDoc(`${COLLECTION}/${id}`, { token: b.token, uid, lang, createdAt: created, updatedAt: now });
    return res.status(200).json({ ok: true, linked: !!uid });
  } catch (e) {
    console.error('[push-subscribe] xəta:', e.message);
    return res.status(502).json({ error: 'server_error' });
  }
}
