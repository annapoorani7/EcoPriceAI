# MERN Stack - Predictive Dynamic Pricing and Revenue Management System for Eco-Tourism Hospitality

A comprehensive React-based frontend for a MERN stack application dedicated to dynamic pricing and revenue management for eco-tourism businesses.

## Project Structure

### `/src`
- **`components/`** - Reusable React components
  - Navbar, Sidebar, Footer (Layout components)
  - HeroSection, PricingCard, EventCard, DashboardCard, Charts (Content components)

- **`pages/`** - Page components (React Router routes)
  - Home, Login, Register, Dashboard
  - HotelDetails, PricingPrediction, EventAnalysis
  - BookingHistory, RevenueAnalytics, Profile

- **`services/`** - API and external service calls
  - apiService.js - Backend API integration
  - tokenService.js - Authentication token management

- **`context/`** - React Context for state management
  - AuthContext.jsx - Authentication state
  - HotelContext.jsx - Hotel data management

- **`hooks/`** - Custom React hooks
  - useFetch.js - Data fetching hook
  - useForm.js - Form handling hook
  - useDebounce.js - Debouncing hook

- **`utils/`** - Utility functions
  - helpers.js - Helper functions for formatting, validation, etc.

- **`assets/`** - Static files
  - images/ - Image assets
  - icons/ - Icon files

- **`styles/`** - Global styles
  - global.css - Global CSS styles
  - theme.js - Color and design tokens

## Tech Stack

- **React** 18.x - UI library
- **React Router** v6 - Client-side routing
- **Functional Components** - Modern React patterns
- **Context API** - State management

## Getting Started

### Installation

```bash
npm install
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Configure API endpoint:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

### Running the Application

```bash
npm start
```

The app will open at `http://localhost:3000`

## Features

- **Authentication** - Login and registration pages
- **Dashboard** - Overview of key metrics and analytics
- **Dynamic Pricing** - AI-powered pricing predictions
- **Event Analysis** - Analyze impact of events on pricing
- **Revenue Analytics** - Detailed revenue reports and trends
- **Booking Management** - View and manage bookings
- **Hotel Management** - Manage hotel details and settings
- **User Profile** - Edit profile and preferences

## Folder Organization

Each component and page folder contains:
- `ComponentName.jsx` - React component
- `ComponentName.css` - Component-specific styles

## Key Components

- **AuthContext** - Handles user authentication state
- **HotelContext** - Manages hotel information
- **Protected Routes** - Routes that require authentication
- **Custom Hooks** - Reusable logic (useFetch, useForm, useDebounce)

## API Integration

The frontend connects to a backend API. Configure the base URL in `.env`:

```javascript
REACT_APP_API_URL=http://localhost:5000/api
```

## Best Practices

- Use functional components with hooks
- Keep components small and focused
- Use Context API for global state
- Implement error handling
- Use custom hooks for reusable logic
- Follow consistent naming conventions
- Keep styles scoped to components

## Next Steps

1. Install dependencies: `npm install`
2. Set up environment variables
3. Connect to backend API
4. Implement authentication logic
5. Add state management for user data
6. Integrate with real data APIs
7. Add form validation
8. Implement error boundaries
9. Add loading states
10. Optimize performance

## Contributing

Follow the established folder structure and naming conventions when adding new features.
