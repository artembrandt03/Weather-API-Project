export const generateWeatherSummary = async (weather) => {
  const res = await fetch("http://localhost:5050/api/geminiWeather", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weather })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Gemini proxy failed");

  return data.text ?? "";
};