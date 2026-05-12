export default function handler(req, res) {
  // Yalnız öz saytından gələn sorğulara cavab ver
  const origin = req.headers.origin || '';
  const allowed = process.env.ALLOWED_ORIGIN || 'https://ericismyhero.github.io';

  if (!origin.startsWith(allowed)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.setHeader('Access-Control-Allow-Origin', allowed);
  res.status(200).json({
    apiKey:            process.env.FIREBASE_API_KEY,
    authDomain:        process.env.FIREBASE_AUTH_DOMAIN,
    projectId:         process.env.FIREBASE_PROJECT_ID,
    storageBucket:     process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId:             process.env.FIREBASE_APP_ID,
    measurementId:     process.env.FIREBASE_MEASUREMENT_ID,
  });
}
