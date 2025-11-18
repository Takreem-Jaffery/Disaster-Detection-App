const express = require("express");
const { 
  getCurrentRisk, 
  getForecastRisk, 
  getAreaRisk 
} = require("../controller/predictionController");

const router = express.Router();

router.get("/current", getCurrentRisk);
router.get("/forecast", getForecastRisk);
router.get("/area", getAreaRisk);

module.exports = router;
