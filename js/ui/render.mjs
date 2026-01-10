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

export const renderWeatherMain = (dom, forecast) => {
  if (!forecast?.list?.length) return;

  const now = forecast.list[0];
  dom.mainTemp.textContent = `${Math.round(now.main.temp)} °C`;
  dom.mainDesc.textContent = now.weather[0]?.description ?? "";
};

export const renderTabs = (dom, forecast) => {
  const now = forecast.list[0];
  dom.tempValue.textContent = Math.round(now.main.temp);
  dom.feelsLikeValue.textContent = Math.round(now.main.feels_like);
  dom.tempMaxValue.textContent = Math.round(now.main.temp_max);
  dom.tempMinValue.textContent = Math.round(now.main.temp_min);
};

export const renderCityMeta = (dom, forecast) => {
  const city = forecast.city;
  if (!city) return;

  if (dom.popValue) dom.popValue.textContent = city.population ? String(city.population) : "—";
  if (dom.sunriseValue) dom.sunriseValue.textContent = formatDateTime(city.sunrise);
  if (dom.sunsetValue) dom.sunsetValue.textContent = formatDateTime(city.sunset);
};