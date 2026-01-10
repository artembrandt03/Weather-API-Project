import { fetchCitySuggestions } from "./services/openweather.mjs";
import { getDom } from "./ui/dom.mjs";
import { renderCitySuggestions, renderStatus } from "./ui/render.mjs";
import { initTabs } from "./tabs.js";
import { fetchForecastByCoords } from "./services/openweather.mjs";
import {
  renderWeatherMain,
  renderTabs,
  renderCityMeta,
  renderStatus
} from "./ui/render.mjs";

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

    const forecast = await fetchForecastByCoords(
      state.coords.lat,
      state.coords.lon
    );

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

const init = () => {
  const dom = getDom();

  initTabs();

  renderCitySuggestions(dom, []);
  renderStatus(dom, "Type a city name to begin.");

  dom.cityInput.addEventListener("input", onCityInput(dom));
  dom.cityDropdown.addEventListener("change", () => onCitySelect(dom));

  dom.btnCurrentLocation?.addEventListener("click", () => {
    renderStatus(dom, "Current location: coming next phase.");
  });

  dom.btnLocalStorage?.addEventListener("click", () => {
    renderStatus(dom, "Local storage: coming next phase.");
  });
};

init();
