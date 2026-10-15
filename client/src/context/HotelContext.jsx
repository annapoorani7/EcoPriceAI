import React, { createContext, useContext, useState, useCallback } from 'react';

const HotelContext = createContext();

export const HotelProvider = ({ children }) => {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateHotel = useCallback((hotelData) => {
    setHotel(hotelData);
  }, []);

  const setHotelError = useCallback((err) => {
    setError(err);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    hotel,
    loading,
    error,
    updateHotel,
    setHotelError,
    clearError,
    setLoading,
  };

  return <HotelContext.Provider value={value}>{children}</HotelContext.Provider>;
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within HotelProvider');
  }
  return context;
};

export default HotelContext;
