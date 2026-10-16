// api/redeem-code.js
// Vercel Serverless — Premium kod aktivləşdirmə
// Kod yoxlanışı və hesaba yazma server tərəfdə (service account) aparılır ki,
// istifadəçi brauzer konsolundan özünə premium yaza bilməsin.

// ── CORS ─────────────────────────────────────────────────────
function setCors(req, res) {
  const allowedOrigins = [
    'https://unecstudentshub.com',
    'https://www.unecstudentshub.com',
    'https://ericismyhero.github.io',
    'https://ericismyhero-github-io.vercel.app'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// ── Firebase JWT (Service Account → Access Token) ─────────────
async function getAccessToken() {
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: sa.client_email,
    sub: sa.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/datastore',
  };

  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const unsigned = `${b64(header)}.${b64(claim)}`;

  const pemKey = sa.private_key;
  const keyData = pemKey
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '');
  const binaryKey = Buffer.from(keyData, 'base64');

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );

  const encoder = new TextEncoder();
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, encoder.encode(unsigned));
  const jwt = `${unsigned}.${Buffer.from(sig).toString('base64url')}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error('Token alınmadı: ' + JSON.stringify(tokenData));
  return tokenData.access_token;
}

// ── Firestore REST helpers ─────────────────────────────────────
function val(field) {
  if (!field) return null;
  if (field.stringValue   !== undefined) return field.stringValue;
  if (field.integerValue  !== undefined) return parseInt(field.integerValue);
  if (field.doubleValue   !== undefined) return parseFloat(field.doubleValue);
  if (field.booleanValue  !== undefined) return field.booleanValue;
  if (field.timestampValue !== undefined) return field.timestampValue;
  if (field.nullValue !== undefined) return null;
  return null;
}
function extractFields(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields || {})) out[k] = val(v);
  return out;
}
function toFirestoreFields(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null)                    out[k] = { nullValue: null };
    else if (typeof v === 'string')    out[k] = { stringValue: v };
    else if (typeof v === 'number')    out[k] = { integerValue: String(v) };
    else if (typeof v === 'boolean')   out[k] = { booleanValue: v };
  }
  return out;
}

async function firestoreGetDoc(projectId, path, token) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Firestore oxuma xətası: ${res.status}`);
  return res.json();
}

async function firestorePatch(projectId, path, fields, token) {
  const mask = Object.keys(fields).map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}?${mask}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: toFirestoreFields(fields) }),
  });
  if (!res.ok) throw new Error(`Firestore yazma xətası: ${res.status} ${await res.text()}`);
  return res.json();
}

const PLAN_DAYS = { '7d': 7, '15d': 15, '32d': 32 };

// ── Main handler ──────────────────────────────────────────────
export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { code, uid } = req.body || {};
  if (!code || !uid) return res.status(400).json({ error: 'Kod və istifadəçi tələb olunur' });

  const cleanCode = String(code).trim().toUpperCase();
  const projectId = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT).project_id;

  try {
    const token = await getAccessToken();

    const codeDoc = await firestoreGetDoc(projectId, `premium_codes/${cleanCode}`, token);
    if (!codeDoc) return res.status(404).json({ error: 'Kod tapılmadı' });

    const codeData = extractFields(codeDoc.fields);
    if (codeData.status === 'used') {
      return res.status(409).json({ error: 'Bu kod artıq istifadə olunub' });
    }

    const plan = codeData.plan;
    const isLifetime = plan === 'lifetime';
    const days = PLAN_DAYS[plan];
    if (!isLifetime && !days) return res.status(400).json({ error: 'Kodun planı düzgün deyil' });

    const expiresAt = isLifetime ? null : new Date(Date.now() + days * 86400000).toISOString();

    // 1) İstifadəçinin progress sənədini yenilə
    await firestorePatch(projectId, `users/${uid}/progress/main`, {
      premiumPlan:     plan,
      premiumLifetime: isLifetime,
      premiumExpiresAt: expiresAt,
    }, token);

    // 2) Kodu "istifadə olundu" et
    await firestorePatch(projectId, `premium_codes/${cleanCode}`, {
      status:         'used',
      redeemedByUid:  uid,
      redeemedAt:     new Date().toISOString(),
    }, token);

    return res.status(200).json({ ok: true, plan, isLifetime, expiresAt });

  } catch (err) {
    console.error('[redeem-code]', err);
    return res.status(500).json({ error: 'Server xətası' });
  }
}
