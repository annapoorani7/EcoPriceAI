import React from 'react';
import './PricingCard.css';

const PricingCard = ({ title, price, description, features, onSelect }) => {
  return (
    <div className="pricing-card">
      <div className="pricing-header">
        <h3>{title}</h3>
        <p className="price">₹{Number(price).toLocaleString('en-IN')}</p>
      </div>
      <p className="description">{description}</p>
      <ul className="features-list">
        {features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
      <button className="pricing-btn" onClick={onSelect}>
        Select Plan
      </button>
    </div>
  );
};

export default PricingCard;
