// api/ask.js  — Vercel Serverless Function (Node.js)
export default async function handler(req, res) {

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://ericismyhero.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
