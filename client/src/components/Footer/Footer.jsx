import React from 'react';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>About</h4>
          <p>Predictive Dynamic Pricing and Revenue Management System for Eco-Tourism Hospitality — built with sustainability in mind.</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/hotels">My Hotels</a></li>
            <li><a href="/bookings">Bookings</a></li>
            <li><a href="/pricing-dynamic">Suggested Room Price</a></li>
            <li><a href="/event-analysis">Nearby Events</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <p>Support options are available through your account workspace.</p>
        </div>

        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="socials">
            <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="social"><FaTwitter /></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="social"><FaFacebookF /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="social"><FaInstagram /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="social"><FaLinkedinIn /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} EcoTourism. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
