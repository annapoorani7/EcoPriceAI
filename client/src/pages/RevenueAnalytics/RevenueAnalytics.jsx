import React, { useCallback, useEffect, useState } from 'react';
import Charts from '../../components/Charts/Charts';
import { bookingService, hotelService } from '../../services/apiService';
import { buildBookingMetrics } from '../../utils/revenueMetrics';
import './RevenueAnalytics.css';

const formatInr = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? `₹${amount.toLocaleString('en-IN')}` : 'Not available';
};

const buildAnalytics = (hotels, bookings) => {
  const rooms = hotels.flatMap((hotel) => Array.isArray(hotel.rooms) ? hotel.rooms : []);
  const totalRooms = rooms.reduce((sum, room) => {
    const count = Number(room.totalRooms);
    return Number.isFinite(count) ? sum + count : sum;
  }, 0);
  const availableRooms = rooms.reduce((sum, room) => {
    const count = Number(room.availableRooms);
    return Number.isFinite(count) ? sum + count : sum;
  }, 0);
  const bookingMetrics = buildBookingMetrics(bookings);

  return {
    ...bookingMetrics,
    occupancy: totalRooms > 0 ? Math.max(0, Math.min(100, Math.round(((totalRooms - availableRooms) / totalRooms) * 100))) : 0,
  };
};

const RevenueAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [hotelResponse, bookingResponse] = await Promise.all([
        hotelService.getHotels(),
        bookingService.getMyBookings(),
      ]);
      setAnalytics(buildAnalytics(
        Array.isArray(hotelResponse.hotels) ? hotelResponse.hotels : [],
        Array.isArray(bookingResponse.bookings) ? bookingResponse.bookings : [],
      ));
    } catch (err) {
      setAnalytics(null);
      setError(err.message || 'Unable to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return (
    <div className="revenue-analytics-page">
      <div className="revenue-analytics-container">
        <p className="soft-badge">Account reporting</p>
        <h1>Revenue reports</h1>
        <p className="analytics-intro">Review revenue and booking information available to your account.</p>

        {loading && <div className="analytics-state">Loading analytics...</div>}
        {error && <div className="analytics-state analytics-error">{error}</div>}

        {!loading && !error && analytics && <>
        <div className="analytics-cards">
          <div className="analytics-card">
            <h4>Total Revenue</h4>
            <p className="card-value">{formatInr(analytics.totalRevenue)}</p>
          </div>
          <div className="analytics-card">
            <h4>Current Occupancy</h4>
            <p className="card-value">{analytics.occupancy}%</p>
            <p className="analytics-helper">Based on rooms currently available in your hotels.</p>
          </div>
          <div className="analytics-card">
            <h4>Total Bookings</h4>
            <p className="card-value">{analytics.totalBookings}</p>
          </div>
          <div className="analytics-card">
            <h4>Average Booking Value</h4>
            <p className="card-value">{formatInr(analytics.averageBooking)}</p>
          </div>
        </div>

        <div className="revenue-charts">
          {analytics.monthlyStats.length > 0 ? (
            <Charts title="Monthly Revenue" chartType="line" data={analytics.monthlyStats} />
          ) : (
            <div className="analytics-state">No analytics data available.</div>
          )}
          {analytics.monthlyStats.length > 0 ? (
            <Charts title="Monthly Booking Count" chartType="area" data={analytics.bookingChart} />
          ) : (
            <div className="analytics-state">No monthly booking data available.</div>
          )}
        </div>

        <div className="revenue-table-section">
          <h3>Monthly Revenue Details</h3>
          <table className="revenue-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Revenue</th>
                <th>Bookings</th>
                <th>Average Booking</th>
              </tr>
            </thead>
            <tbody>
              {analytics.monthlyStats.length === 0 && (
                <tr>
                  <td colSpan={4}>No booking data is available yet. Reports will appear after bookings are recorded.</td>
                </tr>
              )}
              {analytics.monthlyStats.map((stat) => (
                <tr key={stat.month}>
                  <td>{stat.month}</td>
                  <td className="revenue-cell">{formatInr(stat.revenue)}</td>
                  <td>{stat.bookings}</td>
                  <td>{formatInr(stat.averageBooking)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>}
      </div>
    </div>
  );
};

export default RevenueAnalytics;
