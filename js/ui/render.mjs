import { formatDateTime } from "../utils.mjs";

export const renderStatus = (dom, message = "") => {
  dom.statusMsg.textContent = message;
};

export const renderCitySuggestions = (dom, suggestions) => {
  dom.cityDropdown.innerHTML = "";

  const base = document.createElement("option");
  base.value = "";
  base.textContent = suggestions.length ? "Select a city..." : "No matches";
  dom.cityDropdown.appendChild(base);

  suggestions.forEach((s, idx) => {
    const opt = document.createElement("option");
    opt.value = String(idx);

    const statePart = s.state ? `, ${s.state}` : "";
    opt.textContent = `${s.name}${statePart} - ${s.country}`;

    dom.cityDropdown.appendChild(opt);
  });

  dom.cityDropdown.disabled = suggestions.length === 0;
};

const getWeatherEmoji = (w) => {
  const id = Number(w?.id);
  const icon = String(w?.icon || "");
  const isNight = icon.endsWith("n");

  if (id >= 200 && id < 300) return "⛈️"; // thunderstorm
  if (id >= 300 && id < 400) return "🌦️"; // drizzle
  if (id >= 500 && id < 600) return "🌧️"; // rain
  if (id >= 600 && id < 700) return "🌨️"; // snow
  if (id >= 700 && id < 800) return "🌫️"; // fog/dust/etc
  if (id === 800) return isNight ? "🌙" : "☀️"; // clear
  if (id > 800 && id < 900) return isNight ? "☁️" : "⛅"; // clouds
  return "⛅";
};

export const renderWeatherMain = (dom, forecast) => {
  if (!forecast?.list?.length) return;

  const now = forecast.list[0];

  dom.mainTemp.textContent = `${Math.round(now.main.temp)} °C`;
  dom.mainDesc.textContent = now.weather?.[0]?.description ?? "";

  const w = now.weather?.[0];
  if (dom.mainIcon) dom.mainIcon.textContent = getWeatherEmoji(w);

  const cityName = forecast.city?.name ?? "—";
  if (dom.mainCity) dom.mainCity.textContent = cityName;

  // Forecast timestamp (next available slot, city-local)
  const tz = Number(forecast.city?.timezone ?? 0);
  const dt = Number(now.dt ?? 0);

  if (dt) {
    const ms = (dt + tz) * 1000;
    const d = new Date(ms);

    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");

    let hh = d.getUTCHours();
    const min = String(d.getUTCMinutes()).padStart(2, "0");
    const ampm = hh >= 12 ? "PM" : "AM";
    hh = hh % 12;
    if (hh === 0) hh = 12;

    if (dom.mainDate) dom.mainDate.textContent = `${yyyy}-${mm}-${dd}`;
    if (dom.mainTime) dom.mainTime.textContent = `${hh}:${min} ${ampm}`;
    if (dom.mainWhenNote) dom.mainWhenNote.textContent = "Next available forecast slot (not live).";
  }
};

export const renderTabs = (dom, forecast) => {
  if (!forecast?.list?.length) return;

  const now = forecast.list[0];

  // --- Temp ---
  if (dom.tempValue) dom.tempValue.textContent = Math.round(now.main.temp);
  if (dom.feelsLikeValue) dom.feelsLikeValue.textContent = Math.round(now.main.feels_like);
  if (dom.tempMaxValue) dom.tempMaxValue.textContent = Math.round(now.main.temp_max);
  if (dom.tempMinValue) dom.tempMinValue.textContent = Math.round(now.main.temp_min);

  // --- Pressure ---
  if (dom.pressureValue) dom.pressureValue.textContent = now.main.pressure ?? "—";
  if (dom.humidityValue) dom.humidityValue.textContent = now.main.humidity ?? "—";
  if (dom.seaLevelValue) dom.seaLevelValue.textContent = now.main.sea_level ?? "—";
  if (dom.groundLevelValue) dom.groundLevelValue.textContent = now.main.grnd_level ?? "—";

  // --- Wind ---
  if (dom.windSpeedValue) dom.windSpeedValue.textContent = now.wind?.speed ?? "—";
  if (dom.windGustValue) dom.windGustValue.textContent = now.wind?.gust ?? "—";
  if (dom.windDegValue) dom.windDegValue.textContent = now.wind?.deg ?? "—";
};

export const renderCityMeta = (dom, forecast) => {
  const city = forecast.city;
  if (!city) return;

  const titleEl = document.getElementById("cityDataTitle");
  if (titleEl) {
    const span = titleEl.querySelector("span");
    if (span) span.textContent = city.name ?? "—";
  }

  if (dom.popValue) dom.popValue.textContent = city.population ? String(city.population) : "—";
  if (dom.sunriseValue) dom.sunriseValue.textContent = formatDateTime(city.sunrise);
  if (dom.sunsetValue) dom.sunsetValue.textContent = formatDateTime(city.sunset);
};