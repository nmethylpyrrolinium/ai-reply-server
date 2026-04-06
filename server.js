const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// ==============================
// 🔐 ENV VALIDATION (IMPORTANT)
// ==============================
if (!process.env.API_KEY) {
    console.error("❌ Missing API_KEY in environment variables");
    process.exit(1);
}

const GEMINI_API_KEY = process.env.API_KEY;

// ==============================
// 🧠 HEALTH CHECK ROUTE
// ==============================
app.get("/", (req, res) => {
    res.status(200).send("✅ Server is running");
});

// ==============================
// 🤖 AI REPLY ENDPOINT
// ==============================
app.post("/reply", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                reply: "No message provided"
            });
        }

        // ==============================
        // 🧠 Gemini AI Call
        // ==============================
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-preview:generateText?key=${GEMINI_API_KEY}`,
            {
                prompt: `Reply like me: short, chill, slightly flirty, natural.\n\nUser: ${message}`,
                maxOutputTokens: 150,
                temperature: 0.7
            },
            { timeout: 10000 }
        );

        const reply =
            response.data?.candidates?.[0]?.outputText ||
            "Hmm 😅";

        return res.json({
            success: true,
            reply
        });

    } catch (error) {
        console.error("❌ Gemini API Error:", error.response?.data || error.message);

        return res.status(500).json({
            success: false,
            reply: "Busy rn, text you later ❤️"
        });
    }
});

// ==============================
// ⚠️ GLOBAL ERROR HANDLER
// ==============================
app.use((err, req, res, next) => {
    console.error("💥 Server Error:", err.stack);

    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
});

// ==============================
// 🚀 START SERVER (RENDER FIX)
// ==============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
