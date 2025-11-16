const { fetchWeather, fetchWeatherBatch } = require("../services/openMeteoService");
const { evaluateFloodRisk } = require("../services/floodRuleEngine");
const { generateGrid } = require("../services/gridService");

async function getCurrentRisk(req, res) {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "lat and lon required" });

    const data = await fetchWeather(lat, lon);
    const riskResult = evaluateFloodRisk(data);

    res.json({
      lat: Number(lat),
      lon: Number(lon),
      ...riskResult
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get risk", details: err.message });
  }
}

async function getForecastRisk(req, res) {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "lat and lon required" });

    const weather = await fetchWeather(lat, lon);
    const forecast = generate3DayForecast(weather);

    res.json({ forecast });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get forecast", details: err.message });
  }
}

// 3-day forecast - FIXED to handle API data correctly
function generate3DayForecast(data) {
  const daily = [];
  
  // Open-Meteo returns 72 hours (3 days * 24 hours) in hourly arrays
  const totalHours = data.hourly.rain.length;
  const daysToForecast = Math.min(3, Math.floor(totalHours / 24));

  for (let i = 0; i < daysToForecast; i++) {
    const startIdx = i * 24;
    const endIdx = startIdx + 24;

    // Sum rainfall for the day
    const rainfall = data.hourly.rain.slice(startIdx, endIdx)
      .reduce((a, b) => (a || 0) + (b || 0), 0);
    
    // Average soil saturation for the day (use available data)
    let soilMoisture = 0;
    if (data.hourly.soil_moisture_0_to_1cm) {
      soilMoisture = data.hourly.soil_moisture_0_to_1cm.slice(startIdx, endIdx)
        .reduce((a, b) => (a || 0) + (b || 0), 0) / 24;
    } else if (data.hourly.relative_humidity_2m) {
      soilMoisture = data.hourly.relative_humidity_2m.slice(startIdx, endIdx)
        .reduce((a, b) => (a || 0) + (b || 0), 0) / 24 / 100; // Convert to 0-1 range
    }

    // Determine risk based on rainfall and soil moisture
    let risk = "low";
    if (rainfall > 40 || soilMoisture > 0.60) risk = "medium";
    if (rainfall > 70 || soilMoisture > 0.75) risk = "high";

    daily.push({
      day: data.hourly.time[startIdx].split("T")[0],
      rainfall: Math.round(rainfall * 10) / 10,
      soilMoisture: Math.round(soilMoisture * 100) / 100,
      risk
    });
  }

  return daily;
}

// FIXED: Batch API returns array of objects, not nested arrays
async function getAreaRisk(req, res) {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "lat and lon required" });

    const grid = generateGrid(Number(lat), Number(lon));
    const weatherBatch = await fetchWeatherBatch(grid);

    // weatherBatch is an ARRAY of weather objects, one per coordinate
    const results = weatherBatch.map((weatherData, index) => {
      const risk = evaluateFloodRisk(weatherData);

      return {
        lat: grid[index].lat,
        lon: grid[index].lon,
        riskLevel: risk.risk,
        rainfall24h: risk.rainfall24h,
        soilMoisture: risk.soilMoisture
      };
    });

    res.json({ areas: results });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to compute area risk", details: err.message });
  }
}

module.exports = {
  getCurrentRisk,
  getForecastRisk,
  getAreaRisk
};