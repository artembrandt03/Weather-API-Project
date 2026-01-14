import express from "express";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
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

// Logic for demo tries per day
const DAILY_AI_LIMIT = 3;
const aiUsage = new Map(); // key -> { date: "YYYY-MM-DD", count: number }

const todayKey = () => new Date().toISOString().slice(0, 10);

const getClientId = (req) => {
  // basic: IP-based
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  return ip;
};

const checkDailyQuota = (req) => {
  const id = getClientId(req);
  const today = todayKey();

  const entry = aiUsage.get(id);
  if (!entry || entry.date !== today) {
    aiUsage.set(id, { date: today, count: 0 });
  }

  const cur = aiUsage.get(id);
  if (cur.count >= DAILY_AI_LIMIT) return { ok: false, remaining: 0 };

  cur.count += 1;
  return { ok: true, remaining: DAILY_AI_LIMIT - cur.count };
};

// -------------------------
// Gemini proxy
// -------------------------
app.post("/api/geminiWeather", geminiLimiter, async (req, res) => {
  const quota = checkDailyQuota(req);
  if (!quota.ok) {
    return res.status(429).json({
      error: "You're out of tries for the demo today.",
      hint: "API needs to rest! Try again tomorrow."
    });
  }
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "..", "dist");

// Only serve built frontend in production
if (process.env.NODE_ENV === "production") {
  if (!fs.existsSync(distPath)) {
    console.warn(`[server] dist folder not found at: ${distPath}`);
    console.warn(`[server] Did you run "npm run build"?`);
  } else {
    app.use(express.static(distPath));

    // SPA fallback (regex avoids path-to-regexp "*" crash)
    app.get(/^(?!\/api).*/, (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

app.listen(PORT, () => {
  console.log(`[server] running on port ${PORT}`);
});