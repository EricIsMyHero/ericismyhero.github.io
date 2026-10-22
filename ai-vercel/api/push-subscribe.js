// api/push-subscribe.js
// Sayt tərəfindən çağırılır (bildiriş icazəsi verən istifadəçi):
//   GET                                   → { enabled, vapidKey }     (public açar — sirr deyil)
//   POST { action: 'subscribe', token, lang?, idToken? }  → tokeni Firestore-a yazır / yeniləyir
//   POST { action: 'unsubscribe', token }                 → tokeni silir
// Token əvvəlcə FCM-də `validate_only` ilə yoxlanılır: uydurma tokenlərlə bazanı doldurmaq mümkün olmur.
//
// Qeyd: layihə modulları handler daxilində yüklənir ki, deploy/import xətası olsa belə preflight (OPTIONS)
// uğurlu olsun və problem qaranlıq "CORS" səhvi yox, JSON xəta kimi görünsün.

// Eyni siyahı lib/payments.js-dəki ALLOWED_ORIGINS ilə üst-üstə düşməlidir.
const ALLOWED_ORIGINS = [
  'https://unecstudentshub.com',
  'https://www.unecstudentshub.com',
  'https://ericismyhero.github.io',
  'https://ericismyhero-github-io.vercel.app',
];

function setCors(req, res) {
  const origin = req.headers && req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function loadModules() {
  const [payments, firestore, push] = await Promise.all([
    import('../lib/payments.js'), import('../lib/firestore.js'), import('../lib/push.js'),
  ]);
  return { ...payments, ...firestore, ...push };
}

export default async function handler(req, res) {
  setCors(req, res);
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  let m;
  try { m = await loadModules(); } catch (e) {
    console.error('[push-subscribe] modul yüklənmədi:', e);
    return res.status(500).json({ error: 'module_load_failed', message: String((e && e.message) || e).slice(0, 300) });
  }
  const { body, verifyIdToken, getDoc, setDoc, deleteDoc, COLLECTION, tokenId, isTokenShape, pushEnabled, fcmSend, isDeadToken } = m;

  if (req.method === 'GET') {
    const enabled = pushEnabled();
    return res.status(200).json({ enabled, vapidKey: enabled ? process.env.FIREBASE_VAPID_KEY : null });
  }
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
