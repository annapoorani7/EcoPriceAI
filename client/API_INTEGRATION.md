# API Integration Guide

## Overview

This document provides guidelines for integrating with the backend MERN stack API.

## API Service Structure

Located in `src/services/apiService.js`:

```javascript
// Example: API Call
import { hotelService } from './services/apiService';

const hotelData = await hotelService.getHotelDetails();
```

## Available Services

### Authentication Service

```javascript
import { authService } from './services/apiService';

// Login
authService.login({ email: 'user@example.com', password: 'password' })
  .then(response => {
    const { token, user } = response;
    // Handle login
  });

// Register
authService.register({
  fullName: 'John Doe',
  email: 'john@example.com',
  password: 'password',
  hotelName: 'Resort Name'
});

// Logout
authService.logout();
```

### Hotel Service

```javascript
import { hotelService } from './services/apiService';

// Get hotel details
hotelService.getHotelDetails()
  .then(data => console.log(data));

// Update hotel details
hotelService.updateHotelDetails({
  name: 'Updated Name',
  location: 'New Location'
});

// Get all hotels
hotelService.getHotels();
```

### Booking Service

```javascript
import { bookingService } from './services/apiService';

// Get bookings with filters
bookingService.getBookings({
  status: 'confirmed',
  month: 'January'
});

// Get single booking
bookingService.getBookingById('booking-id');

// Create booking
bookingService.createBooking({
  roomType: 'Deluxe',
  checkIn: '2024-02-15',
  checkOut: '2024-02-18',
  guestName: 'John Doe'
});

// Update booking
bookingService.updateBooking('booking-id', {
  status: 'cancelled'
});
```

### Pricing Service

```javascript
import { pricingService } from './services/apiService';

// Get pricing prediction
pricingService.getPricingPrediction({
  roomType: 'Standard',
  date: '2024-02-15'
});

// Get dynamic price
pricingService.getDynamicPrice('Deluxe', '2024-02-15');
```

### Analytics Service

```javascript
import { analyticsService } from './services/apiService';

// Get revenue analytics
analyticsService.getRevenueAnalytics('monthly');

// Get event analytics
analyticsService.getEventAnalytics();

// Get occupancy analytics
analyticsService.getOccupancyAnalytics('monthly');
```

## Token Management

Located in `src/services/tokenService.js`:

```javascript
import { tokenService, userService } from './services/tokenService';

// Save token
tokenService.saveToken(token);

// Get token
const token = tokenService.getToken();

// Check if token is expired
const isExpired = tokenService.isTokenExpired(token);

// Remove token
tokenService.removeToken();

// User data management
userService.saveUser(userData);
const user = userService.getUser();
userService.removeUser();
```

## Using Authentication Context

```javascript
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout, loading } = useAuth();

  return (
    <div>
      {isAuthenticated && <p>Welcome, {user.name}!</p>}
      <button onClick={() => login(email, password)}>Login</button>
      <button onClick={logout}>Logout</button>
      {loading && <p>Loading...</p>}
    </div>
  );
}
```

## Error Handling

```javascript
try {
  const data = await authService.login(credentials);
} catch (error) {
  console.error('Login failed:', error.message);
  // Display error to user
}
```

## Backend API Endpoints

Expected backend endpoints:

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`

### Hotels
- `GET /api/hotels` - List all hotels
- `GET /api/hotels/details` - Get current hotel
- `PUT /api/hotels/details` - Update hotel

### Bookings
- `GET /api/bookings` - List bookings
- `GET /api/bookings/:id` - Get booking
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking

### Pricing
- `GET /api/pricing/prediction` - Get price prediction
- `GET /api/pricing/dynamic` - Get dynamic price

### Analytics
- `GET /api/analytics/revenue` - Revenue data
- `GET /api/analytics/events` - Event data
- `GET /api/analytics/occupancy` - Occupancy data

## Implementing Custom API Calls

```javascript
// Add to src/services/apiService.js

export const customService = {
  getData: () => apiCall('/custom/endpoint'),
  postData: (data) => apiCall('/custom/endpoint', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
};
```

## Testing API Integration

Use Postman or Insomnia to test API endpoints before integrating:

1. Test all endpoints with mock data
2. Verify error responses
3. Check response formats
4. Validate authentication flows

## Production API Configuration

In production, update `.env`:

```
REACT_APP_API_URL=https://api.yourdomain.com
```

## CORS Configuration

If you encounter CORS errors, ensure backend has proper CORS headers:

```javascript
// Backend example (Express.js)
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```
