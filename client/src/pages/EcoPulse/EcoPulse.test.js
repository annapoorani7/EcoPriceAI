import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ecopulseService } from '../../services/apiService';
import EcoPulse from './EcoPulse';

jest.mock('../../services/apiService', () => ({
  ecopulseService: { getOverview: jest.fn() },
}));

const overview = {
  success: true,
  generatedAt: '2026-10-09T12:00:00.000Z',
  hotelCount: 1,
  hotels: [{
    _id: 'hotel-1',
    name: 'Owner Lodge',
    rooms: [{ _id: 'room-1', roomType: 'Standard', basePrice: 100, totalRooms: 8, availableRooms: 6 }],
  }],
  metrics: {
    bookingPace: { current7d: 3, previous7d: 1 },
    upcoming30d: { arrivals: 2, roomsBooked: 3, confirmedUnpaidBookings: 1, confirmedUnpaidValue: 220 },
    monthToDate: { confirmedBookingCount: 2, confirmedBookingValue: 500, paidBookingCount: 1, paidBookingValue: 280 },
  },
  upcomingBookings: [{
    _id: 'booking-1',
    hotelName: 'Owner Lodge',
    roomType: 'Standard',
    numberOfRooms: 1,
    checkInDate: '2026-10-15T00:00:00.000Z',
    checkOutDate: '2026-10-17T00:00:00.000Z',
    bookingStatus: 'confirmed',
    paymentStatus: 'paid',
    totalAmount: 200,
    guestEmail: 'guest@example.com',
  }],
  insights: [
    { id: 'pace', title: 'Recent booking activity is higher', state: 'observed', evidence: '3 recent bookings; 1 earlier.', action: 'Check room readiness.', method: 'Observed booking timestamps.' },
    { id: 'arrivals', title: 'Upcoming arrivals need preparation', state: 'observed', evidence: '2 upcoming arrivals.', action: 'Review staffing.', method: 'Observed check-in dates.' },
    { id: 'payments', title: 'Confirmed bookings need payment review', state: 'observed', evidence: '1 unpaid booking.', action: 'Review payment status.', method: 'Observed payment status.' },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  ecopulseService.getOverview.mockResolvedValue(overview);
});

test('renders owner-scoped observed metrics, evidence cards, and an upcoming booking', async () => {
  render(<EcoPulse />);

  expect(await screen.findByRole('heading', { name: 'EcoPulse AI' })).toBeInTheDocument();
  expect(screen.getByText('Bookings created · last 7 days')).toBeInTheDocument();
  expect(screen.getByText('Confirmed/completed booked value · check-in this month')).toBeInTheDocument();
  expect(screen.getByText('Paid amount recorded on bookings · check-in this month')).toBeInTheDocument();
  expect(screen.getByText('Owner Lodge · Standard')).toBeInTheDocument();
  expect(screen.getByText('Recent booking activity is higher')).toBeInTheDocument();
  expect(screen.getAllByText(/Evidence/)).toHaveLength(3);
  expect(screen.queryByText('guest@example.com')).not.toBeInTheDocument();
});

test('shows an honest empty state without rendering fabricated metrics', async () => {
  ecopulseService.getOverview.mockResolvedValue({
    ...overview,
    hotelCount: 0,
    hotels: [],
    upcomingBookings: [],
    insights: [
      { id: 'pace-empty', title: 'Booking pace needs more history', state: 'insufficient-data', evidence: 'No hotel is associated with this account.', action: 'Add a hotel.', method: 'Observed booking timestamps.' },
      { id: 'arrival-empty', title: 'No upcoming arrivals recorded', state: 'insufficient-data', evidence: 'No inventory is available.', action: 'Record reservations.', method: 'Observed check-in dates.' },
      { id: 'payment-empty', title: 'No confirmed unpaid arrivals flagged', state: 'insufficient-data', evidence: 'No booking data is available.', action: 'Review after bookings exist.', method: 'Observed payment status.' },
    ],
    metrics: {
      bookingPace: { current7d: 0, previous7d: 0 },
      upcoming30d: { arrivals: 0, roomsBooked: 0 },
      monthToDate: { confirmedBookingCount: 0, confirmedBookingValue: 0, paidBookingCount: 0, paidBookingValue: 0 },
    },
  });
  render(<EcoPulse />);

  expect(await screen.findByRole('heading', { name: 'No hotel data yet' })).toBeInTheDocument();
  expect(screen.getByText(/No sample metrics are shown here/)).toBeInTheDocument();
  expect(screen.getAllByText('Insufficient data')).toHaveLength(3);
  expect(screen.queryByText('Bookings created · last 7 days')).not.toBeInTheDocument();
});

test('shows a recoverable API error state', async () => {
  ecopulseService.getOverview.mockRejectedValue(new Error('Overview unavailable'));
  render(<EcoPulse />);

  expect(await screen.findByRole('alert')).toHaveTextContent('Overview unavailable');
});

test('simulates price arithmetic but makes no live price update request', async () => {
  render(<EcoPulse />);
  await screen.findByRole('heading', { name: 'EcoPulse AI' });

  fireEvent.change(screen.getByLabelText('Proposed nightly price (₹)'), { target: { value: '120' } });
  fireEvent.change(screen.getByLabelText('Check-in'), { target: { value: '2026-10-10' } });
  fireEvent.change(screen.getByLabelText('Check-out'), { target: { value: '2026-10-12' } });
  fireEvent.change(screen.getByLabelText('Rooms (max 6 currently marked available)'), { target: { value: '2' } });
  fireEvent.click(screen.getByRole('button', { name: 'Calculate scenario' }));

  expect(await screen.findByRole('status')).toHaveTextContent('Current listed-price total');
  expect(screen.getByRole('status')).toHaveTextContent('₹400.00');
  expect(screen.getByRole('status')).toHaveTextContent('₹480.00');
  await waitFor(() => expect(ecopulseService.getOverview).toHaveBeenCalledTimes(1));
});