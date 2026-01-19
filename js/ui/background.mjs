const IMAGES_BASE = "/changing-backgrounds";

const SLOT_TO_FILE = {
  night: "night.jpg",
  sunrise: "sunrise.jpg",
  morning: "morning.jpg",
  daytime: "daytime.jpg",
  evening: "evening.jpg",
  sunset: "sunset.jpg"
};

export const applyDynamicBackground = (opts = {}) => {
  const hour =
    typeof opts.debugHour === "number"
      ? opts.debugHour
      : new Date().getHours();

  const slot =
    hour >= 22 || hour < 5 ? "night" :
    hour >= 5 && hour < 7 ? "sunrise" :
    hour >= 7 && hour < 12 ? "morning" :
    hour >= 12 && hour < 17 ? "daytime" :
    hour >= 17 && hour < 19 ? "evening" :
    "sunset";

  const url = `${IMAGES_BASE}/${SLOT_TO_FILE[slot]}`;

  document.documentElement.style.setProperty(
    "--bg-image",
    `url("${url}")`
  );
};
