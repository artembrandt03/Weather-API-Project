export const getCurrentCoords = (options = {}) =>
  new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        });
      },
      (err) => {
        const msg =
          err.code === 1 ? "Location permission denied." :
          err.code === 2 ? "Location unavailable." :
          err.code === 3 ? "Location request timed out." :
          "Could not get location.";
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0, ...options }
    );
  });