export const generateWeatherSummary = async (weather) => {
  const res = await fetch("/api/geminiWeather", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weather })
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore json parse errors
  }

  if (!res.ok) {
    const msg = data?.error || `Gemini proxy failed (${res.status})`;
    const hint = data?.hint ? ` ${data.hint}` : "";
    throw new Error(msg + hint);
  }

  return data?.text ?? "";
};