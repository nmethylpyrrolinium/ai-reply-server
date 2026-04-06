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

const OPENROUTER_API_KEY = process.env.API_KEY;

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

        const aiResponse = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "mistralai/mistral-7b-instruct",
                messages: [
                    {
                        role: "system",
                        content: "Reply like a chill boyfriend: short, natural, slightly flirty, human tone."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 10000
            }
        );

        const reply =
            aiResponse.data?.choices?.[0]?.message?.content ||
            "Hmm didn't get that 😅";

        return res.json({
            success: true,
            reply
        });

    } catch (error) {
        console.error("❌ API Error:", error.response?.data || error.message);

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
