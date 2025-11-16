function generateGrid(lat, lon, step = 0.05) {
  const points = [];

  for (let dLat of [-step, 0, step]) {
    for (let dLon of [-step, 0, step]) {
      points.push({
        lat: lat + dLat,
        lon: lon + dLon
      });
    }
  }

  return points;
}

module.exports = { generateGrid };
