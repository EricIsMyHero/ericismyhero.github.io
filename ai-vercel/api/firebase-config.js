// api/firebase-config.js
// Vercel serverless function — Firebase config-i env variable-lardan qaytarır.
// Bu fayl GitHub-da görünür, amma dəyərlər Vercel-in
// Environment Variables bölməsindən gəlir — heç vaxt açıq olmur.

export default function handler(req, res) {
  // Yalnız GET sorğusuna cavab ver
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // İcazə verilən origin — öz saytın
  const allowedOrigins = [
    'https://ericismyhero.github.io',
    'https://ericismyhero-github-io.vercel.app',
  ];

  const origin = req.headers.origin || '';
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // CORS header-ları
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'no-store'); // config-i cache etmə

  // Env variable-ların hamısı dolu olduğunu yoxla
  const required = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID',
  ];

  for (const key of required) {
    if (!process.env[key]) {
      console.error(`[firebase-config] Əksik env variable: ${key}`);
      return res.status(500).json({ error: 'Server konfiqurasiya xətası' });
    }
  }

  // Config-i qaytart
  return res.status(200).json({
    apiKey:            process.env.FIREBASE_API_KEY,
    authDomain:        process.env.FIREBASE_AUTH_DOMAIN,
    projectId:         process.env.FIREBASE_PROJECT_ID,
    storageBucket:     process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId:             process.env.FIREBASE_APP_ID,
    measurementId:     process.env.FIREBASE_MEASUREMENT_ID || '',
  });
}
