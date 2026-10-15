// API Service for handling all backend API calls
import { tokenService } from './tokenService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = tokenService.getToken();
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultOptions.headers,
    });
    const responseData = await response.json();
    if (!response.ok) {
      const validationMessage = responseData.errors?.map((error) => error.message).join(', ');
      throw new Error(validationMessage || responseData.message || `API Error: ${response.status}`);
    }
    return responseData;
  } catch (error) {
    console.error('API call failed:', error);
    if (error instanceof Error) {
      const message = error.message || '';
      const isTimeout = /timeout|timed out|ECONNABORTED/i.test(message);
      if (isTimeout) {
        throw new Error('Pricing service is taking too long to respond. Please try again.');
      }
    }
    throw error;
  }
};

export const authService = {
  login: (credentials) => apiCall('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => apiCall('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  logout: () => apiCall('/auth/logout', { method: 'POST' }),
};

export const hotelService = {
  getMyHotel: () => apiCall('/hotels/my-hotel'),
  updateMyHotel: (data) => apiCall('/hotels/my-hotel', { method: 'PUT', body: JSON.stringify(data) }),
  getHotels: () => apiCall('/hotels'),
  getHotelById: (id) => apiCall(`/hotels/${id}`),
  createHotel: (data) => apiCall('/hotels', { method: 'POST', body: JSON.stringify(data) }),
  updateHotel: (id, data) => apiCall(`/hotels/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteHotel: (id) => apiCall(`/hotels/${id}`, { method: 'DELETE' }),
};

export const bookingService = {
  getMyBookings: () => apiCall('/bookings/my-bookings'),
  getBookings: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiCall(`/bookings${queryString ? '?' + queryString : ''}`);
  },
  getBookingById: (id) => apiCall(`/bookings/${id}`),
  createBooking: (data, idempotencyKey) => apiCall('/bookings', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(data),
  }),
  updateBookingStatus: (id, data) => apiCall(`/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  cancelBooking: (id) => apiCall(`/bookings/${id}/cancel`, { method: 'PUT' }),
};

export const pricingService = {
  predictPrice: (data) => apiCall('/pricing/predict', { method: 'POST', body: JSON.stringify(data) }),
  getDynamicPrice: (roomType, date) => apiCall(`/pricing/dynamic?roomType=${roomType}&date=${date}`),
};

export const analyticsService = {
  getRevenueAnalytics: (period = 'monthly') => apiCall(`/analytics/revenue?period=${period}`),
  getEventAnalytics: () => apiCall('/analytics/events'),
  getOccupancyAnalytics: (period = 'monthly') => apiCall(`/analytics/occupancy?period=${period}`),
};

export const eventService = {
  getEvents: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiCall(`/events${queryString ? '?' + queryString : ''}`);
  },
  getEventsByCity: (city) => apiCall(`/events?city=${city}`),
  getEventsByDaysAhead: (daysAhead) => apiCall(`/events?daysAhead=${daysAhead}`),
};

export const ecopulseService = {
  getOverview: () => apiCall('/ecopulse/overview'),
};

export default apiCall;
