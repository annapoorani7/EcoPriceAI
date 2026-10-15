const { haversineKm } = require('./distanceCalculator');

const CATEGORY_IMPACT = {
  festival: 0.9,
  concert: 0.82,
  sports: 0.78,
  conference: 0.52,
  expo: 0.6,
  cultural: 0.45,
  holiday: 0.68,
  nightlife: 0.4,
  travel: 0.58,
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const calculateEventImpact = ({ hotel, events = [], checkInDate }) => {
  if (!Array.isArray(events) || events.length === 0) {
    return 0;
  }

  if (!hotel) {
    return 0;
  }

  const hotelLat = Number(hotel.latitude || 0);
  const hotelLon = Number(hotel.longitude || 0);
  const targetDate = checkInDate ? new Date(checkInDate) : new Date();

  let strongestImpact = 0;

  events.forEach((event) => {
    if (!event) return;

    const eventCity = String(event.city || '').toLowerCase();
    const hotelCity = String(hotel.city || '').toLowerCase();
    const sameCity = eventCity && hotelCity && eventCity === hotelCity;

    const eventDate = event.startDate ? new Date(event.startDate) : new Date();
    const dayDifference = Math.abs((eventDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
    const dateFactor = dayDifference <= 3 ? 1 : dayDifference <= 7 ? 0.65 : 0.2;

    const eventDistance =
      hotelLat && hotelLon && event.latitude && event.longitude
        ? haversineKm(hotelLat, hotelLon, Number(event.latitude), Number(event.longitude))
        : 0;

    const proximityFactor =
      eventDistance === 0 ? 1 : clamp(1 - eventDistance / 60, 0.2, 1);

    const baseImpact = CATEGORY_IMPACT[String(event.category || event.type || 'festival').toLowerCase()] || 0.4;
    const impactWeight = { low: 0.4, medium: 0.7, high: 1 }[String(event.impact || 'medium').toLowerCase()] || 0.7;

    const score = sameCity || eventDistance <= 30
      ? clamp(baseImpact * impactWeight * dateFactor * proximityFactor, 0, 1)
      : 0;

    if (score > strongestImpact) {
      strongestImpact = score;
    }
  });

  return Number(strongestImpact.toFixed(2));
};

module.exports = {
  calculateEventImpact,
};
