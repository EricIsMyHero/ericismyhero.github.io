// api/push-send.js
// Admin: abunəçilərə istənilən vaxt bildiriş göndər.
//   POST { action: 'stats' }                                    → abunəçi sayı
//   POST { action: 'send', title, body, url?, audience, email?, dryRun? }
//        audience: 'all' | 'az' | 'en' | 'user' (user → email lazımdır; test üçün özünə göndər)
// Başlıq: X-Admin-Key = ADMIN_SECRET_KEY (admin-data.js ilə eyni açar).
import crypto from 'node:crypto';
import { body } from '../lib/payments.js';
import { createDoc } from '../lib/firestore.js';
import {
  LOG_COLLECTION, LIMITS, AUDIENCES, pushEnabled, cleanText, cleanUrl,
  listTokens, findUidByEmail, sendMany,
} from '../lib/push.js';

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

export default async function handler(req, res) {
  setCors(res);
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const b = body(req);
  if (!isAdmin(req, b)) return res.status(401).json({ error: 'unauthorized' });
  if (!pushEnabled()) return res.status(503).json({ error: 'push_disabled' });

  try {
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
    console.error('[push-send] xəta:', e.message);
    return res.status(500).json({ error: 'server_error', message: e.message });
  }
}
