import { LIMITS } from "../settings.mjs";
import { safeFetchJson } from "../utils.mjs";

const API_BASE = "http://localhost:5050/api";

export const fetchCitySuggestions = async (query) => {
  const q = query.trim();
  const url = `${API_BASE}/citySuggestions?q=${encodeURIComponent(q)}&limit=${LIMITS.CITY_SUGGESTIONS}`;
  return safeFetchJson(url);
};

export const fetchForecastByCoords = async (lat, lon) => {
  const url = `${API_BASE}/forecast?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
  return safeFetchJson(url);
};