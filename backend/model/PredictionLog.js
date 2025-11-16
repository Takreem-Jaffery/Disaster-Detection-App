const mongoose = require("mongoose");

const predictionLogSchema = new mongoose.Schema({
  lat: Number,
  lon: Number,
  riskLevel: String,
  rainfall24h: Number,
  soilMoisture: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PredictionLog", predictionLogSchema);
