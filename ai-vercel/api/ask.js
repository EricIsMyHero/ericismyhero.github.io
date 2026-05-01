export default async function handler(req, res) {
  // CORS — GitHub Pages domeninə icazə ver
  res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Yalnız POST icazəlidir" });
  }

  const { question, context } = req.body || {};

  if (!question || typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ error: "Sual boşdur" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API açarı konfiqurasiya edilməyib" });
  }

  // Prompt: context varsa material əsasında, yoxsa ümumi kömək
  const systemPrompt = context
    ? `Sən UNEC tələbələrinə kömək edən AI köməkçisisən.
Aşağıdakı material əsasında tələbənin sualını cavablandır.
Cavabı Azərbaycan dilində, qısa və aydın şəkildə ver.
Material mövcud deyilsə və ya sual materiala aid deyilsə, bunu bildirirsən.

Mövcud materiallar:
${context}

Sualı cavablandır.`
    : `Sən UNEC (Azərbaycan Dövlət İqtisad Universiteti) tələbələrinə kömək edən AI köməkçisisən.
Azərbaycan dilində qısa, dəqiq cavab ver.`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${systemPrompt}\n\nSual: ${question.trim()}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 512
          }
        })
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error("Gemini xəta:", err);
      return res.status(502).json({ error: "AI xidməti cavab vermədi" });
    }

    const geminiData = await geminiRes.json();
    const reply =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "Cavab alınmadı. Sualı başqa cür soruşmağa çalış.";

    return res.status(200).json({ reply });
  } catch (e) {
    console.error("Server xəta:", e);
    return res.status(500).json({ error: "Server xətası baş verdi" });
  }
}
