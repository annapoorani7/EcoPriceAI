import React from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero-shell">
      <div className="hero-overlay" />
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="hero-pill">Responsible travel • Sustainable stays</p>
          <h1>Manage your hotel with clearer pricing decisions.</h1>
          <p className="hero-description">
            Review your hotel operations, bookings, and room pricing from one workspace.
          </p>
          <div className="hero-actions">
            <Link to="/pricing-prediction" className="hero-primary-btn">Get suggested pricing</Link>
            <Link to="/bookings" className="hero-secondary-btn">View bookings</Link>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-inner">
            <div className="hero-card-top">
              <div>
                <p className="hero-card-label">Owner tools</p>
                <h2>Keep your hotel decisions together</h2>
              </div>
            </div>
            <div className="hero-perks">
              {['Manage hotels and rooms', 'Review current bookings', 'Request a suggested room price'].map((item) => (
                <div key={item} className="hero-perk-item">
                  {item}
                </div>
              ))}
            </div>
            <div className="hero-card-footer">
              <div>
                <p className="hero-card-price-label">Next step</p>
                <p className="hero-card-price">Add your hotel</p>
              </div>
              <Link to="/bookings" className="hero-card-btn">View bookings</Link>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default HeroSection;
