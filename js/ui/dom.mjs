export const getDom = () => {
  const cityInput = document.getElementById("cityInput");
  const cityDropdown = document.getElementById("cityDropdown");
  const statusMsg = document.getElementById("statusMsg");

  const latBox = document.getElementById("latBox");
  const lonBox = document.getElementById("lonBox");

  const btnCurrentLocation = document.getElementById("btnCurrentLocation");
  const btnLocalStorage = document.getElementById("btnLocalStorage");
  const chkUseCache = document.getElementById("chkUseCache");

  return {
    cityInput,
    cityDropdown,
    statusMsg,
    latBox,
    lonBox,
    btnCurrentLocation,
    btnLocalStorage,
    chkUseCache
  };
};
