import React from 'react';
import './EventCard.css';

const EventCard = ({ eventName, date, location, impact }) => {
  const hasImpact = impact !== null && impact !== undefined;

  return (
    <div className="event-card">
      <h4>{eventName}</h4>
      <p className="event-date">{date}</p>
      <p className="event-location">{location}</p>
      {hasImpact && <span className={`impact-label impact-${String(impact).toLowerCase()}`}>{impact}</span>}
    </div>
  );
};

export default EventCard;
