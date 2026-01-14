import { GEMINI } from "../settings.mjs";

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI.MODEL}:generateContent?key=${GEMINI.API_KEY}`;

export const generateWeatherSummary = async (weather) => {
  const prompt = `
You are a helpful weather assistant.

Current conditions:
Temperature: ${Math.round(weather.temp)}°C
Feels like: ${Math.round(weather.feels_like)}°C
Weather: ${weather.description}
Wind speed: ${weather.wind_speed} m/s

Respond in this format ONLY:

Summary:
- 1–2 short sentences describing the weather.

Activities:
- 3–5 bullet points suggesting suitable activities.

Bring:
- Short checklist (comma separated).

Keep it simple, friendly, and practical.
`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  };

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error("Gemini request failed");
  }

  const data = await res.json();

  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
};