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

    // pressure tab
    pressureValue: document.getElementById("pressureValue"),
    humidityValue: document.getElementById("humidityValue"),
    seaLevelValue: document.getElementById("seaLevelValue"),
    groundLevelValue: document.getElementById("groundLevelValue"),

    // wind tab
    windSpeedValue: document.getElementById("windSpeedValue"),
    windGustValue: document.getElementById("windGustValue"),
    windDegValue: document.getElementById("windDegValue"),

    // city meta
    popValue: document.getElementById("popVal"),
    sunriseValue: document.getElementById("sunriseVal"),
    sunsetValue: document.getElementById("sunsetVal"),

    btnCurrentLocation: document.getElementById("btnCurrentLocation"),
    btnLocalStorage: document.getElementById("btnLocalStorage"),
    chkUseCache: document.getElementById("chkUseCache"),

    // extra
    mainCity: document.getElementById("mainCity"),
    mainDate: document.getElementById("mainDate"),
    mainTime: document.getElementById("mainTime"),
    mainWhenNote: document.getElementById("mainWhenNote"),
    mainIcon: document.getElementById("mainIcon")
  };
};