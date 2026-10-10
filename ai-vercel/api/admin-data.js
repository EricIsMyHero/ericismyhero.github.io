// api/admin-data.js
// Vercel Serverless — Admin paneli
// Firebase Admin SDK YOX — Firebase REST API + Service Account JWT istifadə edir
// Heç bir npm paketi lazım deyil

// ── CORS ─────────────────────────────────────────────────────
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// ── Auth ──────────────────────────────────────────────────────
function checkAuth(req) {
  const key = req.headers['x-admin-key'] || req.body?.adminKey;
  return key && key === process.env.ADMIN_SECRET_KEY;
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

  // Sign with RS256 using Web Crypto
  const pemKey = sa.private_key;
  const keyData = pemKey
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '');
  const binaryKey = Buffer.from(keyData, 'base64');

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const encoder = new TextEncoder();
  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(unsigned)
  );

  const jwt = `${unsigned}.${Buffer.from(sig).toString('base64url')}`;

  // Exchange JWT for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error('Token alınamadı: ' + JSON.stringify(tokenData));
  return tokenData.access_token;
}

// ── Firestore REST helper ─────────────────────────────────────
async function firestoreGet(projectId, path, token) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Firestore xətası: ${res.status} ${path}`);
  return res.json();
}

async function firestoreList(projectId, collection, token, pageSize = 100) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}?pageSize=${pageSize}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { documents: [] };
  return res.json();
}

// ── Firestore value extractor ────────────────────────────────
function val(field) {
  if (!field) return null;
  if (field.stringValue  !== undefined) return field.stringValue;
  if (field.integerValue  !== undefined) return parseInt(field.integerValue);
  if (field.doubleValue   !== undefined) return parseFloat(field.doubleValue);
  if (field.booleanValue  !== undefined) return field.booleanValue;
  if (field.timestampValue !== undefined) return field.timestampValue;
  if (field.arrayValue)   return (field.arrayValue.values || []).map(val);
  if (field.mapValue)     return extractFields(field.mapValue.fields || {});
  return null;
}

function extractFields(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields || {})) out[k] = val(v);
  return out;
}

function docId(doc) {
  return doc.name?.split('/').pop() || '';
}

// ── Data fetchers ─────────────────────────────────────────────

async function getUsers(projectId, token) {
  const data = await firestoreList(projectId, 'users', token, 200);
  const docs = data.documents || [];
  const users = [];

  for (const doc of docs) {
    const f = extractFields(doc.fields);
    // progress subcollection
    let xp = 0, streak = 0, totalTests = 0;
    try {
      const pDoc = await firestoreGet(projectId, `users/${docId(doc)}/progress/main`, token);
      const pf = extractFields(pDoc.fields || {});
      xp = pf.xp || 0;
      streak = pf.streak || 0;
      totalTests = pf.totalTests || 0;
    } catch (_) {}

    users.push({
      uid: docId(doc),
      name:    f.name    || 'Adsız',
      email:   f.email   || '',
      faculty: f.faculty || '',
      major:   f.major   || '',
      year:    f.year    || '',
      xp, streak, totalTests,
      createdAt: f.createdAt || null,
      lastLogin: f.lastLogin || null,
    });
  }
  return users.sort((a, b) => b.xp - a.xp);
}

async function getPdfOpens(projectId, token) {
  const data = await firestoreList(projectId, 'analytics/pdf_opens/events', token, 500);
  const docs = data.documents || [];
  const counts = {};
  for (const doc of docs) {
    const f = extractFields(doc.fields);
    const key = f.pdfName || f.pdf || 'Naməlum';
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, count]) => ({ name, count }));
}

async function getSubjectChats(projectId, token) {
  const topData = await firestoreList(projectId, 'subject_chats', token, 50);
  const groups = [];
  for (const doc of (topData.documents || [])) {
    const subject = docId(doc);
    const msgData = await firestoreList(projectId, `subject_chats/${subject}/messages`, token, 100);
    const messages = (msgData.documents || []).map(m => {
      const f = extractFields(m.fields);
      return {
        id: docId(m),
        text:      f.text      || '',
        userName:  f.userName  || 'Adsız',
        userEmail: f.userEmail || '',
        uid:       f.uid       || '',
        ts:        f.ts        || null,
        deleted:   f.deleted   || false,
      };
    });
    if (messages.length > 0) {
      groups.push({ subject, messages, count: messages.length });
    }
  }
  return groups.sort((a, b) => b.count - a.count);
}

async function getMaterialRequests(projectId, token) {
  const data = await firestoreList(projectId, 'material_requests', token, 200);
  return (data.documents || []).map(doc => {
    const f = extractFields(doc.fields);
    return {
      id:        docId(doc),
      text:      f.text      || '',
      userName:  f.userName  || '',
      userEmail: f.userEmail || '',
      uid:       f.uid       || '',
      upvotes:   f.upvotes   || 0,
      found:     f.found     || false,
      createdAt: f.createdAt || null,
    };
  });
}

async function getPdfRatings(projectId, token) {
  const data = await firestoreList(projectId, 'pdf_ratings', token, 100);
  return (data.documents || []).map(doc => {
    const f = extractFields(doc.fields);
    return {
      id:         docId(doc),
      avgRating:  f.avgRating  || 0,
      totalVotes: f.totalVotes || 0,
    };
  }).sort((a, b) => b.totalVotes - a.totalVotes);
}

// ── Premium kodlar ──────────────────────────────────────────────
function genPremiumCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 0/O, 1/I/L kimi qarışıq simvollar çıxarılıb
  const rand = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `UNEC-${rand(4)}-${rand(4)}`;
}

function toFirestoreFields(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null)                  out[k] = { nullValue: null };
    else if (typeof v === 'string')  out[k] = { stringValue: v };
    else if (typeof v === 'number')  out[k] = { integerValue: String(v) };
    else if (typeof v === 'boolean') out[k] = { booleanValue: v };
  }
  return out;
}

async function firestoreCreate(projectId, collection, docIdVal, fields, token) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}?documentId=${encodeURIComponent(docIdVal)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`Firestore yazma xətası: ${res.status} ${await res.text()}`);
  return res.json();
}

async function getPremiumCodes(projectId, token) {
  const data = await firestoreList(projectId, 'premium_codes', token, 300);
  return (data.documents || []).map(doc => {
    const f = extractFields(doc.fields);
    return {
      code:            docId(doc),
      plan:            f.plan            || '',
      status:          f.status          || 'unused',
      createdAt:       f.createdAt       || null,
      redeemedAt:      f.redeemedAt      || null,
      redeemedByUid:   f.redeemedByUid   || '',
    };
  }).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

const PREMIUM_PLANS = ['7d', '15d', '32d', 'lifetime'];

async function generatePremiumCodes(projectId, token, plan, count) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = genPremiumCode();
    await firestoreCreate(projectId, 'premium_codes', code, toFirestoreFields({
      plan,
      status: 'unused',
      createdAt: new Date().toISOString(),
    }), token);
    codes.push(code);
  }
  return codes;
}

// ── Main handler ──────────────────────────────────────────────
export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });
  if (!checkAuth(req))         return res.status(401).json({ error: 'Səlahiyyətsiz giriş' });

  const section   = req.body?.section || 'all';
  const projectId = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT).project_id;

  try {
    const token = await getAccessToken();

    if (section === 'users') {
      return res.status(200).json({ users: await getUsers(projectId, token) });
    }
    if (section === 'chats') {
      return res.status(200).json({ chats: await getSubjectChats(projectId, token) });
    }
    if (section === 'requests') {
      return res.status(200).json({ requests: await getMaterialRequests(projectId, token) });
    }
    if (section === 'pdfs') {
      const [pdfOpens, pdfRatings] = await Promise.all([getPdfOpens(projectId, token), getPdfRatings(projectId, token)]);
      return res.status(200).json({ pdfOpens, pdfRatings });
    }
    if (section === 'premium') {
      if (req.body?.action === 'generate') {
        const plan  = req.body?.plan;
        const count = Math.min(Math.max(parseInt(req.body?.count) || 1, 1), 50);
        if (!PREMIUM_PLANS.includes(plan)) return res.status(400).json({ error: 'Yanlış plan' });
        const codes = await generatePremiumCodes(projectId, token, plan, count);
        return res.status(200).json({ codes });
      }
      return res.status(200).json({ premiumCodes: await getPremiumCodes(projectId, token) });
    }

    // all — overview
    const [users, pdfOpens, requests] = await Promise.all([
      getUsers(projectId, token),
      getPdfOpens(projectId, token),
      getMaterialRequests(projectId, token),
    ]);

    return res.status(200).json({
      summary: {
        totalUsers:    users.length,
        activeToday:   users.filter(u => u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 86400000)).length,
        totalRequests: requests.length,
        openRequests:  requests.filter(r => !r.found).length,
      },
      topUsers: users.slice(0, 10),
      pdfOpens: pdfOpens.slice(0, 10),
      requests: requests.slice(0, 20),
    });

  } catch (err) {
    console.error('[admin-data]', err);
    return res.status(500).json({ error: err.message });
  }
}
