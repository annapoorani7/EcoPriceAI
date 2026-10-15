import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './context/AuthContext';

const originalFetch = global.fetch;

beforeEach(() => {
  window.history.replaceState({}, '', '/');
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600, sub: 'test-user' }));
  const validToken = [header, payload, 'signature'].join('.');

  localStorage.setItem('authToken', validToken);
  localStorage.setItem(
    'userData',
    JSON.stringify({ id: 'test-user', name: 'Test User', email: 'test@example.com', role: 'hotelOwner' })
  );

  global.fetch = jest.fn(async (url) => {
    const responseBody = url.includes('/api/events')
      ? { success: true, data: [] }
      : url.includes('/api/hotels')
        ? { success: true, hotels: [] }
        : { success: true, bookings: [] };
    return { ok: true, json: async () => responseBody };
  });
});

afterEach(() => {
  global.fetch = originalFetch;
});

test('renders the hotel dashboard landing page for authenticated users', async () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );

  const heading = screen.getByText(/smarter pricing for better hotel decisions/i);
  expect(heading).toBeInTheDocument();
  expect(await screen.findByText('Start with your first hotel')).toBeInTheDocument();
});

test('canonical event and revenue report routes load', async () => {
  window.history.pushState({}, '', '/event-analysis');
  const { unmount } = render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
  expect(await screen.findByRole('heading', { name: /nearby events/i })).toBeInTheDocument();
  expect(await screen.findByText(/no upcoming events were found/i)).toBeInTheDocument();

  unmount();
  window.history.pushState({}, '', '/revenue-analytics');
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
  expect(await screen.findByRole('heading', { name: /revenue reports/i })).toBeInTheDocument();
  expect(await screen.findByText('No analytics data available.')).toBeInTheDocument();
});

test('EcoPulse is available from owner navigation and protected for anonymous visitors', async () => {
  window.history.pushState({}, '', '/ecopulse');
  global.fetch = jest.fn(async (url) => ({
    ok: true,
    json: async () => (String(url).includes('/api/ecopulse/overview')
      ? { success: true, generatedAt: new Date().toISOString(), hotelCount: 0, hotels: [], upcomingBookings: [], insights: [] }
      : { success: true }),
  }));

  const { unmount } = render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );

  expect(await screen.findByRole('heading', { name: 'EcoPulse AI' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'EcoPulse AI' })).toHaveAttribute('href', '/ecopulse');

  unmount();
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  window.history.pushState({}, '', '/ecopulse');
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );

  expect(await screen.findByRole('heading', { name: 'Sign in to EcoPrice AI' })).toBeInTheDocument();
});

test('navigation uses canonical event and revenue report paths', async () => {
  window.history.pushState({}, '', '/event-analysis');
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );

  expect(await screen.findByText(/no upcoming events were found/i)).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: 'Nearby Events' }).every((link) => link.getAttribute('href') === '/event-analysis')).toBe(true);
  expect(screen.getByRole('link', { name: 'Revenue Reports' })).toHaveAttribute('href', '/revenue-analytics');
  expect(document.querySelector('a[href="/events"], a[href="/analytics"]')).toBeNull();
});

test('dashboard excludes cancelled bookings from revenue and booking counts', async () => {
  window.history.pushState({}, '', '/dashboard');
  const checkInDate = new Date();
  checkInDate.setHours(12, 0, 0, 0);
  const today = checkInDate.toISOString();
  global.fetch = jest.fn(async (url) => {
    const responseBody = url.includes('/api/bookings/my-bookings')
      ? {
          success: true,
          bookings: [
            { bookingStatus: 'confirmed', paymentStatus: 'paid', checkInDate: today, totalAmount: 200 },
            { bookingStatus: 'pending', paymentStatus: 'unpaid', checkInDate: today, totalAmount: 300 },
            { bookingStatus: 'cancelled', paymentStatus: 'refunded', checkInDate: today, totalAmount: 7000 },
          ],
        }
      : url.includes('/api/hotels')
        ? { success: true, hotels: [{ rooms: [] }] }
        : { success: true, data: [] };
    return { ok: true, json: async () => responseBody };
  });

  const { container } = render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );

  expect(await screen.findByText('₹200')).toBeInTheDocument();
  expect(container.querySelector('.stats-grid')).toHaveTextContent(/Today's Bookings\s*2/);
  expect(container.querySelector('.stats-grid')).toHaveTextContent(/Today's Revenue\s*₹200/);
});
