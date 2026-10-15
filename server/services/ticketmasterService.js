const axios = require('axios');

/**
 * Ticketmaster Discovery API Service
 * Handles requests to Ticketmaster API and normalizes responses
 * Returns empty array if Ticketmaster has no data or is unavailable
 */

const TICKETMASTER_BASE_URL = process.env.EVENTS_API_URL || 'https://app.ticketmaster.com/discovery/v2/events.json';
const TICKETMASTER_API_KEY = process.env.EVENTS_API_KEY;

/**
 * Check if Ticketmaster is configured
 */
const isTicketmasterConfigured = () => {
  return TICKETMASTER_API_KEY && TICKETMASTER_API_KEY !== 'your_ticketmaster_consumer_key_here';
};

/**
 * Normalize Ticketmaster event to standard format
 */
const normalizeTicketmasterEvent = (event) => {
  if (!event) return null;

  try {
    const dates = event.dates || {};
    const start = dates.start || {};
    const venue = event._embedded?.venues?.[0] || {};
    const category = event.classifications?.[0] || {};

    return {
      title: event.name || 'Unknown Event',
      description: event.description || '',
      city: venue.city?.name || '',
      state: venue.state?.stateCode || venue.state?.name || '',
      country: venue.country?.countryCode || venue.country?.name || '',
      category: (category.segment?.name || 'festival').toLowerCase(),
      impact: 'medium', // Ticketmaster doesn't provide impact data, use neutral default
      startDate: new Date(start.dateTime || start.localDate),
      endDate: dates.end ? new Date(dates.end.dateTime || dates.end.localDate) : null,
      latitude: Number(venue.location?.latitude || 0),
      longitude: Number(venue.location?.longitude || 0),
      sourceName: 'ticketmaster',
      sourceUrl: event.url || '',
      isActive: true,
      ticketmasterId: event.id,
    };
  } catch (error) {
    console.error('Error normalizing Ticketmaster event:', error.message);
    return null;
  }
};

/**
 * Fetch events from Ticketmaster
 * Returns empty array if Ticketmaster has no data or errors
 */
const fetchTicketmasterEvents = async ({ city = '', countryCode = 'IN', daysAhead = 7 } = {}) => {
  if (!isTicketmasterConfigured()) {
    console.log('Ticketmaster: Not configured (no API key)');
    return [];
  }

  try {
    const now = new Date();
    const rangeEnd = new Date(now.getTime() + (Number(daysAhead) || 7) * 24 * 60 * 60 * 1000);

    const params = {
      apikey: TICKETMASTER_API_KEY,
      countryCode: countryCode,
      startDateTime: now.toISOString(),
      endDateTime: rangeEnd.toISOString(),
      size: 200,
      sort: 'date,asc',
    };

    // Add city filter if provided
    if (city && city.trim()) {
      params.city = city;
    }

    console.log(`Ticketmaster: Fetching events for city="${city}", countryCode="${countryCode}"`);

    const response = await axios.get(TICKETMASTER_BASE_URL, {
      params,
      timeout: 10000,
    });

    const data = response.data || {};
    const totalElements = data.page?.totalElements || 0;
    const events = data._embedded?.events || [];

    console.log(`Ticketmaster: Found ${totalElements} total events (returned: ${events.length})`);

    // If Ticketmaster returns zero events, return empty array
    // This is NOT an error - Ticketmaster may legitimately have no events for India
    if (totalElements === 0) {
      console.log('Ticketmaster: Zero events found - local fallback will be used');
      return [];
    }

    const normalized = events
      .map((event) => normalizeTicketmasterEvent(event))
      .filter((event) => event !== null);

    console.log(`Ticketmaster: Normalized ${normalized.length} events`);
    return normalized;
  } catch (error) {
    // Log error but don't crash - return empty array to trigger fallback
    console.error(`Ticketmaster: Request failed - ${error.message}`);
    console.log('Ticketmaster: Falling back to local events');
    return [];
  }
};

module.exports = {
  fetchTicketmasterEvents,
  isTicketmasterConfigured,
  normalizeTicketmasterEvent,
};
