const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const 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 = process.env.API_KEY;

app.post("/reply", async (req, res) => {
    const userMessage = req.body.message;

    try {
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "mistralai/mistral-7b-instruct",
                messages: [
                    {
                        role: "system",
                        content: "Reply like me: short, chill, slightly flirty, natural."
                    },
                    {
                        role: "user",
                        content: userMessage
                    }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const reply = response.data.choices[0].message.content;
        res.json({ reply });

    } catch (error) {
        console.log(error.message);
        res.json({ reply: "Busy rn, text you later ❤️" });
    }
});

app.get("/", (req, res) => {
    res.send("Server is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
