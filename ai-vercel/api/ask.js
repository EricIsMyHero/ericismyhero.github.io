import { stopDuringMigration } from '../lib/maintenance.js';
import { verifyIdToken, body } from '../lib/payments.js';
import { getDoc } from '../lib/firestore.js';
import { getAiPolicy, usagePath, usageView, reserveAiUsage, refundAiUsage } from '../lib/ai.js';
// api/ask.js — Vercel Serverless Function (Groq, pulsuz tier)
export default async function handler(req, res) {
  if (stopDuringMigration(req, res)) return;

  const allowedOrigins = [
    'https://unecstudentshub.com',
    'https://www.unecstudentshub.com',
    'https://ericismyhero.github.io',
    'https://ericismyhero-github-io.vercel.app'
  ];
  const origin = req.headers.origin;
  res.setHeader('Vary', 'Origin');
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('Cache-Control', 'no-store');
  const b = body(req);
  const user = await verifyIdToken(b.idToken);
  if (!user) return res.status(401).json({ error: 'login_required' });
  if (typeof b.action === 'string' && b.action.startsWith('practice-pdf-')) {
    try { const {practicePdfAction}=await import('../lib/practice-pdf.js');const result=await practicePdfAction(b,user.uid);return res.status(result.status).json(result.json); }
    catch { return res.status(503).json({error:'pdf_unavailable'}); }
  }
  if (typeof b.action === 'string' && b.action.startsWith('written-')) {
    try {
      const { writtenAction } = await import('../lib/written-exams.js');
      const result = await writtenAction(b, user.uid);
      return res.status(result.status).json(result.json);
    } catch (_) { return res.status(503).json({ error: 'written_unavailable' }); }
  }
  let policy;
  try { policy = await getAiPolicy(user.uid); }
  catch (_) { return res.status(503).json({ error: 'usage_unavailable' }); }
  if (b.action === 'usage') {
    try { const d = await getDoc(usagePath(user.uid)); return res.status(200).json(usageView(d?.data, policy)); }
    catch (_) { return res.status(503).json({ error: 'usage_unavailable' }); }
  }
  const { question, context = '', lang } = b;
  if (!question || (typeof question === 'string' && !question.trim())) return res.status(400).json({ error: 'missing_question' });
  if (typeof question !== 'string' || question.length > policy.charLimit) {
    return res.status(400).json({ error: 'question_too_long', charLimit: policy.charLimit });
  }

  if (typeof context !== 'string' || context.length > 24000) return res.status(400).json({ error: 'invalid_context' });
  let reservation;
  try { reservation = await reserveAiUsage(user.uid, policy); }
  catch (_) { return res.status(503).json({ error: 'usage_unavailable' }); }
  if (reservation.error) return res.status(reservation.status).json(reservation);
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
        method: 'POST', signal: AbortSignal.timeout(15000),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user',   content: question }
          ],
          temperature: 0.2, max_completion_tokens: 700
        })
      }
    );

    const groqData = await groqRes.json();
    const reply = groqData?.choices?.[0]?.message?.content;
    if (!groqRes.ok || typeof reply !== 'string' || !reply) throw new Error('provider_unavailable');
    return res.status(200).json({ reply, usage: reservation.usage });

  } catch (err) {
    await refundAiUsage(user.uid, reservation.day).catch(() => {});
    return res.status(502).json({ error: 'provider_unavailable' });
  }
}
