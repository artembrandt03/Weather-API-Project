import { OPENWEATHER, LIMITS } from "../settings.mjs";

export const fetchCitySuggestions = async (query) => {
  const q = query.trim();
  const url =
    `${OPENWEATHER.GEO_DIRECT_URL}` +
    `?q=${encodeURIComponent(q)}` +
    `&limit=${LIMITS.CITY_SUGGESTIONS}` +
    `&appid=${encodeURIComponent(OPENWEATHER.API_KEY)}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Geocoding request failed (${res.status})`);
  }

  const data = await res.json();

  return Array.isArray(data)
    ? data.map((c) => ({
        name: c.name ?? "",
        country: c.country ?? "",
        state: c.state ?? "",
        lat: c.lat,
        lon: c.lon
      }))
    : [];
};
