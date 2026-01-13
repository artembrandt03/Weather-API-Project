import { fetchCitySuggestions } from "./services/openweather.mjs";
import { getDom } from "./ui/dom.mjs";
import { renderCitySuggestions } from "./ui/render.mjs";
import { initTabs } from "./tabs.js";
import { fetchForecastByCoords } from "./services/openweather.mjs";
import {
  renderWeatherMain,
  renderTabs,
  renderCityMeta,
  renderStatus
} from "./ui/render.mjs";
import { getCurrentCoords } from "./services/geolocation.mjs";
import { saveWeather, loadWeather, isFresh } from "./services/storage.mjs";
import { applyDynamicBackground } from "./ui/background.mjs";

const state = {
  suggestions: [],
  selectedCity: null,
  coords: null,
  lastForecast: null
};

const isValidCityQuery = (value) => {
  const v = value.trim();
  if (v.length < 2 || v.length > 40) return false;
  return /^[a-zA-ZÀ-ÿ\s.'-]+$/.test(v);
};

const debounce = (fn, delayMs) => {
  let t = null;
  return (...args) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), delayMs);
  };
};

const onCityInput = (dom) =>
  debounce(async () => {
    const raw = dom.cityInput.value;

    state.selectedCity = null;
    state.coords = null;

    if (!raw.trim()) {
      state.suggestions = [];
      renderCitySuggestions(dom, []);
      renderStatus(dom, "");
      return;
    }

    if (!isValidCityQuery(raw)) {
      state.suggestions = [];
      renderCitySuggestions(dom, []);
      renderStatus(dom, "Enter a valid city name (letters/spaces only).");
      return;
    }

    try {
      renderStatus(dom, "Searching...");
      const suggestions = await fetchCitySuggestions(raw);

      state.suggestions = suggestions;
      renderCitySuggestions(dom, suggestions);

      renderStatus(dom, suggestions.length ? "Select a city from the dropdown." : "No matches found.");
    } catch (err) {
      state.suggestions = [];
      renderCitySuggestions(dom, []);
      renderStatus(dom, "Error fetching city suggestions. Check API key / network.");
      console.error(err);
    }
  }, 300);

const onCitySelect = async (dom) => {
  const idx = Number(dom.cityDropdown.value);
  if (!Number.isInteger(idx) || idx < 0 || idx >= state.suggestions.length) return;

  const chosen = state.suggestions[idx];

  state.selectedCity = chosen;
  state.coords = { lat: chosen.lat, lon: chosen.lon };

  dom.latBox.value = String(chosen.lat ?? "");
  dom.lonBox.value = String(chosen.lon ?? "");

  dom.cityDropdown.value = "";
  dom.cityDropdown.disabled = true;

  try {
    renderStatus(dom, "Fetching forecast...");

    const forecast = await getForecast(dom, state.coords.lat, state.coords.lon);

    state.lastForecast = forecast;

    renderWeatherMain(dom, forecast);
    renderTabs(dom, forecast);
    renderCityMeta(dom, forecast);

    renderStatus(dom, "Forecast loaded.");
  } catch (err) {
    console.error(err);
    renderStatus(dom, `Forecast error: ${err.message}`);
  }
};

const getForecast = async (dom, lat, lon) => {
  const cacheKey = `forecast:${lat.toFixed(3)},${lon.toFixed(3)}`;
  const useCache = !!dom.chkUseCache?.checked;

  if (useCache) {
    const cached = loadWeather(cacheKey);
    if (cached?.payload && isFresh(cached.savedAt, 20)) {
      renderStatus(dom, "Loaded forecast from cache.");
      return cached.payload;
    }
  }

  const fresh = await fetchForecastByCoords(lat, lon);
  saveWeather(cacheKey, fresh);

  saveWeather("lastForecast", fresh);

  return fresh;
};

const init = () => {
  const dom = getDom();

  if (dom.btnCurrentLocation) {
    dom.btnCurrentLocation.classList.add("is-cta");
  }

  const yearEl = document.getElementById("footerYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // -----------------------------
  // Dynamic background (time-based)
  // -----------------------------
  // Uses user's local time by default:
  //
  // Night     → 22:00 – 05:00
  // Sunrise   → 05:00 – 07:00
  // Morning   → 07:00 – 12:00
  // Daytime   → 12:00 – 17:00
  // Evening   → 17:00 – 19:00
  // Sunset    → 19:00 – 22:00
  //
  // Testing examples (uncomment ONE at a time):
  // applyDynamicBackground({ debugHour: 23 }); // Night
  // applyDynamicBackground({ debugHour: 6 });  // Sunrise
  // applyDynamicBackground({ debugHour: 9 });  // Morning
  // applyDynamicBackground({ debugHour: 14 }); // Daytime
  // applyDynamicBackground({ debugHour: 18 }); // Evening
  // applyDynamicBackground({ debugHour: 20 }); // Sunset
  //
  // Production (auto-detects local time):
  applyDynamicBackground();

  //temp
  console.log({
  mainTemp: dom.mainTemp,
  mainDesc: dom.mainDesc,
  tempValue: dom.tempValue,
  feelsLikeValue: dom.feelsLikeValue,
  tempMaxValue: dom.tempMaxValue,
  tempMinValue: dom.tempMinValue,
  sunriseValue: dom.sunriseValue,
  sunsetValue: dom.sunsetValue
  });

  initTabs();

  renderCitySuggestions(dom, []);
  renderStatus(dom, "Type a city name to begin.");

  dom.cityInput.addEventListener("input", onCityInput(dom));
  dom.cityDropdown.addEventListener("change", () => onCitySelect(dom));

  dom.btnCurrentLocation?.addEventListener("click", async () => {

    dom.btnCurrentLocation.classList.remove("is-cta");
    dom.btnCurrentLocation.classList.add("is-used");
    dom.btnCurrentLocation.textContent = "Using Current Location";
    try {
      renderStatus(dom, "Requesting location...");
      const { lat, lon } = await getCurrentCoords();

      state.selectedCity = { name: "Current Location", country: "" };
      state.coords = { lat, lon };

      dom.latBox.value = String(lat);
      dom.lonBox.value = String(lon);

      renderStatus(dom, "Fetching forecast for current location...");

      const forecast = await getForecast(dom, lat, lon);
      state.lastForecast = forecast;

      renderWeatherMain(dom, forecast);
      renderTabs(dom, forecast);
      renderCityMeta(dom, forecast);

      renderStatus(dom, "Forecast loaded (current location).");
    } catch (err) {
      console.error(err);
      renderStatus(dom, `Location error: ${err.message}`);
    }
  });

  dom.btnLocalStorage?.addEventListener("click", () => {
    const cached = loadWeather("lastForecast");
    if (!cached?.payload) {
      renderStatus(dom, "No cached forecast found yet.");
      return;
    }

    state.lastForecast = cached.payload;

    renderWeatherMain(dom, cached.payload);
    renderTabs(dom, cached.payload);
    renderCityMeta(dom, cached.payload);

    renderStatus(dom, "Loaded last forecast from local storage.");
  });
};

init();
