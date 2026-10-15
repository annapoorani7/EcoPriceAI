import React from 'react';
import './HotelDetails.css';

const HotelDetails = () => (
  <div className="hotel-details-page">
    <div className="hotel-details-container">
      <p className="soft-badge">Hotel details</p>
      <h1>Hotel details</h1>
      <div className="hotel-description section-card">
        <h3>No hotel details available</h3>
        <p>Add a hotel from My Hotels to review its details here.</p>
      </div>
    </div>
  </div>
);

export default HotelDetails;
