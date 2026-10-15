import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaCalendarCheck,
  FaHotel,
  FaMoneyBillWave,
  FaBed,
} from 'react-icons/fa';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import EventCard from '../../components/EventCard/EventCard';
import { bookingService, eventService, hotelService } from '../../services/apiService';
import { buildBookingMetrics } from '../../utils/revenueMetrics';
import './Dashboard.css';

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const getImpactLabel = (impact) => {
  const numericImpact = Number(impact);
  if (!Number.isFinite(numericImpact)) {
    const normalizedImpact = String(impact || '').toLowerCase();
    if (normalizedImpact === 'high') return 'High';
    if (normalizedImpact === 'medium') return 'Medium';
    if (normalizedImpact === 'low') return 'Low';
    return impact || 'Not available';
  }
  if (numericImpact >= 10) return 'High';
  if (numericImpact > 0) return 'Medium';
  return 'Low';
};

const buildDashboardData = ({ hotels, bookings, events, hotelsAvailable, bookingsAvailable }) => {
  const rooms = hotels.flatMap((hotel) => Array.isArray(hotel.rooms) ? hotel.rooms : []);
  const totalRooms = rooms.reduce((sum, room) => sum + Number(room.totalRooms || 0), 0);
  const availableRooms = rooms.reduce((sum, room) => sum + Number(room.availableRooms || 0), 0);
  const currentOccupancy = !hotelsAvailable || hotels.length === 0
    ? 'Not available'
    : totalRooms > 0
    ? `${Math.round(((totalRooms - availableRooms) / totalRooms) * 100)}%`
    : 'Not available';
  const bookingMetrics = buildBookingMetrics(bookings);
  const todaysBookings = bookingsAvailable ? bookingMetrics.todaysBookings : [];
  const todaysRevenue = bookingsAvailable ? bookingMetrics.todaysRevenue : 0;
  const pricedRooms = rooms.filter((room) => Number.isFinite(Number(room.basePrice)));
  const averageRoomPrice = pricedRooms.length > 0
    ? formatCurrency(pricedRooms.reduce((sum, room) => sum + Number(room.basePrice), 0) / pricedRooms.length)
    : 'Not available';

  const dashboardEvents = events.map((event) => ({
    eventName: event.title || 'Untitled event',
    date: event.startDate ? new Date(event.startDate).toLocaleDateString() : 'Date unavailable',
    location: [event.city, event.state].filter(Boolean).join(', ') || 'Location unavailable',
    capacity: null,
    occupancy: null,
    impact: getImpactLabel(event.impact),
  }));

  return {
    hasHotel: hotelsAvailable ? hotels.length > 0 : null,
    stats: [
      { title: "Today's Bookings", value: bookingsAvailable ? todaysBookings.length : 'Not available', icon: FaCalendarCheck, trend: null, subtitle: bookingsAvailable ? "Bookings checking in today" : 'Booking data unavailable' },
      { title: 'Current Occupancy', value: currentOccupancy, icon: FaHotel, trend: null, subtitle: 'Based on available rooms' },
      { title: "Today's Revenue", value: bookingsAvailable ? formatCurrency(todaysRevenue) : 'Not available', icon: FaMoneyBillWave, trend: null, subtitle: bookingsAvailable ? "Revenue from today's check-ins" : 'Booking data unavailable' },
      { title: 'Average Room Price', value: averageRoomPrice, icon: FaBed, trend: null, subtitle: 'Average listed nightly price' },
    ],
    revenueData: bookingsAvailable ? bookingMetrics.revenueData : [],
    events: dashboardEvents,
  };
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({ hasHotel: null, stats: [], revenueData: [], events: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessages, setStatusMessages] = useState({ hotels: '', bookings: '', events: '' });

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError('');

      const results = await Promise.allSettled([
        hotelService.getHotels(),
        bookingService.getMyBookings(),
        eventService.getEvents({ daysAhead: 30 }),
      ]);

      if (!active) return;

      const [hotelsResult, bookingsResult, eventsResult] = results;
      const hotelsAvailable = hotelsResult.status === 'fulfilled';
      const bookingsAvailable = bookingsResult.status === 'fulfilled';

      const dashboard = buildDashboardData({
        hotels: hotelsAvailable ? hotelsResult.value.hotels || [] : [],
        bookings: bookingsAvailable ? bookingsResult.value.bookings || [] : [],
        events: eventsResult.status === 'fulfilled' ? eventsResult.value.data || [] : [],
        hotelsAvailable,
        bookingsAvailable,
      });

      setDashboardData(dashboard);
      setStatusMessages({
        hotels: hotelsAvailable ? '' : 'Hotels are temporarily unavailable. Your dashboard is still available.',
        bookings: bookingsAvailable ? '' : 'Booking metrics are temporarily unavailable.',
        events: eventsResult.status === 'fulfilled' ? '' : 'Upcoming events are temporarily unavailable.',
      });
      setLoading(false);
    };

    loadDashboard().catch(() => {
      if (active) {
        setError('Unable to load Dashboard data. Please try again.');
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page-shell dashboard-page">
      <div className="dashboard-hero">
        <div className="page-header-block">
          <div>
            <p className="dashboard-eyebrow">OWNER WORKSPACE</p>
            <h1>Smarter pricing for better hotel decisions.</h1>
            <p className="dashboard-intro">Manage your rooms, bookings, and pricing from one place.</p>
            <div className="dashboard-actions">
              {dashboardData.hasHotel === true && <>
                <Link to="/pricing-dynamic" className="primary-btn">Get Suggested Room Price <span aria-hidden="true">&#8594;</span></Link>
                <Link to="/hotels" className="outline-btn">Manage My Hotels</Link>
                <Link to="/bookings" className="text-link dashboard-bookings-link">View Bookings</Link>
              </>}
              {dashboardData.hasHotel === null && <Link to="/hotels" className="primary-btn">Manage My Hotels</Link>}
            </div>
          </div>
        </div>
        <div className="dashboard-hero-art" aria-hidden="true">
          <span className="hero-sun" />
          <span className="hero-hill hero-hill-back" />
          <span className="hero-hill hero-hill-front" />
          <span className="hero-building"><i /><i /><i /><i /><i /><i /></span>
          <span className="hero-tree hero-tree-left" />
          <span className="hero-tree hero-tree-right" />
        </div>
      </div>

      {loading && <div className="dashboard-status section-card">Loading Dashboard data...</div>}
      {error && <div className="dashboard-status dashboard-error section-card">{error}</div>}

      {!loading && dashboardData.hasHotel === false && (
        <div className="dashboard-empty section-card">
          <h2>Start with your first hotel</h2>
          <p>Add your hotel and at least one room to unlock suggested room pricing.</p>
          <div className="dashboard-empty-actions">
            <Link to="/hotels" className="primary-btn">Add Your First Hotel</Link>
            <Link to="/bookings" className="text-link">View Bookings</Link>
          </div>
        </div>
      )}

      {!loading && dashboardData.hasHotel !== false && dashboardData.stats.length > 0 && (
        <>
          {statusMessages.hotels && <div className="dashboard-status dashboard-notice section-card">{statusMessages.hotels}</div>}
          {statusMessages.bookings && <div className="dashboard-status dashboard-notice section-card">{statusMessages.bookings}</div>}
          <div className="stats-grid section-card" aria-label="Hotel metrics">
            {dashboardData.stats.map((stat) => (
              <DashboardCard key={stat.title} {...stat} />
            ))}
          </div>

          <div className="section-block">
            <div className="section-heading-row">
              <div><h2>Upcoming Events</h2><p>Events that may affect local demand.</p></div>
              <Link to="/event-analysis" className="text-link">View all events</Link>
            </div>

            {statusMessages.events ? <div className="dashboard-status section-card">{statusMessages.events}</div> : dashboardData.events.length > 0 ? (
              <div className="event-grid section-card">
                {dashboardData.events.map((event) => (
                  <EventCard key={`${event.eventName}-${event.date}`} {...event} />
                ))}
              </div>
            ) : (
              <div className="dashboard-status section-card">No upcoming events available.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
