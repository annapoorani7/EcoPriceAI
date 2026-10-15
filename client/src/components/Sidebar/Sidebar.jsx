import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaCalendarAlt,
  FaChartLine,
  FaHotel,
  FaSignOutAlt,
  FaUser,
  FaCog,
  FaTags,
  FaWaveSquare,
} from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import './Sidebar.css';

const sidebarSections = [
  {
    label: 'Workspace',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: MdDashboard },
      { name: 'My Hotels', path: '/hotels', icon: FaHotel },
      { name: 'Bookings', path: '/bookings', icon: FaCalendarAlt },
    ],
  },
  {
    label: 'Pricing & Insights',
    items: [
      { name: 'Suggested Room Price', path: '/pricing-dynamic', icon: FaTags },
      { name: 'Revenue Reports', path: '/revenue-analytics', icon: FaChartLine },
      { name: 'EcoPulse AI', path: '/ecopulse', icon: FaWaveSquare, ownerOnly: true },
      { name: 'Nearby Events', path: '/event-analysis', icon: FaCalendarAlt },
    ],
  },
  {
    label: 'Account',
    items: [
      { name: 'Profile', path: '/profile', icon: FaUser },
      { name: 'Settings', path: '/hotel-profile', icon: FaCog },
      { name: 'Logout', path: '/', icon: FaSignOutAlt },
    ],
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = (event) => {
    event.preventDefault();
    logout();
    onClose();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-inner">
          <div className="sidebar-brand">
            <div className="brand-dot" />
            <h3>EcoPriceAI</h3>
          </div>

          <nav className="sidebar-nav">
            {sidebarSections.map((section) => (
              <div key={section.label} className="nav-section">
                <p className="nav-section-label">{section.label}</p>
                {section.items.filter((item) => !item.ownerOnly || user?.role === 'hotelOwner').map(({ name, path, icon: Icon }) => (
                  <NavLink
                    key={name}
                    to={path}
                    end={path === '/'}
                    onClick={name === 'Logout' ? handleLogout : onClose}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon />
                    <span>{name}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {isOpen && <button className="sidebar-backdrop" aria-label="Close sidebar" onClick={onClose} />}
    </>
  );
};

export default Sidebar;
