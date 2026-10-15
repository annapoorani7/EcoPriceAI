import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaBars,
  FaTimes,
  FaUser,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const getRoleLabel = (role) => ({
  hotelOwner: 'Hotel owner',
  admin: 'Administrator',
  customer: 'Customer',
}[role] || 'Account');

const Navbar = ({ onMenuToggle, sidebarOpen }) => {
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-inner container">
        <div className="topbar-left">
          <button
            className="mobile-menu-btn"
            onClick={() => {
              if (onMenuToggle) onMenuToggle();
            }}
            aria-label="Toggle navigation"
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>

          <Link to="/" className="brand-mark" aria-label="EcoPrice AI home">
            <span className="brand-logo">E</span>
            <span>EcoPrice AI</span>
          </Link>
        </div>

        <div className="nav-actions">
          {isAuthenticated && <div className="profile-chip">
            <div className="profile-avatar">
              <FaUser />
            </div>
            <div className="profile-meta">
              <span className="profile-name">{user?.name || user?.email || 'Hotel owner'}</span>
              <span className="profile-role">{getRoleLabel(user?.role)}</span>
            </div>
          </div>}

          {!isAuthenticated && <div className="auth-actions">
            <Link to="/login" className="outline-btn auth-btn">
              Login
            </Link>
            <Link to="/register" className="primary-btn auth-btn">
              Register
            </Link>
          </div>}
        </div>
      </div>

    </header>
  );
};

export default Navbar;
