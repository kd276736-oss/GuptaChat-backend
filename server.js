
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/health", (req, res) => {
  res.json({ status: "GuptaChat backend is running" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const input = [
      ...history
        .filter(item =>
          ["user", "assistant"].includes(item.role)
        )
        .map(item => ({
          role: item.role,
          content: item.content
        })),
      { role: "user", content: message }
    ];

    const response = await openai.responses.create({
      model: process.env.OPENAI_CHAT_MODEL || "gpt-5.4-mini",
      input
    });

    res.json({ answer: response.output_text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI chat request failed" });
  }
});

app.post("/api/image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const result = await openai.images.generate({
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2.5-flare",
      prompt,
      size: "1024x1024"
    });

    res.json({ image: result.data[0].b64_json });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Image generation failed" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("GuptaChat server running on port " + PORT);
});
        
