const pricingService = require('../services/pricingService');
const { buildPricingContext } = require('../services/pricingContextService');

const predictPrice = async (req, res) => {
  try {
    const payload = req.body;

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Pricing payload is required',
      });
    }

    let enrichedPayload = { ...payload };
    const hasHotelContext = Boolean(payload.hotelId || payload.hotelID || payload.hotel || payload.roomType || payload.checkInDate);

    if (hasHotelContext) {
      const context = await buildPricingContext(payload, req.user);
      enrichedPayload = { ...enrichedPayload, ...context };
    }

    const requiredFields = [
      'basePrice',
      'occupancyRate',
      'numberOfBookings',
      'availableRooms',
      'totalRooms',
      'daysUntilCheckIn',
      'season',
      'weekend',
      'eventImpact',
      'weatherImpact',
    ];

    const missingFields = requiredFields.filter((field) => enrichedPayload[field] === undefined || enrichedPayload[field] === null || enrichedPayload[field] === '');
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required pricing fields: ${missingFields.join(', ')}`,
      });
    }

    const basePrice = Number(enrichedPayload.basePrice);
    const occupancyRate = Number(enrichedPayload.occupancyRate);
    const numberOfBookings = Number(enrichedPayload.numberOfBookings);
    const availableRooms = Number(enrichedPayload.availableRooms);
    const totalRooms = Number(enrichedPayload.totalRooms);
    const daysUntilCheckIn = Number(enrichedPayload.daysUntilCheckIn);
    const weekend = Number(enrichedPayload.weekend);
    const eventImpact = Number(enrichedPayload.eventImpact);
    const weatherImpact = Number(enrichedPayload.weatherImpact);

    if (basePrice <= 0) {
      return res.status(400).json({ success: false, message: 'basePrice must be greater than 0' });
    }
    if (occupancyRate < 0 || occupancyRate > 1) {
      return res.status(400).json({ success: false, message: 'occupancyRate must be between 0 and 1' });
    }
    if (availableRooms < 0) {
      return res.status(400).json({ success: false, message: 'availableRooms must be greater than or equal to 0' });
    }
    if (totalRooms <= 0) {
      return res.status(400).json({ success: false, message: 'totalRooms must be greater than 0' });
    }
    if (daysUntilCheckIn < 0) {
      return res.status(400).json({ success: false, message: 'daysUntilCheckIn must be greater than or equal to 0' });
    }
    if (weekend !== 0 && weekend !== 1) {
      return res.status(400).json({ success: false, message: 'weekend must be 0 or 1' });
    }
    if (eventImpact < 0 || eventImpact > 1) {
      return res.status(400).json({ success: false, message: 'eventImpact must be between 0 and 1' });
    }
    if (weatherImpact < 0 || weatherImpact > 1) {
      return res.status(400).json({ success: false, message: 'weatherImpact must be between 0 and 1' });
    }

    const result = await pricingService.getRecommendedPrice({
      basePrice,
      occupancyRate,
      numberOfBookings,
      availableRooms,
      totalRooms,
      daysUntilCheckIn,
      season: String(enrichedPayload.season || 'low'),
      weekend,
      eventImpact,
      weatherImpact,
    });

    return res.status(200).json({
      success: true,
      pricing: {
        basePrice: Number(result.basePrice),
        recommendedPrice: Number(result.recommendedPrice),
        priceChange: Number(result.priceChange),
        priceChangePercentage: Number(result.priceChangePercentage),
      },
    });
  } catch (error) {
    console.error('Pricing prediction error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to calculate recommended price',
    });
  }
};

module.exports = {
  predictPrice,
};
