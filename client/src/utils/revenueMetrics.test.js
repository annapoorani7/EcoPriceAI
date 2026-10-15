import { buildBookingMetrics } from './revenueMetrics';

const comparisonDate = new Date('2026-10-07T12:00:00');
const bookings = [
  { bookingStatus: 'confirmed', paymentStatus: 'paid', checkInDate: '2026-10-07T12:00:00', totalAmount: 200 },
  { bookingStatus: 'completed', paymentStatus: 'paid', checkInDate: '2026-10-06T12:00:00', totalAmount: 100 },
  { bookingStatus: 'pending', paymentStatus: 'unpaid', checkInDate: '2026-10-07T12:00:00', totalAmount: 300 },
  { bookingStatus: 'cancelled', paymentStatus: 'refunded', checkInDate: '2026-10-07T12:00:00', totalAmount: 7000 },
  { bookingStatus: 'confirmed', paymentStatus: 'refunded', checkInDate: '2026-10-07T12:00:00', totalAmount: 500 },
];

test('revenue reports include confirmed and completed bookings but exclude pending, cancelled, and refunded bookings', () => {
  const metrics = buildBookingMetrics(bookings, comparisonDate);

  expect(metrics.totalRevenue).toBe(300);
  expect(metrics.averageBooking).toBe(150);
  expect(metrics.totalBookings).toBe(3);
  expect(metrics.monthlyStats).toEqual([
    { month: 'Oct 2026', revenue: 300, bookings: 3, averageBooking: 150 },
  ]);
  expect(metrics.bookingChart).toEqual([{ month: 'Oct 2026', value: 3 }]);
});

test('dashboard excludes cancelled and pending bookings from realized revenue while retaining active booking counts', () => {
  const metrics = buildBookingMetrics(bookings, comparisonDate);

  expect(metrics.todaysBookings).toHaveLength(2);
  expect(metrics.todaysRevenue).toBe(200);
  expect(metrics.revenueData).toEqual([{ month: 'Oct 2026', revenue: 300 }]);
});