import { GEMINI } from "../settings.mjs";

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI.MODEL}:generateContent`;

export const generateWeatherSummary = async (weather) => {
  const prompt = `
You are a helpful weather assistant.

Current conditions:
Temperature: ${Math.round(weather.temp)}°C
Feels like: ${Math.round(weather.feels_like)}°C
Weather: ${weather.description}
Wind speed: ${weather.wind_speed} m/s

Respond EXACTLY in this format:

Summary:
<1–2 sentences>

Activities:
- bullet
- bullet
- bullet

Bring:
item, item, item
`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 256
    }
  };

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GEMINI.API_KEY
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Gemini error:", errText);
    throw new Error("Gemini request failed");
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
};