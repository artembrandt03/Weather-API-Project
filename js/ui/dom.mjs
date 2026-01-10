export const getDom = () => {
  return {
    // city input
    cityInput: document.getElementById("cityInput"),
    cityDropdown: document.getElementById("cityDropdown"),
    statusMsg: document.getElementById("statusMsg"),

    latBox: document.getElementById("latBox"),
    lonBox: document.getElementById("lonBox"),

    // main weather
    mainTemp: document.getElementById("mainTemp"),
    mainDesc: document.getElementById("mainDesc"),

    // temp tab
    tempValue: document.getElementById("tempValue"),
    feelsLikeValue: document.getElementById("feelsLikeValue"),
    tempMaxValue: document.getElementById("tempMaxValue"),
    tempMinValue: document.getElementById("tempMinValue"),

    // city meta
    popValue: document.getElementById("popVal"),
    sunriseValue: document.getElementById("sunriseVal"),
    sunsetValue: document.getElementById("sunsetVal"),

    btnCurrentLocation: document.getElementById("btnCurrentLocation"),
    btnLocalStorage: document.getElementById("btnLocalStorage"),
    chkUseCache: document.getElementById("chkUseCache")
  };
};