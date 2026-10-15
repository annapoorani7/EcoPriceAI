# Installation & Setup Guide

## Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher (or yarn)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

Required dependencies for this project:
- **react** & **react-dom** - UI library
- **react-router-dom** - Client-side routing (v6)
- **react-scripts** - Build scripts

#### Optional Dependencies for Enhancement

For charts and data visualization:
```bash
npm install recharts chart.js react-chartjs-2
```

For form validation:
```bash
npm install react-hook-form yup
```

For state management (if needed):
```bash
npm install zustand
```

For HTTP requests:
```bash
npm install axios
```

### 2. Environment Configuration

1. Create a `.env` file in the project root:
```bash
cp .env.example .env
```

2. Update the `.env` file with your configuration:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
REACT_APP_VERSION=1.0.0
```

### 3. Start Development Server

```bash
npm start
```

The application will open at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

## Project Dependencies

### Core Dependencies
- React 18.x
- React Router 6.x
- React DOM 18.x

### Development Tools
- React Scripts
- ESLint
- Jest (for testing)

## Common Issues & Solutions

### Issue: Module not found
```bash
npm install
```

### Issue: Port 3000 already in use
```bash
# On Windows
netstat -ano | findstr :3000

# On Mac/Linux
lsof -i :3000
```

### Issue: API connection errors
- Ensure backend server is running
- Verify `REACT_APP_API_URL` in `.env`
- Check CORS configuration on backend

## Development Workflow

1. Create feature branches from `main`
2. Build components in modular structure
3. Test components locally
4. Submit pull requests for review
5. Deploy to production

## Testing

Run tests with:
```bash
npm test
```

## Deployment

### Deploy to Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Deploy to Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=build
```

### Deploy to GitHub Pages
Update `package.json`:
```json
"homepage": "https://yourusername.github.io/repo-name"
```

Then:
```bash
npm run build
npm i -g gh-pages
gh-pages -d build
```

## Useful Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject from Create React App (irreversible)
npm run eject

# Install specific package
npm install package-name

# Update all packages
npm update
```

## Getting Help

- React Documentation: https://react.dev
- React Router: https://reactrouter.com
- Create React App: https://create-react-app.dev
