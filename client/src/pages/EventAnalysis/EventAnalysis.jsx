import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Charts from '../../components/Charts/Charts';
import EventCard from '../../components/EventCard/EventCard';
import { eventService } from '../../services/apiService';
import './EventAnalysis.css';

const formatDate = (value) => {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString();
};

const normalizeEvent = (event) => ({
  ...event,
  eventName: event.title || 'Untitled event',
  date: formatDate(event.startDate),
  location: [event.city, event.state, event.country].filter(Boolean).join(', ') || 'Location unavailable',
  capacity: null,
  occupancy: null,
  impact: event.impact || null,
});

const EventAnalysis = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await eventService.getEvents({ daysAhead: 30 });
      setAllEvents(Array.isArray(response.data) ? response.data.map(normalizeEvent) : []);
    } catch (err) {
      setAllEvents([]);
      setError(err.message || 'Unable to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const events = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allEvents;
    return allEvents.filter((e) =>
      e.eventName.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      String(e.category || '').toLowerCase().includes(q) ||
      String(e.impact || '').toLowerCase().includes(q),
    );
  }, [allEvents, query]);

  const highImpactCount = allEvents.filter((event) => event.impact === 'high').length;
  const categories = new Set(allEvents.map((event) => event.category).filter(Boolean));
  const chartData = useMemo(() => {
    const countsByDate = events.reduce((counts, event) => {
      const parsedDate = new Date(event.startDate);
      if (Number.isNaN(parsedDate.getTime())) return counts;
      const dateKey = parsedDate.toISOString().slice(0, 10);
      counts[dateKey] = (counts[dateKey] || 0) + 1;
      return counts;
    }, {});

    return Object.entries(countsByDate)
      .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
      .map(([date, value]) => ({ date, value }));
  }, [events]);

  return (
    <div className="page-shell event-analysis-page">
      <div className="page-header-block">
        <div>
          <p className="soft-badge">Demand intelligence</p>
          <h1>Nearby events</h1>
          <p className="event-intro">See upcoming events that may influence local hotel demand.</p>
        </div>
      </div>

      {loading && <div className="event-state">Loading events...</div>}
      {error && <div className="event-state event-error">{error}</div>}

      {!loading && !error && <>
      <div className="analysis-grid">
        <div className="analysis-card section-card">
          <h3>Total events</h3>
          <p className="stat-value">{allEvents.length}</p>
        </div>
        <div className="analysis-card section-card">
          <h3>High impact events</h3>
          <p className="stat-value">{highImpactCount}</p>
        </div>
        <div className="analysis-card section-card">
          <h3>Event categories</h3>
          <p className="stat-value">{categories.size}</p>
        </div>
      </div>

      <div className="events-list-section section-card">
        <div className="section-heading-row">
          <h2>Upcoming events</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by event, location, category, or impact"
            className="search-input"
          />
        </div>

        {events.length > 0 ? <div className="events-cards-grid">
          {events.map((ev) => (
            <EventCard
              key={ev._id || `${ev.eventName}-${ev.date}`}
              eventName={ev.eventName}
              date={ev.date}
              location={ev.location}
              capacity={ev.capacity}
              occupancy={ev.occupancy}
              impact={ev.impact}
            />
          ))}
        </div> : <div className="event-state"><strong>No upcoming events were found for this period.</strong><span>Events may appear later and can help explain changes in room demand.</span></div>}
      </div>

      <div className="chart-section">
        {chartData.length > 0 ? <Charts title="Events over time" chartType="bar" data={chartData} /> : <div className="event-state">No event chart data available.</div>}
      </div>
      </>}
    </div>
  );
};

export default EventAnalysis;
