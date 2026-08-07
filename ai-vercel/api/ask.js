// api/ask.js — Vercel Serverless Function (Groq, pulsuz tier)
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

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { question, context } = req.body;
  if (!question) return res.status(400).json({ error: 'Missing question' });

  try {
    const prompt = `Sən UNEC (Azərbaycan Dövlət İqtisad Universiteti) üzrə bir köməkçisən.
Yalnız aşağıdakı kontekst əsasında cavab ver. Kontekstdən kənar sualları rədd et.
Kontekst:
${context}
Sual: ${question}`;

    const groqRes = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.4
        })
      }
    );

    const groqData = await groqRes.json();
    console.log('GROQ RAW:', JSON.stringify(groqData));

    const reply = groqData?.choices?.[0]?.message?.content
      ?? 'Bəzi cuzi maddi sıxıntılar səbəbindən hələlik AI aktiv deyildir.';

    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Groq error:', err);
    return res.status(500).json({ error: 'Server xətası' });
  }
}
