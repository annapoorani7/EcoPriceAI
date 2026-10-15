const Hotel = require('../models/Hotel');
const Event = require('../models/Event');
const { calculateEventImpact } = require('../utils/eventImpact');
const { calculateWeatherImpact } = require('../utils/weatherImpact');
const { getWeatherForDate } = require('./weatherService');

const determineSeason = (date) => {
  const month = new Date(date).getMonth() + 1;
  if (month >= 6 && month <= 8) return 'peak';
  if (month >= 3 && month <= 5) return 'shoulder';
  return 'low';
};

const buildPricingContext = async (payload = {}, user = null) => {
  const hotelId = payload.hotelId || payload.hotelID || payload.hotel;
  const roomType = payload.roomType;
  const checkInDate = payload.checkInDate || payload.date;

  if (!hotelId) {
    return payload;
  }

  const hotel = await Hotel.findById(hotelId).lean();
  if (!hotel) {
    return payload;
  }

  if (user?.role !== 'admin' && hotel.owner?.toString() !== user?._id?.toString()) {
    const error = new Error('You are not authorized to use pricing data for this hotel');
    error.statusCode = 403;
    throw error;
  }

  if (!roomType || !checkInDate) {
    return payload;
  }

  const room = Array.isArray(hotel.rooms)
    ? hotel.rooms.find((entry) => entry.roomType === roomType)
    : null;

  const basePrice = Number(payload.basePrice ?? room?.basePrice ?? 0);
  const totalRooms = Number(room?.totalRooms ?? hotel.rooms?.length ?? 0);
  const availableRooms = Number(room?.availableRooms ?? 0);
  const numberOfBookings = Number(payload.numberOfBookings ?? Math.max(totalRooms - availableRooms, 1));
  const occupancyRate = Number(payload.occupancyRate ?? (totalRooms > 0 ? (totalRooms - availableRooms) / totalRooms : 0));
  const daysUntilCheckIn = Math.max(0, Math.ceil((new Date(checkInDate) - new Date()) / (1000 * 60 * 60 * 24)));
  const weekend = Number(payload.weekend ?? (new Date(checkInDate).getDay() === 0 || new Date(checkInDate).getDay() === 6 ? 1 : 0));

  const [weather, matchedEvents] = await Promise.all([
    getWeatherForDate({
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      date: checkInDate,
    }).catch((error) => {
      console.error('Pricing context weather lookup failed:', error.message);
      return {
        temperatureC: 27,
        precipitationMm: 4,
        humidity: 68,
        windKph: 11,
      };
    }),
    Event.find({
      city: { $regex: hotel.city || '', $options: 'i' },
      startDate: {
        $gte: new Date(new Date(checkInDate).getTime() - 3 * 24 * 60 * 60 * 1000),
        $lte: new Date(new Date(checkInDate).getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    }).lean().catch((error) => {
      console.error('Pricing context event lookup failed:', error.message);
      return [];
    }),
  ]);

  const eventImpact = calculateEventImpact({
    hotel,
    events: matchedEvents,
    checkInDate,
  });

  const weatherImpact = calculateWeatherImpact({
    temperatureC: weather.temperatureC,
    precipitationMm: weather.precipitationMm,
    humidity: weather.humidity,
    windKph: weather.windKph,
  });

  return {
    ...payload,
    basePrice,
    occupancyRate,
    numberOfBookings,
    availableRooms,
    totalRooms,
    daysUntilCheckIn,
    season: payload.season || determineSeason(checkInDate),
    weekend,
    eventImpact,
    weatherImpact,
    hotelCity: hotel.city,
    hotelLatitude: hotel.latitude,
    hotelLongitude: hotel.longitude,
    externalContext: {
      eventImpact,
      weatherImpact,
      weather,
      matchedEvents: matchedEvents.length,
    },
  };
};

module.exports = {
  buildPricingContext,
};
