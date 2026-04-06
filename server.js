const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// ==============================
// 🔐 ENV VALIDATION
// ==============================
if (!process.env.API_KEY) {
    console.error("❌ Missing API_KEY in environment variables");
    process.exit(1);
}

const GEMINI_API_KEY = process.env.API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

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

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: `Reply in a short, casual, natural tone.\n\nMessage: ${message}`
                            }
                        ]
                    }
                ]
            },
            {
                headers: {
                    "Content-Type": "application/json"
                },
                timeout: 10000
            }
        );

        const reply =
            response.data?.candidates?.[0]?.content?.parts
                ?.map((part) => part.text || "")
                .join("") ||
            "Hmm didn't get that 😅";

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
// 🚀 START SERVER
// ==============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
