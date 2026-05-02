// api/ask.js  — Vercel Serverless Function (Node.js)
export default async function handler(req, res) {

  const allowedOrigins = [
    'https://ericismyhero.github.io',
    'https://ericismyhero-github-io.vercel.app'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, context } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Missing question' });
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=...`
      ,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Sen UNEC (Azərbaycan Dövlət İqtisad Universiteti) üzrə bir köməkçisən. 
Yalnız aşağıdakı kontekst əsasında cavab ver. Kontekstdən kənar sualları rədd et.

Kontekst:
${context}

Sual: ${question}`
            }]
          }]
        })
      }
    );

    const geminiData = await geminiRes.json();
    const reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text
      ?? 'Cavab alınmadı.';

    res.setHeader('Access-Control-Allow-Origin', 'https://ericismyhero.github.io');
    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Gemini error:', err);
    return res.status(500).json({ error: 'Server xətası' });
  }
}
