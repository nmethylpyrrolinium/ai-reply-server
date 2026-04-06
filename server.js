// server.js - Fully working Gemini AI WhatsApp Reply Server
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Pull your Gemini API key from environment variables
const GEMINI_API_KEY = process.env.API_KEY;

const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
    res.send("AI Reply Server is running 🎉");
});

// Main endpoint to get AI replies
app.post("/reply", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.json({ success: false, reply: "No message provided" });
        }

        // Call Gemini API with improved prompt for natural, personal replies
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: `You are replying as a teenager to your girlfriend. 
Keep it casual, short, slightly flirty, funny sometimes, natural, and human-like. 
Use emojis if appropriate. 
User says: ${message} 
Reply exactly as if you are me texting.`
                            }
                        ]
                    }
                ]
            }
        );

        // Parse reply
        const reply =
            response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Hmm 😅";

        res.json({ success: true, reply });

    } catch (error) {
        console.error("Gemini Error:", error.response?.data || error.message);
        res.json({ success: false, reply: "Busy rn, text you later ❤️" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`Your AI reply service is live 🎉`);
});
