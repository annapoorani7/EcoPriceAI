const Event = require('../models/Event');
const { syncEvents } = require('./eventScraperService');
const { seedDemoEvents } = require('./localEventsService');

/**
 * Fetch local events from the database
 *
 * Flow:
 * 1. Query database for events matching city/date filters
 * 2. If events found, return them
 * 3. If no events found, trigger sync to fetch from Ticketmaster or seed demo data
 *
 * This ensures events are always available for pricing calculations
 */
const fetchLocalEvents = async ({ city, daysAhead = 7 } = {}) => {
  const filter = {};

  if (city) {
    filter.city = { $regex: city, $options: 'i' };
  }

  const now = new Date();
  const rangeEnd = new Date(now.getTime() + (Number(daysAhead) || 7) * 24 * 60 * 60 * 1000);

  filter.startDate = {
    $gte: now,
    $lte: rangeEnd,
  };

  filter.isActive = true;

  const events = await Event.find(filter).sort({ startDate: 1 }).lean();

  // If local events found, return them
  if (events.length > 0) {
    return events;
  }

  // No local events - trigger sync from Ticketmaster/demo
  return syncEvents({ city, daysAhead });
};

module.exports = {
  fetchLocalEvents,
  syncEvents,
};
