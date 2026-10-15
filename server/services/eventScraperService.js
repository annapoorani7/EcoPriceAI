const Event = require('../models/Event');
const { fetchTicketmasterEvents } = require('./ticketmasterService');
const { fetchLocalEvents, seedDemoEvents } = require('./localEventsService');

/**
 * Sync events from external sources (Ticketmaster) and local database
 *
 * Flow:
 * 1. Try Ticketmaster API
 * 2. If Ticketmaster returns events, save and return them
 * 3. If Ticketmaster returns zero events or fails, use local database
 * 4. If local database is empty, seed demo events and return them
 * 5. Always return normalized local events for consistency
 *
 * This ensures the application always has event data for pricing calculations
 */
const syncEvents = async ({ city = '', daysAhead = 7 } = {}) => {
  console.log(`\n=== Event Sync Started ===`);
  console.log(`Parameters: city="${city}", daysAhead=${daysAhead}`);

  // Try to fetch from Ticketmaster first
  const ticketmasterEvents = await fetchTicketmasterEvents({
    city,
    countryCode: 'IN',
    daysAhead,
  });

  console.log(`Ticketmaster returned: ${ticketmasterEvents.length} events`);

  // If Ticketmaster has events, save them and return
  if (ticketmasterEvents.length > 0) {
    console.log('Using Ticketmaster events');
    const saved = [];
    for (const event of ticketmasterEvents) {
      const saved_event = await Event.findOneAndUpdate(
        {
          title: event.title,
          city: event.city,
          sourceName: 'ticketmaster'
        },
        { $set: event },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      saved.push(saved_event);
    }
    console.log(`=== Event Sync Complete: ${saved.length} Ticketmaster events ===\n`);
    return saved;
  }

  // Ticketmaster returned zero events - use local fallback
  console.log('Ticketmaster returned zero events - using local fallback');

  // Fetch from local database
  let localEvents = await fetchLocalEvents({ city, daysAhead });
  console.log(`Local database has: ${localEvents.length} events`);

  // If local database is empty, seed demo events
  if (localEvents.length === 0) {
    console.log('Local database is empty - seeding demo Indian events');
    await seedDemoEvents();
    localEvents = await fetchLocalEvents({ city, daysAhead });
    console.log(`After seeding: ${localEvents.length} events`);
  }

  console.log(`=== Event Sync Complete: ${localEvents.length} local events ===\n`);
  return localEvents;
};

/**
 * Get events - used for initial fetch in fetchLocalEvents
 * This now delegates to syncEvents with fallback logic
 */
const getEvents = async ({ city = '', daysAhead = 7 } = {}) => {
  return syncEvents({ city, daysAhead });
};

module.exports = {
  syncEvents,
  getEvents,
};
