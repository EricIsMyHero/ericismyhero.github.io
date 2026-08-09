// api/ask.js — Vercel Serverless Function (Groq, pulsuz tier)
export default async function handler(req, res) {

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

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { question, context, lang } = req.body;
  if (!question) return res.status(400).json({ error: 'Missing question' });
  if (typeof question !== 'string' || question.length > 400) {
    return res.status(400).json({ error: 'Sual maksimum 400 simvol ola bilər' });
  }

  const replyLang = lang === 'en' ? 'en' : 'az';

  try {
    const systemPrompt = replyLang === 'en'
      ? `You are an assistant for UNEC (Azerbaijan State University of Economics) students.
Rules:
1. Base your answer only on the "Context" section given below.
2. If the answer isn't in the context, don't make it up — say plainly that you don't have that information and point the student to the relevant subject's PDFs.
3. Alongside the subject/course list, the context sometimes includes the actual text of a PDF document (under a "document text" heading) — if that text is present, base your answer on it and mention which document it came from.
4. Answer briefly and clearly, in English, even though the source materials are in Azerbaijani.

Context:
${context}`
      : `Sən UNEC (Azərbaycan Dövlət İqtisad Universiteti) tələbələri üçün köməkçisən.
Qaydalar:
1. Yalnız aşağıda verilən "Kontekst" bölməsindəki məlumata əsaslan.
2. Kontekstdə cavab tapılmırsa, uydurma — açıq şəkildə de ki, bu məlumat səndə yoxdur və tələbəni uyğun fənnin PDF-lərinə yönləndir.
3. Kontekstdə fənn/kurs siyahısı ilə yanaşı bəzən PDF sənədlərinin əsl mətni də verilir ("sənədinin mətni" başlığı altında) — həmin mətn varsa, cavabını ona əsaslandır və hansı sənəddən götürdüyünü qeyd et.
4. Qısa, aydın, Azərbaycan dilində cavab ver.

Kontekst:
${context}`;

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
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user',   content: question }
          ],
          temperature: 0.2
        })
      }
    );

    const groqData = await groqRes.json();
    console.log('GROQ RAW:', JSON.stringify(groqData));

    const fallback = replyLang === 'en'
      ? 'Due to some minor funding constraints, the AI is temporarily unavailable.'
      : 'Bəzi cuzi maddi sıxıntılar səbəbindən hələlik AI aktiv deyildir.';
    const reply = groqData?.choices?.[0]?.message?.content ?? fallback;

    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Groq error:', err);
    return res.status(500).json({ error: 'Server xətası' });
  }
}
