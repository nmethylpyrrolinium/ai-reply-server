// server.js - WhatsApp reply server using the current Gemini REST format
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Missing API_KEY environment variable");
  process.exit(1);
}

const PORT = process.env.PORT || 10000;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const STYLE_PROMPT = `
You are helping a man reply to his girlfriend.

Write replies exactly like him.

Style rules:
- short replies (10-15 words)
- casual texting
- relaxed tone
- sometimes teasing
- calm even in arguments
- minimal emotions
- sometimes caring (sleep babe, eat smth)
- emojis (😭🤷‍♂️🥀🗣🤣😡🫵)
- no long explanations

Common words he uses:
oke, haan, hn, na, yeah, wait, later, smth, mch, babe, sleep, game, busy, back

Never write long paragraphs.
Only output the reply message.

Sample:
Her: did u eat?
You: hn idid wbu bae

Her: where are you
You: home rn

Her: why late
You: busy little cause of work
`;

app.get("/", (req, res) => {
  res.send("AI Reply Server is running 🎉");
});

app.post("/reply", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({
        success: false,
        reply: "No message provided",
      });
    }

    const prompt = `${STYLE_PROMPT}\nHer: ${message}\nYou:`;

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "x-goog-api-key": GEMINI_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    let reply =
      response.data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || "")
        .join("")
        .trim() || "hn later";

    reply = reply.replace(/^["'`]+|["'`]+$/g, "").trim();

    await delay(1200 + Math.floor(Math.random() * 2600));

    return res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Gemini Error:", error.response?.data || error.message);
    return res.json({
      success: false,
      reply: "hn busy rn later",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
