/**
 * Local Indian Events Service
 * Provides fallback event data for Indian eco-tourism destinations
 * Used when Ticketmaster returns zero results
 *
 * IMPORTANT: These are DEMO/SEED events for development purposes
 * Do NOT claim these are currently happening or have verified attendance
 * The date/attendance are illustrative only for pricing demonstration
 */

const Event = require('../models/Event');

/**
 * Demo Indian eco-tourism events
 * Structure matches the normalized event format
 * Clearly marked as "local-seed" source for identification
 *
 * Dates are set relative to current time for testing purposes.
 * In production, events would be scheduled further in advance.
 */
const DEMO_INDIAN_EVENTS = [
  {
    title: 'Ooty Summer Festival',
    description: 'Annual eco-friendly festival in Ooty celebrating local culture and environmental sustainability',
    city: 'Ooty',
    state: 'Tamil Nadu',
    country: 'India',
    category: 'festival',
    impact: 'high',
    startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),   // Tomorrow
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),     // 4 days from now
    latitude: 11.4064,
    longitude: 76.6955,
    sourceName: 'local-seed',
    sourceUrl: '',
    isActive: true,
  },
  {
    title: 'Munnar Tea Garden Walk Festival',
    description: 'Eco-tourism event featuring guided tea garden walks and local heritage showcases',
    city: 'Munnar',
    state: 'Kerala',
    country: 'India',
    category: 'travel',
    impact: 'high',
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),   // 3 days from now
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),     // 6 days from now
    latitude: 10.5869,
    longitude: 77.0566,
    sourceName: 'local-seed',
    sourceUrl: '',
    isActive: true,
  },
  {
    title: 'Wayanad Wildlife Expedition',
    description: 'Guided nature expedition in Wayanad biosphere reserve with cultural immersion activities',
    city: 'Wayanad',
    state: 'Kerala',
    country: 'India',
    category: 'sports',
    impact: 'medium',
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),   // 5 days from now
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),     // 7 days from now
    latitude: 11.5957,
    longitude: 76.1226,
    sourceName: 'local-seed',
    sourceUrl: '',
    isActive: true,
  },
  {
    title: 'Coorg Coffee Festival',
    description: 'Celebration of Coorg coffee culture with plantation tours and local produce showcases',
    city: 'Coorg',
    state: 'Karnataka',
    country: 'India',
    category: 'festival',
    impact: 'high',
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),   // 2 days from now
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),     // 5 days from now
    latitude: 12.3381,
    longitude: 75.7421,
    sourceName: 'local-seed',
    sourceUrl: '',
    isActive: true,
  },
  {
    title: 'Kodaikanal Summer Summit',
    description: 'Adventure and wellness festival in the hill station with trekking, yoga, and eco-talks',
    city: 'Kodaikanal',
    state: 'Tamil Nadu',
    country: 'India',
    category: 'festival',
    impact: 'high',
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),   // 2 days from now
    endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),     // 8 days from now (extended for longer event)
    latitude: 10.2381,
    longitude: 77.4892,
    sourceName: 'local-seed',
    sourceUrl: '',
    isActive: true,
  },
  {
    title: 'Coimbatore Green Expo',
    description: 'Eco-friendly business expo and sustainability conference with local artisan market',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
    category: 'expo',
    impact: 'medium',
    startDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),   // 4 days from now
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),     // 7 days from now
    latitude: 11.0081,
    longitude: 76.9955,
    sourceName: 'local-seed',
    sourceUrl: '',
    isActive: true,
  },
];

/**
 * Seed the database with demo Indian events
 * Called during initialization to populate demo data
 * Clears old demo events first, then creates new ones with updated dates
 */
const seedDemoEvents = async () => {
  try {
    // Clear old demo events first
    const cleared = await Event.deleteMany({ sourceName: 'local-seed' });
    console.log(`Cleared ${cleared.deletedCount} old demo events`);

    // Create new demo events
    for (const eventData of DEMO_INDIAN_EVENTS) {
      await Event.create(eventData);
      console.log(`Seeded event: ${eventData.title} in ${eventData.city}`);
    }

    console.log('Demo events seeding complete');
  } catch (error) {
    console.error('Error seeding demo events:', error.message);
  }
};

/**
 * Fetch local events from database
 * Includes both demo/seed events and any user-created events
 */
const fetchLocalEvents = async ({ city = '', daysAhead = 7 } = {}) => {
  try {
    const filter = {};

    if (city && city.trim()) {
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

    console.log(`Local events: Found ${events.length} active events`);
    return events;
  } catch (error) {
    console.error('Error fetching local events:', error.message);
    return [];
  }
};

/**
 * Clear demo events (useful for testing)
 */
const clearDemoEvents = async () => {
  try {
    const result = await Event.deleteMany({ sourceName: 'local-seed' });
    console.log(`Cleared ${result.deletedCount} demo events`);
    return result;
  } catch (error) {
    console.error('Error clearing demo events:', error.message);
  }
};

module.exports = {
  fetchLocalEvents,
  seedDemoEvents,
  clearDemoEvents,
  DEMO_INDIAN_EVENTS,
};
