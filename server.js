// server.js - AI WhatsApp Reply Server (Your exact texting style)
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Gemini API key from environment
const GEMINI_API_KEY = process.env.API_KEY;
const PORT = process.env.PORT || 10000;

// Random delay to mimic typing (1–5 sec)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Base style prompt (your texting style + common words + emojis)
const basePrompt = `
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
oke, haan, hn, na, yeah, wait, later, smth, mch, babe

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
    const { message } = req.body;

    if (!message) {
      return res.json({ success: false, reply: "No message provided" });
    }

    // Combine base prompt + incoming message
    const prompt = `${basePrompt}\nHer: ${message}\nYou:`;

    // Gemini API call (text-bison-001)
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateText?key=${GEMINI_API_KEY}`,
      {
        prompt: { text: prompt },
        temperature: 0.8,
        maxOutputTokens: 60
      }
    );

    // Extract reply
    const reply = response.data?.output?.text?.trim() || "hn later";

    // Random delay (human-like)
    await delay(Math.floor(Math.random() * 4000) + 1000);

    // Return success: true + exact reply text
    res.json({ success: true, reply });

  } catch (error) {
    console.error("Gemini Error:", error.response?.data || error.message);
    // Only fallback when API fails
    res.json({ success: false, reply: "hn busy rn later ❤️" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
