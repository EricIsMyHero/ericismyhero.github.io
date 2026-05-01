import express from "express";
import cors from "cors";
import fetch from "node-fetch";
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

// API
app.post("/api/ask", async (req, res) => {
  const { question, context } = req.body;

  if (!question || question.length > 300) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: "Sən UNEC tələbələrinə kömək edən assistentsən. Yalnız verilən material ilə cavab ver."
          },
          {
            role: "user",
            content: `Material:\n${context}\n\nSual:\n${question}`
          }
        ]
      })
    });

    const data = await response.json();

    res.json({
      reply: data.choices?.[0]?.message?.content || "Cavab tapılmadı"
    });

  } catch (err) {
    res.status(500).json({ error: "Server xətası" });
  }
});

app.get("/", (req, res) => {
  res.send("AI Server işləyir");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server başladı");
});
