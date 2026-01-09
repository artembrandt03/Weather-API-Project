export const initTabs = () => {
  const tabs = Array.from(document.querySelectorAll(".tab"));
  const panes = {
    temp: document.getElementById("tab-temp"),
    pressure: document.getElementById("tab-pressure"),
    wind: document.getElementById("tab-wind")
  };

  const setActive = (key) => {
    tabs.forEach((t) => t.classList.toggle("is-active", t.dataset.tab === key));
    Object.entries(panes).forEach(([k, el]) => el.classList.toggle("is-active", k === key));
  };

  tabs.forEach((t) => t.addEventListener("click", () => setActive(t.dataset.tab)));

  setActive("temp");
};
