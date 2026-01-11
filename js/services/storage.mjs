const PREFIX = "weatherapp:";

export const saveWeather = (key, payload) => {
  const record = {
    savedAt: Date.now(),
    payload
  };
  localStorage.setItem(PREFIX + key, JSON.stringify(record));
};

export const loadWeather = (key) => {
  const raw = localStorage.getItem(PREFIX + key);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const isFresh = (savedAtMs, maxAgeMinutes) => {
  const ageMs = Date.now() - savedAtMs;
  return ageMs <= maxAgeMinutes * 60 * 1000;
};