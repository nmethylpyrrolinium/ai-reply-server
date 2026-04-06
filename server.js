// server.js - AI WhatsApp Reply Server (personalized, human-like)
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Gemini API key from environment variables
const GEMINI_API_KEY = process.env.API_KEY;

const PORT = process.env.PORT || 10000;

// Example messages from your exported chat to mimic your style
// You can expand this array with 20-50 of your past messages for better personalization
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

// Random delay function (1–5 seconds)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

app.get("/", (req, res) => {
    res.send("AI Reply Server is running 🎉");
});

app.post("/reply", async (req, res) => {
    try {
        const { message, sender } = req.body;

        if (!message) {
            return res.json({ success: false, reply: "No message provided" });
        }

        // Optional: only reply to specific contact (uncomment if needed)
        // if(sender !== "<your-girlfriend-number>") return;

        // Prepare prompt for Gemini
        const prompt = `
You are replying as me to my girlfriend.
Use the style and tone from these examples:
${sampleChat}
User: ${message}
Reply exactly as if you are me texting. Be short, casual, slightly flirty, natural, use emojis if appropriate.
`;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            { text: prompt }
                        ]
                    }
                ]
            }
        );

        // Extract reply
        let reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Hmm 😅";

        // Random delay before sending to feel human
        await delay(Math.floor(Math.random() * 4000) + 1000);

        res.json({ success: true, reply });

    } catch (error) {
        console.error("Gemini Error:", error.response?.data || error.message);
        res.json({ success: false, reply: "Busy rn, text you later ❤️" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log("Your AI reply service is live 🎉");
});
