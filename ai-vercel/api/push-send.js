// api/push-send.js
// Admin: abunəçilərə istənilən vaxt bildiriş göndər.
//   POST { action: 'stats' }                                    → abunəçi sayı
//   POST { action: 'send', title, body, url?, audience, email?, dryRun? }
//        audience: 'all' | 'az' | 'en' | 'user' (user → email lazımdır; test üçün özünə göndər)
// Başlıq: X-Admin-Key = ADMIN_SECRET_KEY (admin-data.js ilə eyni açar).
//
// Qeyd: üstdə yalnız daxili `node:crypto` import olunur. Layihə modulları handler daxilində yüklənir —
// beləliklə fayl çatışmazlığı / yanlış export kimi deploy xətası olsa belə preflight (OPTIONS) uğurlu olur
// və admin paneli qaranlıq "CORS" səhvi əvəzinə real xəta mesajını görür.
import crypto from 'node:crypto';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function isAdmin(req, b) {
  const key = String(req.headers['x-admin-key'] || b.adminKey || '');
  const secret = String(process.env.ADMIN_SECRET_KEY || '');
  if (!key || !secret) return false;
  const h = (s) => crypto.createHash('sha256').update(s).digest();
  return crypto.timingSafeEqual(h(key), h(secret));
}

async function loadModules() {
  const [payments, firestore, push] = await Promise.all([
    import('../lib/payments.js'), import('../lib/firestore.js'), import('../lib/push.js'),
  ]);
  return { ...payments, ...firestore, ...push };
}

export default async function handler(req, res) {
  setCors(res);
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  let m;
  try { m = await loadModules(); } catch (e) {
    console.error('[push-send] modul yüklənmədi:', e);
    return res.status(500).json({ error: 'module_load_failed', message: String((e && e.message) || e).slice(0, 300) });
  }
  const { body, createDoc, LOG_COLLECTION, LIMITS, AUDIENCES, pushEnabled, cleanText, cleanUrl, listTokens, findUidByEmail, sendMany } = m;

  try {
    const b = body(req);
    if (!isAdmin(req, b)) return res.status(401).json({ error: 'unauthorized' });
    if (!pushEnabled()) return res.status(503).json({ error: 'push_disabled' });

    if (b.action === 'stats') {
      const all = await listTokens();
      return res.status(200).json({
        enabled: true,
        total: all.length,
        loggedIn: all.filter(x => x.uid).length,
        az: all.filter(x => x.lang === 'az').length,
        en: all.filter(x => x.lang === 'en').length,
      });
    }
    if (b.action !== 'send') return res.status(400).json({ error: 'invalid_action' });

    const title = cleanText(b.title, LIMITS.title);
    const text = cleanText(b.body, LIMITS.body, true);
    if (!title || !text) return res.status(400).json({ error: 'title_and_body_required' });
    const url = cleanUrl(b.url);
    if (!url) return res.status(400).json({ error: 'invalid_url' });
    const audience = AUDIENCES.includes(b.audience) ? b.audience : null;
    if (!audience) return res.status(400).json({ error: 'invalid_audience' });

    let items;
    if (audience === 'user') {
      const uid = await findUidByEmail(b.email);
      if (!uid) return res.status(404).json({ error: 'user_not_found' });
      items = await listTokens({ uid });
    } else if (audience === 'all') {
      items = await listTokens();
    } else {
      items = await listTokens({ lang: audience });
    }

    if (b.dryRun) return res.status(200).json({ ok: true, dryRun: true, total: items.length });

    const stats = await sendMany(items, { title, body: text, url });

    // Göndəriş jurnalı (Firestore → push_log). Alınmasa göndərişə təsir etmir.
    try {
      const logId = Date.now().toString(36) + crypto.randomBytes(3).toString('hex');
      await createDoc(LOG_COLLECTION, logId, {
        title, body: text, url, audience,
        total: stats.total, sent: stats.sent, failed: stats.failed, removed: stats.removed,
        createdAt: new Date(),
      });
    } catch (e) { console.warn('[push-send] jurnal yazılmadı:', e.message); }

    return res.status(200).json({ ok: true, ...stats, partial: stats.notAttempted > 0 });
  } catch (e) {
    console.error('[push-send] xəta:', e);
    return res.status(500).json({ error: 'server_error', message: String((e && e.message) || e).slice(0, 300) });
  }
}
