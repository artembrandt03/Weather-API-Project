const IMAGES_BASE = "./assets/images/changing-backgrounds";

const SLOT_TO_FILE = {
  night: "night.jpg",
  sunrise: "sunrise.jpg",
  morning: "morning.jpg",
  daytime: "daytime.jpg",
  evening: "evening.jpg",
  sunset: "sunset.jpg"
};

// Night (22-5), Sunrise (5-7), Morning (7-12), Day (12-17), Evening (17-19), Sunset (19-22)
export const getTimeSlot = (hour) => {
  const h = Number(hour);

  if (h >= 22 || h < 5) return "night";
  if (h >= 5 && h < 7) return "sunrise";
  if (h >= 7 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "daytime";
  if (h >= 17 && h < 19) return "evening";
  return "sunset"; // 19-22
};

// Testing helpers:
// 1) URL:  ?bg=night   OR ?bg=sunset etc
// 2) URL:  ?hour=21    (0-23)
// 3) Code override: pass { debugHour: 21 }
const getOverrideHourFromUrl = () => {
  const params = new URLSearchParams(window.location.search);

  const bg = params.get("bg");
  if (bg && SLOT_TO_FILE[bg]) {
    // map slot -> a representative hour so the rest of logic works
    const representative = {
      night: 23,
      sunrise: 6,
      morning: 9,
      daytime: 14,
      evening: 18,
      sunset: 20
    };
    return representative[bg];
  }

  const hourStr = params.get("hour");
  if (hourStr !== null) {
    const h = Number(hourStr);
    if (Number.isFinite(h) && h >= 0 && h <= 23) return h;
  }

  return null;
};

export const applyDynamicBackground = ({ debugHour = null } = {}) => {
  const hourFromUrl = getOverrideHourFromUrl();
  const hour =
    hourFromUrl ??
    (debugHour !== null ? debugHour : new Date().getHours());

  const slot = getTimeSlot(hour);
  const file = SLOT_TO_FILE[slot];
  const url = `${IMAGES_BASE}/${file}`;

  document.documentElement.style.setProperty("--bg-image", `url("${url}")`);

  const overlayBySlot = {
    night: "rgba(0,0,0,0.55)",
    sunrise: "rgba(0,0,0,0.30)",
    morning: "rgba(0,0,0,0.25)",
    daytime: "rgba(0,0,0,0.18)",
    evening: "rgba(0,0,0,0.30)",
    sunset: "rgba(0,0,0,0.35)"
  };
  document.documentElement.style.setProperty("--bg-overlay", overlayBySlot[slot]);

  return { hour, slot, url };
};
