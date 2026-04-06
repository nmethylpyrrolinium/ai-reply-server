
// server.js - AI WhatsApp Reply Server (Gemini working model)
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

// Example chat style (expand with your own later)
const sampleChat = `
User: Hey what are you doing?
Me: Just chilling, u? 😏
User: HI LOL
Me: LOL 😂 that’s wild!
User: Tf u mean
Me: Hmm, gotcha 😅
User: What u got
Me: Okay! Cool 😎
`;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

app.get("/", (req, res) => {
    res.send("AI Reply Server is running 🎉");
});

app.post("/reply", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.json({ success: false, reply: "No message provided" });
        }

        const prompt = `
You are replying as me to my girlfriend.
Use the style and tone from these examples:
${sampleChat}
User: ${message}
Reply exactly as if you are me texting. Be short, casual, slightly flirty, natural, use emojis.
        `;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateText?key=${GEMINI_API_KEY}`,
            {
                prompt: prompt,
                temperature: 0.8,
                maxOutputTokens: 150
            }
        );

        const reply =
            response.data?.output?.text ||
            "Hmm 😅";

        // random human-like delay (1–5 sec)
        await delay(Math.floor(Math.random() * 4000) + 1000);

        res.json({ success: true, reply });

    } catch (error) {
        console.error("Gemini Error:", error.response?.data || error.message);
        res.json({ success: false, reply: "Busy rn, text you later ❤️" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
