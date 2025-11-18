const axios = require("axios");

async function fetchWeather(lat, lon) {
  // Using available forecast parameters:
  // - precipitation (total precipitation including rain)
  // - rain (liquid precipitation only)
  // - soil_moisture_0_to_1cm (correct parameter name)
  // - relative_humidity_2m (can indicate saturation)
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation,rain,soil_moisture_0_to_1cm,relative_humidity_2m&forecast_days=3&timezone=auto`;
  
  try {
    const { data } = await axios.get(url);
    
    // Validate response
    if (!data.hourly || !data.hourly.rain) {
      throw new Error("Invalid weather data received from Open-Meteo");
    }
    
    return data;
  } catch (error) {
    // If soil moisture fails, try without it
    if (error.response?.data?.reason?.includes('soil_moisture')) {
      console.warn("Soil moisture not available, using humidity as proxy");
      const fallbackUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation,rain,relative_humidity_2m&forecast_days=3&timezone=auto`;
      const { data } = await axios.get(fallbackUrl);
      return data;
    }
    throw error;
  }
}

// Batch open-meteo call - FIXED
async function fetchWeatherBatch(coords) {
  const latString = coords.map(c => c.lat).join(",");
  const lonString = coords.map(c => c.lon).join(",");

  // Try with soil moisture first, fallback to humidity
  let url = `https://api.open-meteo.com/v1/forecast?latitude=${latString}&longitude=${lonString}&hourly=precipitation,rain,soil_moisture_0_to_1cm,relative_humidity_2m&forecast_days=3&timezone=auto`;

  try {
    const { data } = await axios.get(url);
    
    // Validate batch response - it's an array of location objects
    if (!Array.isArray(data)) {
      throw new Error("Invalid batch weather data received from Open-Meteo");
    }
    
    return data;
  } catch (error) {
    // Fallback without soil moisture
    if (error.response?.data?.reason?.includes('soil_moisture')) {
      console.warn("Soil moisture not available for batch, using humidity as proxy");
      url = `https://api.open-meteo.com/v1/forecast?latitude=${latString}&longitude=${lonString}&hourly=precipitation,rain,relative_humidity_2m&forecast_days=3&timezone=auto`;
      const { data } = await axios.get(url);
      return data;
    }
    throw error;
  }
}

module.exports = {
  fetchWeather,
  fetchWeatherBatch
};