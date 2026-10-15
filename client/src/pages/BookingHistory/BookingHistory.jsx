import React from 'react';
import './BookingHistory.css';

const BookingHistory = () => {
  const bookings = [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'status-completed';
      case 'Confirmed':
        return 'status-confirmed';
      case 'Pending':
        return 'status-pending';
      default:
        return 'status-default';
    }
  };

  return (
    <div className="booking-history-page">
      <div className="booking-history-container">
        <h2>Booking History</h2>

        <div className="booking-filters">
          <input type="date" placeholder="From Date" className="filter-input" />
          <input type="date" placeholder="To Date" className="filter-input" />
          <select className="filter-input">
            <option>All Status</option>
            <option>Completed</option>
            <option>Confirmed</option>
            <option>Pending</option>
          </select>
        </div>

        <div className="booking-table-wrapper">
          <table className="booking-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest Name</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && <tr><td colSpan="6">No booking history is available.</td></tr>}
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>{booking.guestName}</td>
                  <td>{booking.checkIn}</td>
                  <td>{booking.checkOut}</td>
                  <td className="amount">{booking.amount}</td>
                  <td><span className={`status-badge ${getStatusColor(booking.status)}`}>{booking.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;
