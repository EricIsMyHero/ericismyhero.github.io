// api/push.js
// Push bildirişləri üçün TƏK serverless funksiya (Vercel Hobby planında limit — 12 funksiya, ona görə birləşdirilib).
//
// Sayt tərəfi (ictimai):
//   GET                                                    → { enabled, vapidKey }   (public açar — sirr deyil)
//   POST { action: 'subscribe', token, lang?, idToken? }   → tokeni Firestore-a yazır / yeniləyir
//   POST { action: 'unsubscribe', token }                  → tokeni silir
//   Token əvvəlcə FCM-də `validate_only` ilə yoxlanılır: uydurma tokenlərlə bazanı doldurmaq mümkün olmur.
//
// Admin (başlıq: X-Admin-Key = ADMIN_SECRET_KEY, admin-data.js ilə eyni açar):
//   POST { action: 'stats' }                               → abunəçi sayı
//   POST { action: 'send', title, body, url?, audience, email?, dryRun?, after? }
//        audience: 'all' | 'az' | 'en' | 'user' (user → email lazımdır; test üçün özünə göndər)
//        Bir sorğu ~8 saniyə işləyir (PUSH_DEADLINE_MS). Çox cihaz olarsa cavabda `cursor` qayıdır —
//        admin paneli onu `after` kimi göndərib qalanlara davam edir (heç kimə təkrar getmir).
//
// Qeyd: üstdə yalnız daxili `node:crypto` import olunur. Layihə modulları handler daxilində yüklənir —
// beləliklə fayl çatışmazlığı / yanlış export kimi deploy xətası olsa belə preflight (OPTIONS) uğurlu olur
// və brauzer qaranlıq "CORS" səhvi əvəzinə real xəta mesajını görür.
import crypto from 'node:crypto';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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

const failMsg = (e) => String((e && e.message) || e).slice(0, 300);

export default async function handler(req, res) {
  setCors(res);
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  let m;
  try { m = await loadModules(); } catch (e) {
    console.error('[push] modul yüklənmədi:', e);
    return res.status(500).json({ error: 'module_load_failed', message: failMsg(e) });
  }
  const {
    body, verifyIdToken, getDoc, setDoc, deleteDoc, createDoc,
    COLLECTION, LOG_COLLECTION, LIMITS, AUDIENCES, CURSOR_RE,
    tokenId, isTokenShape, pushEnabled, fcmSend, isDeadToken, cleanText, cleanUrl, listTokens, findUidByEmail, sendMany,
  } = m;

  // ── GET: sayt üçün konfiqurasiya ──
  if (req.method === 'GET') {
    const enabled = pushEnabled();
    return res.status(200).json({ enabled, vapidKey: enabled ? process.env.FIREBASE_VAPID_KEY : null });
  }

  try {
    const b = body(req);

    // ── Admin əməliyyatları ──
    if (b.action === 'stats' || b.action === 'send') {
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

      const title = cleanText(b.title, LIMITS.title);
      const text = cleanText(b.body, LIMITS.body, true);
      if (!title || !text) return res.status(400).json({ error: 'title_and_body_required' });
      const url = cleanUrl(b.url);
      if (!url) return res.status(400).json({ error: 'invalid_url' });
      const audience = AUDIENCES.includes(b.audience) ? b.audience : null;
      if (!audience) return res.status(400).json({ error: 'invalid_audience' });
      const after = b.after == null || b.after === '' ? null : String(b.after);
      if (after !== null && !CURSOR_RE.test(after)) return res.status(400).json({ error: 'invalid_cursor' });

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
      if (after) items = items.filter(x => x.id > after);   // əvvəlki hissədə işlənənləri keç

      if (b.dryRun) return res.status(200).json({ ok: true, dryRun: true, total: items.length });

      const stats = await sendMany(items, { title, body: text, url });

      // Göndəriş jurnalı (Firestore → push_log; hər hissə ayrıca). Alınmasa göndərişə təsir etmir.
      try {
        const logId = Date.now().toString(36) + crypto.randomBytes(3).toString('hex');
        await createDoc(LOG_COLLECTION, logId, {
          title, body: text, url, audience,
          total: stats.total, sent: stats.sent, failed: stats.failed, removed: stats.removed,
          createdAt: new Date(),
        });
      } catch (e) { console.warn('[push] jurnal yazılmadı:', e.message); }

      const { lastId, ...pub } = stats;
      return res.status(200).json({
        ok: true, ...pub,
        partial: stats.stopped !== null,
        cursor: stats.stopped === 'deadline' ? lastId : null,   // yalnız vaxt bitəndə davam etmək olar
      });
    }

    // ── İctimai: abunə / abunəlikdən çıxma ──
    if (b.action === 'subscribe' || b.action === 'unsubscribe') {
      if (!pushEnabled()) return res.status(503).json({ error: 'push_disabled' });
      if (!isTokenShape(b.token)) return res.status(400).json({ error: 'invalid_token' });
      const id = tokenId(b.token);

      if (b.action === 'unsubscribe') {
        await deleteDoc(`${COLLECTION}/${id}`);
        return res.status(200).json({ ok: true });
      }

      const check = await fcmSend({ token: b.token, data: { ping: '1' } }, { validateOnly: true });
      if (!check.ok) {
        if (isDeadToken(check)) return res.status(400).json({ error: 'invalid_token' });
        console.error('[push] FCM yoxlama xətası:', check.status, check.code, check.message);
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
    }

    return res.status(400).json({ error: 'invalid_action' });
  } catch (e) {
    console.error('[push] xəta:', e);
    return res.status(500).json({ error: 'server_error', message: failMsg(e) });
  }
}
