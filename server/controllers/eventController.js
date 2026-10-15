const { fetchLocalEvents, syncEvents } = require('../services/eventService');

const getEvents = async (req, res) => {
  try {
    const { city, daysAhead, refresh } = req.query;
    const shouldRefresh = refresh === 'true' || refresh === '1';

    const events = shouldRefresh
      ? await syncEvents({ city, daysAhead: Number(daysAhead) || 7 })
      : await fetchLocalEvents({ city, daysAhead: Number(daysAhead) || 7 });

    return res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error('Event controller error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
};

module.exports = {
  getEvents,
};
