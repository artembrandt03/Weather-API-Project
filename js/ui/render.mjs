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
