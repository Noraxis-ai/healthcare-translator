// /api/translate.js
export default async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
    return;
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { inputText, outputLang, languageName } = req.body;

  if (!inputText || !outputLang || !languageName) {
    return res.status(400).json({ 
      error: "Missing required fields", 
      required: ["inputText", "outputLang", "languageName"] 
    });
  }

  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      console.error("OpenAI API key not found in environment variables");
      return res.status(500).json({ error: "API key not configured" });
    }

    console.log(`Translating: "${inputText}" to ${languageName}`);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Fixed: was "gpt-3.5"
        messages: [
          {
            role: "system",
            content: `You are a professional medical translator. Provide accurate, contextually appropriate translations for medical terminology and phrases. Only return the translation, no explanations or additional text.`
          },
          {
            role: "user",
            content: `Translate this medical phrase to ${languageName}: "${inputText}"`
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent translations
        max_tokens: 200,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      
      let errorMessage = "Translation service error";
      if (response.status === 401) {
        errorMessage = "Invalid API key";
      } else if (response.status === 429) {
        errorMessage = "Translation service rate limit exceeded";
      } else if (response.status === 500) {
        errorMessage = "Translation service temporarily unavailable";
      }
      
      return res.status(500).json({ 
        error: errorMessage, 
        details: `OpenAI API returned ${response.status}` 
      });
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Invalid OpenAI response structure:", data);
      return res.status(500).json({ error: "Invalid response from translation service" });
    }

    const translation = data.choices[0].message.content?.trim();
    
    if (!translation) {
      console.error("Empty translation received from OpenAI");
      return res.status(500).json({ error: "Empty translation received" });
    }

    console.log(`Translation successful: "${translation}"`);
    
    return res.status(200).json({ 
      translation,
      originalText: inputText,
      targetLanguage: languageName,
      success: true
    });

  } catch (err) {
    console.error("Server error:", err);
    
    let errorMessage = "Server error";
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      errorMessage = "Cannot connect to translation service";
    } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
      errorMessage = "Network error while connecting to translation service";
    }
    
    return res.status(500).json({ 
      error: errorMessage, 
      details: err.message 
    });
  }
}
