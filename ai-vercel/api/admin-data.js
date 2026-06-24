// api/admin-data.js
// Vercel Serverless — Admin paneli üçün tam Firestore məlumatı
// Firebase Admin SDK istifadə edir (server-side, tam icazə)
// Qorunma: ADMIN_SECRET_KEY header ilə

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ── Firebase Admin init ───────────────────────────────────────
function getDb() {
  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

// ── CORS helper ───────────────────────────────────────────────
function setCors(res, origin) {
  const allowed = [
    'https://ericismyhero.github.io',
    'https://ericismyhero-github-io.vercel.app',
  ];
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Admin paneli GitHub Pages-dən gəlir
    res.setHeader('Access-Control-Allow-Origin', 'https://ericismyhero.github.io');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');
}

// ── Auth check ────────────────────────────────────────────────
function checkAuth(req) {
  const key = req.headers['x-admin-key'] || req.body?.adminKey;
  return key && key === process.env.ADMIN_SECRET_KEY;
}

// ── Data fetchers ─────────────────────────────────────────────

async function getUsers(db) {
  const snap = await db.collection('users').get();
  const users = [];
  for (const doc of snap.docs) {
    const data = doc.data();
    // Get progress subcollection
    let progress = {};
    try {
      const pSnap = await doc.ref.collection('progress').doc('main').get();
      if (pSnap.exists) progress = pSnap.data();
    } catch (_) {}
    users.push({
      uid: doc.id,
      name:    data.name    || 'Adsız',
      email:   data.email   || '',
      faculty: data.faculty || '',
      major:   data.major   || '',
      year:    data.year    || '',
      xp:      progress.xp      || 0,
      streak:  progress.streak  || 0,
      totalTests: progress.totalTests || 0,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      lastLogin: data.lastLogin?.toDate?.()?.toISOString() || null,
    });
  }
  return users.sort((a, b) => b.xp - a.xp);
}

async function getPdfOpens(db) {
  const snap = await db.collection('analytics').doc('pdf_opens').collection('events')
    .orderBy('ts', 'desc').limit(500).get();
  const counts = {};
  for (const doc of snap.docs) {
    const d = doc.data();
    const key = d.pdfName || d.pdf || 'Naməlum';
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, count]) => ({ name, count }));
}

async function getSubjectChats(db) {
  // subject_chats/{courseSubject}/messages
  const topSnap = await db.collection('subject_chats').get();
  const results = [];
  for (const doc of topSnap.docs) {
    const msgSnap = await doc.ref.collection('messages')
      .orderBy('ts', 'desc').limit(100).get();
    const messages = msgSnap.docs.map(m => {
      const d = m.data();
      return {
        id: m.id,
        text:      d.text || '',
        userName:  d.userName || 'Adsız',
        userEmail: d.userEmail || '',
        uid:       d.uid || '',
        ts:        d.ts?.toDate?.()?.toISOString() || null,
        deleted:   d.deleted || false,
      };
    });
    if (messages.length > 0) {
      results.push({ subject: doc.id, messages, count: messages.length });
    }
  }
  return results.sort((a, b) => b.count - a.count);
}

async function getMaterialRequests(db) {
  const snap = await db.collection('material_requests')
    .orderBy('createdAt', 'desc').limit(200).get();
  return snap.docs.map(doc => {
    const d = doc.data();
    return {
      id:        doc.id,
      text:      d.text || '',
      userName:  d.userName || '',
      userEmail: d.userEmail || '',
      uid:       d.uid || '',
      upvotes:   d.upvotes || 0,
      found:     d.found || false,
      createdAt: d.createdAt?.toDate?.()?.toISOString() || null,
    };
  });
}

async function getPdfRatings(db) {
  const snap = await db.collection('pdf_ratings').get();
  const results = [];
  for (const doc of snap.docs) {
    const d = doc.data();
    results.push({
      id:       doc.id,
      avgRating: d.avgRating || 0,
      totalVotes: d.totalVotes || 0,
    });
  }
  return results.sort((a, b) => b.totalVotes - a.totalVotes);
}

async function getRecentQuizResults(db, users) {
  // For top 10 users get their recent quiz results
  const recent = [];
  const topUsers = users.slice(0, 10);
  for (const u of topUsers) {
    try {
      const snap = await db.collection('users').doc(u.uid)
        .collection('quiz_results').orderBy('timestamp', 'desc').limit(5).get();
      for (const doc of snap.docs) {
        const d = doc.data();
        recent.push({
          userName: u.name,
          subject: d.subject || '',
          score: d.score || 0,
          total: d.total || 0,
          pct: d.pct || 0,
          ts: d.timestamp?.toDate?.()?.toISOString() || null,
        });
      }
    } catch (_) {}
  }
  return recent.sort((a, b) => new Date(b.ts) - new Date(a.ts)).slice(0, 50);
}

async function getStats(db) {
  // Monthly stats
  const now = new Date();
  const monthKey = `${now.getFullYear()}_${String(now.getMonth()+1).padStart(2,'0')}`;
  let monthly = {};
  try {
    const snap = await db.collection('stats').doc(`monthly_${monthKey}`).get();
    if (snap.exists) monthly = snap.data();
  } catch (_) {}
  return { monthly };
}

// ── Main handler ──────────────────────────────────────────────
export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  setCors(res, origin);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  if (!checkAuth(req)) {
    return res.status(401).json({ error: 'Səlahiyyətsiz giriş' });
  }

  const section = req.body?.section || 'all';

  try {
    const db = getDb();

    if (section === 'users') {
      const users = await getUsers(db);
      return res.status(200).json({ users });
    }

    if (section === 'chats') {
      const chats = await getSubjectChats(db);
      return res.status(200).json({ chats });
    }

    if (section === 'requests') {
      const requests = await getMaterialRequests(db);
      return res.status(200).json({ requests });
    }

    if (section === 'pdfs') {
      const pdfOpens  = await getPdfOpens(db);
      const pdfRatings = await getPdfRatings(db);
      return res.status(200).json({ pdfOpens, pdfRatings });
    }

    // all — dashboard overview
    const [users, pdfOpens, requests, stats] = await Promise.all([
      getUsers(db),
      getPdfOpens(db),
      getMaterialRequests(db),
      getStats(db),
    ]);

    return res.status(200).json({
      summary: {
        totalUsers:    users.length,
        activeToday:   users.filter(u => u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 86400000)).length,
        totalRequests: requests.length,
        openRequests:  requests.filter(r => !r.found).length,
      },
      topUsers:   users.slice(0, 10),
      pdfOpens:   pdfOpens.slice(0, 10),
      requests:   requests.slice(0, 20),
      stats,
    });

  } catch (err) {
    console.error('[admin-data]', err);
    return res.status(500).json({ error: 'Server xətası: ' + err.message });
  }
}
