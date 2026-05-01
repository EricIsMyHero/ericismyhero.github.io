import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// RATE LIMIT
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5
});
app.use(limiter);

// GEMINI API
app.post("/api/ask", async (req, res) => {
  const { question, context } = req.body;

  if (!question || question.length > 300) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Sən UNEC tələbələrinə kömək edən assistentsən. Yalnız verilən material ilə cavab ver.

Material:
${context}

Sual:
${question}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Cavab tapılmadı";

    res.json({ reply });

  } catch (err) {
    res.status(500).json({ error: "Server xətası" });
  }
});

app.get("/", (req, res) => {
  res.send("Gemini AI server işləyir");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server başladı");
});
