const revenueEligibleStatuses = new Set(['confirmed', 'completed']);

const isSameDay = (dateValue, comparisonDate) => {
  const date = new Date(dateValue);
  return !Number.isNaN(date.getTime()) &&
    date.getFullYear() === comparisonDate.getFullYear() &&
    date.getMonth() === comparisonDate.getMonth() &&
    date.getDate() === comparisonDate.getDate();
};

const getMonthKey = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const getMonthLabel = (monthKey) => new Date(`${monthKey}-01T00:00:00`).toLocaleDateString('en-US', {
  month: 'short',
  year: 'numeric',
});

export const isRevenueEligibleBooking = (booking) =>
  revenueEligibleStatuses.has(booking.bookingStatus) && booking.paymentStatus !== 'refunded';

export const buildBookingMetrics = (bookings = [], comparisonDate = new Date()) => {
  const bookingList = Array.isArray(bookings) ? bookings : [];
  const activeBookings = bookingList.filter((booking) =>
    booking.bookingStatus !== 'cancelled' && booking.paymentStatus !== 'refunded'
  );
  const revenueBookings = activeBookings.filter(isRevenueEligibleBooking);
  const monthly = new Map();
  let totalRevenue = 0;
  let pricedRevenueBookingCount = 0;

  const getMonthlyStats = (monthKey) => {
    if (!monthly.has(monthKey)) {
      monthly.set(monthKey, {
        monthKey,
        revenue: 0,
        bookings: 0,
        pricedRevenueBookingCount: 0,
      });
    }
    return monthly.get(monthKey);
  };

  activeBookings.forEach((booking) => {
    const monthKey = getMonthKey(booking.checkInDate);
    if (monthKey) getMonthlyStats(monthKey).bookings += 1;
  });

  revenueBookings.forEach((booking) => {
    const amount = Number(booking.totalAmount);
    const isAmountValid = Number.isFinite(amount);
    if (isAmountValid) {
      totalRevenue += amount;
      pricedRevenueBookingCount += 1;
    }

    const monthKey = getMonthKey(booking.checkInDate);
    if (monthKey) {
      const stat = getMonthlyStats(monthKey);
      if (isAmountValid) {
        stat.revenue += amount;
        stat.pricedRevenueBookingCount += 1;
      }
    }
  });

  const monthlyStats = Array.from(monthly.values())
    .sort((first, second) => first.monthKey.localeCompare(second.monthKey))
    .map((stat) => ({
      month: getMonthLabel(stat.monthKey),
      revenue: stat.revenue,
      bookings: stat.bookings,
      averageBooking: stat.pricedRevenueBookingCount > 0
        ? stat.revenue / stat.pricedRevenueBookingCount
        : null,
    }));

  const todaysBookings = activeBookings.filter((booking) => isSameDay(booking.checkInDate, comparisonDate));
  const todaysRevenue = revenueBookings
    .filter((booking) => isSameDay(booking.checkInDate, comparisonDate))
    .reduce((sum, booking) => {
      const amount = Number(booking.totalAmount);
      return Number.isFinite(amount) ? sum + amount : sum;
    }, 0);

  return {
    totalRevenue,
    totalBookings: activeBookings.length,
    averageBooking: pricedRevenueBookingCount > 0 ? totalRevenue / pricedRevenueBookingCount : null,
    monthlyStats,
    bookingChart: monthlyStats.map(({ month, bookings: count }) => ({ month, value: count })),
    revenueData: monthlyStats.map(({ month, revenue }) => ({ month, revenue })),
    todaysBookings,
    todaysRevenue,
  };
};