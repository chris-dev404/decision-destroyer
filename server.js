import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", response.status, JSON.stringify(data));
      return res.status(response.status).json({
        error: data.error?.message || "Gemini rejected the request."
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text) {
      console.error("Unexpected Gemini response:", JSON.stringify(data));
      return res.status(502).json({ error: "Gemini returned no usable text." });
    }

    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini call failed." });
  }
});

// Serve index.html, style.css, script.js from this same folder
app.use(express.static("./public"));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
