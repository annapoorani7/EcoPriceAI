# Quick Reference Guide

## Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## File Locations

| Component | Location |
|-----------|----------|
| Navbar | `src/components/Navbar/Navbar.jsx` |
| Sidebar | `src/components/Sidebar/Sidebar.jsx` |
| Footer | `src/components/Footer/Footer.jsx` |
| Dashboard | `src/pages/Dashboard/Dashboard.jsx` |
| API Service | `src/services/apiService.js` |
| Auth Context | `src/context/AuthContext.jsx` |
| useFetch Hook | `src/hooks/useFetch.js` |
| Helpers | `src/utils/helpers.js` |
| Global Styles | `src/styles/global.css` |
| Router Config | `src/App.js` |

## Common Import Patterns

```javascript
// Import component
import Dashboard from './pages/Dashboard/Dashboard';

// Import service
import { authService, hotelService } from './services/apiService';

// Import context
import { useAuth } from './context/AuthContext';

// Import hooks
import { useFetch, useForm } from './hooks';

// Import utilities
import { formatCurrency, validateEmail } from './utils/helpers';

// Import theme
import { colors, spacing } from './styles/theme';
```

## Common Patterns

### Using Auth Context
```javascript
const { user, isAuthenticated, login, logout } = useAuth();
```

### Fetching Data
```javascript
const { data, loading, error } = useFetch('/api/endpoint');
```

### Form Handling
```javascript
const { formData, handleChange, handleSubmit } = useForm(
  { email: '', password: '' },
  onSubmit
);
```

### API Call
```javascript
import { hotelService } from './services/apiService';

const data = await hotelService.getHotelDetails();
```

## Page Routes

| Page | URL | File |
|------|-----|------|
| Home | `/` | `src/pages/Home/Home.jsx` |
| Login | `/login` | `src/pages/Login/Login.jsx` |
| Register | `/register` | `src/pages/Register/Register.jsx` |
| Dashboard | `/dashboard` | `src/pages/Dashboard/Dashboard.jsx` |
| Pricing | `/pricing-prediction` | `src/pages/PricingPrediction/PricingPrediction.jsx` |
| Events | `/event-analysis` | `src/pages/EventAnalysis/EventAnalysis.jsx` |
| Revenue | `/revenue-analytics` | `src/pages/RevenueAnalytics/RevenueAnalytics.jsx` |
| Bookings | `/booking-history` | `src/pages/BookingHistory/BookingHistory.jsx` |
| Hotel | `/hotel-details` | `src/pages/HotelDetails/HotelDetails.jsx` |
| Profile | `/profile` | `src/pages/Profile/Profile.jsx` |

## Styling Classes

### Colors
```javascript
colors.primary      // #27ae60 (Green)
colors.secondary    // #3498db (Blue)
colors.dark         // #2c3e50 (Dark)
colors.light        // #ecf0f1 (Light)
colors.danger       // #e74c3c (Red)
```

### Spacing
```javascript
spacing.xs   // 0.25rem
spacing.sm   // 0.5rem
spacing.md   // 1rem
spacing.lg   // 1.5rem
spacing.xl   // 2rem
```

### Shadows
```javascript
shadows.sm   // 0 2px 4px
shadows.md   // 0 4px 8px
shadows.lg   // 0 10px 25px
```

## Adding New Features

### Add New Page
1. Create folder: `src/pages/YourPage/`
2. Create: `YourPage.jsx` and `YourPage.css`
3. Add route in `src/App.js`
4. Update navigation components

### Add New Component
1. Create folder: `src/components/YourComponent/`
2. Create: `YourComponent.jsx` and `YourComponent.css`
3. Export from component file
4. Use in pages

### Add New Hook
1. Create: `src/hooks/useYourHook.js`
2. Export from: `src/hooks/index.js`
3. Use in components

### Add New API Endpoint
1. Update: `src/services/apiService.js`
2. Add service function
3. Use in components via imports

## Environment Variables

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
REACT_APP_VERSION=1.0.0
```

## Component Props Example

```jsx
<DashboardCard
  title="Total Revenue"
  value="$45,250"
  icon="💰"
  trend={12}
/>

<PricingCard
  title="Starter"
  price="99"
  description="Basic features"
  features={['Feature 1', 'Feature 2']}
  onSelect={handleSelect}
/>
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Use `npm start -- --port 3001` |
| Module not found | Run `npm install` |
| API errors | Check `REACT_APP_API_URL` in `.env` |
| Styling not applied | Check CSS file path in imports |
| Router not working | Ensure `BrowserRouter` wraps `<Routes>` |

## Useful Commands

```bash
# Install package
npm install package-name

# Remove package
npm uninstall package-name

# Update packages
npm update

# Clear cache
npm cache clean --force

# View installed packages
npm list
```

## File Naming Convention

- **Folders**: `PascalCase` (e.g., `Dashboard`)
- **Components**: `PascalCase.jsx` (e.g., `DashboardCard.jsx`)
- **Styles**: Same as component (e.g., `DashboardCard.css`)
- **Utilities**: `camelCase.js` (e.g., `helpers.js`)
- **CSS classes**: `kebab-case` (e.g., `.dashboard-card`)

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/feature-name

# Add changes
git add .

# Commit
git commit -m "Add feature description"

# Push
git push origin feature/feature-name

# Create pull request on GitHub
```

## Performance Tips

- Use `useCallback` for event handlers
- Use `useMemo` for expensive computations
- Implement code splitting with `React.lazy()`
- Debounce search/filter inputs
- Optimize images
- Minimize bundle size

## Documentation References

- [Setup Guide](SETUP.md)
- [API Integration](API_INTEGRATION.md)
- [Component Guide](COMPONENT_GUIDE.md)
- [Project Structure](STRUCTURE.md)
- [Project Complete](PROJECT_COMPLETE.md)

---

**Pro Tip**: Bookmark this page for quick reference while developing!
