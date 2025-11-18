const cron = require("node-cron");
const User = require("../model/User");  
const { fetchWeather } = require("../services/openMeteoService");
const { evaluateFloodRisk } = require("../services/floodRuleEngine");
const PredictionLog = require("../model/PredictionLog");

function initializePredictionCron() {
  
  // Runs every 30 minutes
  cron.schedule("*/30 * * * *", async () => {
    console.log("Running periodic flood prediction cron job...");

    try {
      // 1. get all users (fake fallback for now)
      let users = [];
      try {
        users = await User.find();
      } catch {
        users = [
          { _id: "test1", lat: 33.12, lon: 74.98 },
          { _id: "test2", lat: 24.91, lon: 67.08 }
        ];
      }

      for (const user of users) {
        const weather = await fetchWeather(user.lat, user.lon);
        const riskResult = evaluateFloodRisk(weather);

        // 2. Save to log (optional)
        await PredictionLog.create({
          lat: user.lat,
          lon: user.lon,
          riskLevel: riskResult.risk,
          rainfall24h: riskResult.rainfall24h,
          soilMoisture: riskResult.soilMoisture
        });

        // 3. (Later) Send Notification
        /*
        if (riskResult.risk !== "low") {
            sendPushToUser(user.deviceToken, riskResult);
        }
        */
      }

      console.log("Prediction cron completed.");

    } catch (err) {
      console.error("Error in prediction cron:", err);
    }
  });
}

module.exports = { initializePredictionCron };
