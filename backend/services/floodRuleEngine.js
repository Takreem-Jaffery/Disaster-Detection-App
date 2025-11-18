function evaluateFloodRisk(weatherData) {
  // Validate input
  if (!weatherData.hourly || !weatherData.hourly.rain) {
    throw new Error("Invalid weather data structure");
  }

  const rainfall24h = sumLast24Hours(weatherData.hourly.rain);
  
  // Use soil moisture if available, otherwise use humidity as proxy
  let soilSaturation = 0;
  
  if (weatherData.hourly.soil_moisture_0_to_1cm) {
    // Soil moisture is typically 0-1 range (0-100%)
    soilSaturation = average(weatherData.hourly.soil_moisture_0_to_1cm);
  } else if (weatherData.hourly.relative_humidity_2m) {
    // Convert humidity (0-100%) to 0-1 range as proxy for saturation
    soilSaturation = average(weatherData.hourly.relative_humidity_2m) / 100;
  }

  let risk = "low";
  let message = "No significant flood risk.";

  // Medium risk conditions
  if (rainfall24h > 40 || soilSaturation > 0.60) {
    risk = "medium";
    message = "Moderate flood risk due to rainfall and soil saturation.";
  }
  
  // High risk conditions (override medium)
  if (rainfall24h > 70 || soilSaturation > 0.75) {
    risk = "high";
    message = "High flood risk. Heavy rainfall and saturated conditions detected.";
  }

  return { 
    risk, 
    rainfall24h: Math.round(rainfall24h * 10) / 10, 
    soilMoisture: Math.round(soilSaturation * 100) / 100, 
    message 
  };
}

function sumLast24Hours(arr) {
  if (!arr || arr.length === 0) return 0;
  
  // If less than 24 hours, sum all available
  const hoursToSum = Math.min(24, arr.length);
  return arr.slice(-hoursToSum).reduce((a, b) => (a || 0) + (b || 0), 0);
}

function average(arr) {
  if (!arr || arr.length === 0) return 0;
  
  // Filter out null/undefined values
  const validValues = arr.filter(val => val !== null && val !== undefined);
  if (validValues.length === 0) return 0;
  
  const sum = validValues.reduce((a, b) => a + b, 0);
  return sum / validValues.length;
}

module.exports = {
  evaluateFloodRisk
};