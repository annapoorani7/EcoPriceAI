const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const calculateWeatherImpact = ({ temperatureC = 24, precipitationMm = 0, humidity = 50, windKph = 10 }) => {
  let impact = 0.12;

  if (temperatureC < 12 || temperatureC > 30) {
    impact += 0.25;
  } else if (temperatureC >= 18 && temperatureC <= 28) {
    impact += 0.05;
  } else {
    impact += 0.18;
  }

  if (precipitationMm > 10) {
    impact += 0.35;
  } else if (precipitationMm > 3) {
    impact += 0.15;
  }

  if (humidity > 80) {
    impact += 0.12;
  }

  if (windKph > 35) {
    impact += 0.18;
  }

  return clamp(Number((impact * 0.9).toFixed(2)), 0, 1);
};

module.exports = {
  calculateWeatherImpact,
};
