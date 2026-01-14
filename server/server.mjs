import express from "express";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.PORT || 5050);
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const OWM_KEY = process.env.OPENWEATHER_API_KEY;

if (!GEMINI_KEY) console.warn("Missing GEMINI_API_KEY in .env");
if (!OWM_KEY) console.warn("Missing OPENWEATHER_API_KEY in .env");

const geminiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Rate limit reached. Try again in a few minutes." }
});

// -------------------------
// Gemini proxy
// -------------------------
app.post("/api/geminiWeather", geminiLimiter, async (req, res) => {
  try {
    if (!GEMINI_KEY) return res.status(500).json({ error: "Server missing GEMINI_API_KEY" });

    const weather = req.body?.weather;
    if (!weather) return res.status(400).json({ error: "Missing weather payload" });

    const prompt = `
You are a helpful weather assistant.

Current conditions:
Temperature: ${Math.round(weather.temp)}°C
Feels like: ${Math.round(weather.feels_like)}°C
Weather: ${weather.description || ""}
Wind speed: ${weather.wind_speed ?? 0} m/s

Respond EXACTLY in this format:

Summary:
<Summarize the weather in 1 sentence. Do not exactly repeat the input data.>

<Suggest an activity or two to do in this weather. Keep it brief.>

<Suggest what to bring (e.g., clothing, accessories) in this weather. Keep it brief.>

Sound cheerful!
`.trim();

    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_KEY
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({
        error: "Gemini request failed",
        details: data
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    res.json({ text });
  } catch (e) {
    res.status(500).json({ error: "Server error", details: String(e?.message || e) });
  }
});

// -------------------------
// OpenWeather proxies
// -------------------------
app.get("/api/citySuggestions", async (req, res) => {
  try {
    if (!OWM_KEY) return res.status(500).json({ error: "Server missing OPENWEATHER_API_KEY" });

    const q = String(req.query.q || "").trim();
    const limit = Number(req.query.limit || 3);

    const url =
      `https://api.openweathermap.org/geo/1.0/direct` +
      `?q=${encodeURIComponent(q)}` +
      `&limit=${encodeURIComponent(limit)}` +
      `&appid=${encodeURIComponent(OWM_KEY)}`;

    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok) return res.status(r.status).json({ error: "OpenWeather geocoding failed", details: data });

    const mapped = Array.isArray(data)
      ? data.map((c) => ({
          name: c.name ?? "",
          country: c.country ?? "",
          state: c.state ?? "",
          lat: c.lat,
          lon: c.lon
        }))
      : [];

    res.json(mapped);
  } catch (e) {
    res.status(500).json({ error: "Server error", details: String(e?.message || e) });
  }
});

app.get("/api/forecast", async (req, res) => {
  try {
    if (!OWM_KEY) return res.status(500).json({ error: "Server missing OPENWEATHER_API_KEY" });

    const lat = req.query.lat;
    const lon = req.query.lon;
    if (lat == null || lon == null) return res.status(400).json({ error: "Missing lat/lon" });

    const url =
      `https://api.openweathermap.org/data/2.5/forecast` +
      `?lat=${encodeURIComponent(lat)}` +
      `&lon=${encodeURIComponent(lon)}` +
      `&units=metric` +
      `&appid=${encodeURIComponent(OWM_KEY)}`;

    const r = await fetch(url);
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: "OpenWeather forecast failed", details: data });

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Server error", details: String(e?.message || e) });
  }
});

app.listen(PORT, () => {
  console.log(`[api] running on http://localhost:${PORT}`);
});