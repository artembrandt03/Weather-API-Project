import { safeFetchJson } from "../utils.mjs";

const API_BASE = "/api";

const CITY_SUGGESTION_LIMIT = 3;

export const fetchCitySuggestions = async (query) => {
  const q = query.trim();
  const url = `${API_BASE}/citySuggestions?q=${encodeURIComponent(q)}&limit=${CITY_SUGGESTION_LIMIT}`;
  return safeFetchJson(url);
};

export const fetchForecastByCoords = async (lat, lon) => {
  const url = `${API_BASE}/forecast?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
  return safeFetchJson(url);
};