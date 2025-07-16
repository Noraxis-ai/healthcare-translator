// /api/translate.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { inputText, outputLang, languageName } = req.body;

  if (!inputText || !outputLang || !languageName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a professional medical translator. Provide accurate, contextually appropriate translations for medical terminology and phrases."
          },
          {
            role: "user",
            content: `Translate this medical phrase to ${languageName}: "${inputText}"`
          }
        ],
        temperature: 0.4,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).json({ error: "OpenAI API error", details: error });
    }

    const data = await response.json();
    const translation = data.choices?.[0]?.message?.content?.trim();

    if (!translation) {
      return res.status(500).json({ error: "Invalid response from OpenAI API" });
    }

    return res.status(200).json({ translation });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
