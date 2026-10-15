const axios = require('axios');

const buildFallbackWeather = ({ latitude, longitude, date }) => ({
  latitude,
  longitude,
  date: date || new Date().toISOString(),
  temperatureC: 27,
  precipitationMm: 4,
  humidity: 68,
  windKph: 11,
  summary: 'Clear with mild tropical conditions',
  source: 'fallback',
});

const getWeatherForDate = async ({ latitude, longitude, date }) => {
  if (!latitude || !longitude) {
    return buildFallbackWeather({ latitude, longitude, date });
  }

  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    return buildFallbackWeather({ latitude, longitude, date });
  }

  try {
    const formattedDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        daily: 'temperature_2m_max,precipitation_sum,weathercode',
        current: 'temperature_2m,precipitation,relative_humidity_2m,wind_speed_10m',
        timezone: 'auto',
        start_date: formattedDate,
        end_date: formattedDate,
      },
      timeout: 10000,
    });

    const daily = response.data.daily;
    const current = response.data.current;

    const temperatureC = Number(current?.temperature_2m ?? daily?.temperature_2m_max?.[0] ?? 27);
    const precipitationMm = Number(current?.precipitation ?? daily?.precipitation_sum?.[0] ?? 4);
    const humidity = Number(current?.relative_humidity_2m ?? 68);
    const windKph = Number(current?.wind_speed_10m ?? 11);

    return {
      latitude,
      longitude,
      date: formattedDate,
      temperatureC,
      precipitationMm,
      humidity,
      windKph,
      summary: 'Weather fetched from Open-Meteo',
      source: 'open-meteo',
    };
  } catch (error) {
    console.error('Weather service error:', error.message);
    return buildFallbackWeather({ latitude, longitude, date });
  }
};

module.exports = {
  getWeatherForDate,
};
