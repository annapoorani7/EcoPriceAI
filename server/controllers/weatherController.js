const { getWeatherForDate } = require('../services/weatherService');

const getWeatherSummary = async (req, res) => {
  try {
    const { latitude, longitude, date } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const result = await getWeatherForDate({
      latitude: Number(latitude),
      longitude: Number(longitude),
      date: date || new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Weather summary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch weather summary',
    });
  }
};

module.exports = {
  getWeatherSummary,
};
