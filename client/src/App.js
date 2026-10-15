import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { HotelProvider } from './context/HotelContext';

import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import Footer from './components/Footer/Footer';

import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import HotelDetails from './pages/HotelDetails/HotelDetails';
import Hotels from './pages/Hotels/Hotels';
import Bookings from './pages/Bookings/Bookings';
import DynamicPricing from './pages/Pricing/DynamicPricing';
import Weather from './pages/Weather/Weather';
import HotelProfile from './pages/HotelProfile/HotelProfile';
import PricingPrediction from './pages/PricingPrediction/PricingPrediction';
import EventAnalysis from './pages/EventAnalysis/EventAnalysis';
import BookingHistory from './pages/BookingHistory/BookingHistory';
import RevenueAnalytics from './pages/RevenueAnalytics/RevenueAnalytics';
import EcoPulse from './pages/EcoPulse/EcoPulse';
import Profile from './pages/Profile/Profile';

import './styles/global.css';
import './App.css';

const ProtectedRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <HotelProvider>
        <div className="app-shell">
          <Navbar
            sidebarOpen={sidebarOpen}
            onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          />

          <div className="app-layout">
            {isAuthenticated && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

            <main className="app-main">
              <Routes>
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <Home />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hotels"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <Hotels />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/bookings"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <Bookings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/pricing-dynamic"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <DynamicPricing />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/weather"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <Weather />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hotel-profile"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <HotelProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hotel-details"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <HotelDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/pricing-prediction"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <PricingPrediction />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/event-analysis"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <EventAnalysis />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/booking-history"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <BookingHistory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/revenue-analytics"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <RevenueAnalytics />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/ecopulse"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <EcoPulse />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>

          <Footer />
        </div>
      </HotelProvider>
    </Router>
  );
}

export default App;
