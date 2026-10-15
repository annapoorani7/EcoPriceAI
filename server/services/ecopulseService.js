const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');

const DAY_MS = 24 * 60 * 60 * 1000;
const ACTIVE_STATUSES = ['pending', 'confirmed', 'completed'];
const UPCOMING_STATUSES = ['pending', 'confirmed'];
const REVENUE_STATUSES = ['confirmed', 'completed'];
const BOOKING_PROJECTION = 'hotel roomType numberOfRooms checkInDate checkOutDate totalAmount bookingStatus paymentStatus';

const getUtcDayStart = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const groupValue = (rows, key, field) => {
  const row = rows.find((item) => item._id === key);
  return Number(row?.[field] || 0);
};

const buildInsights = ({ hotelCount, bookingPace, upcoming, monthToDate }) => {
  const current = bookingPace.current7d;
  const previous = bookingPace.previous7d;
  const paceEvidence = hotelCount === 0
    ? 'No hotel is associated with this account, so booking pace cannot be measured.'
    : current + previous === 0
      ? 'No active bookings were created in either of the two seven-day comparison windows.'
      : `${current} active booking(s) were created in the last 7 days; ${previous} in the preceding 7 days.`;

  let paceAction = 'Record reservations before drawing conclusions from booking pace.';
  if (hotelCount > 0 && current > previous) {
    paceAction = 'Review upcoming room readiness and staffing against the recent booking activity.';
  } else if (hotelCount > 0 && current < previous) {
    paceAction = 'Review channel activity and listing accuracy; this comparison is descriptive, not a demand forecast.';
  } else if (hotelCount > 0 && current === previous && current > 0) {
    paceAction = 'Continue monitoring the next seven-day window; the observed counts are unchanged.';
  }

  const upcomingEvidence = hotelCount === 0
    ? 'No owner-scoped hotel inventory is available.'
    : `${upcoming.arrivals} active arrival(s) covering ${upcoming.roomsBooked} room(s) have check-in dates in the next 30 days.`;

  const paymentEvidence = hotelCount === 0
    ? 'No owner-scoped bookings are available to inspect.'
    : `${upcoming.confirmedUnpaidBookings} confirmed upcoming booking(s) have an unpaid payment status.`;

  return [
    {
      id: 'booking-pace',
      title: current === previous && current > 0 ? 'Booking pace is steady' : current > previous ? 'Recent booking activity is higher' : current < previous ? 'Recent booking activity is lower' : 'Booking pace needs more history',
      evidence: paceEvidence,
      action: paceAction,
      method: 'Observed active booking creation timestamps; no forecast or probability is inferred.',
      state: hotelCount > 0 && current + previous > 0 ? 'observed' : 'insufficient-data',
    },
    {
      id: 'upcoming-arrivals',
      title: upcoming.arrivals > 0 ? 'Upcoming arrivals need preparation' : 'No upcoming arrivals recorded',
      evidence: upcomingEvidence,
      action: upcoming.arrivals > 0
        ? 'Review room readiness and planned staffing for the listed arrival dates.'
        : 'Check that expected reservations are recorded; no future occupancy is assumed.',
      method: 'Observed non-cancelled booking check-in dates within the next 30 days.',
      state: hotelCount > 0 && upcoming.arrivals > 0 ? 'observed' : 'insufficient-data',
    },
    {
      id: 'payment-follow-up',
      title: upcoming.confirmedUnpaidBookings > 0 ? 'Confirmed bookings need payment review' : 'No confirmed unpaid arrivals flagged',
      evidence: paymentEvidence,
      action: upcoming.confirmedUnpaidBookings > 0
        ? 'Review payment status for these confirmed upcoming bookings using your normal payment policy.'
        : 'Continue normal payment reconciliation; no unpaid confirmed upcoming bookings were found.',
      method: 'Observed paymentStatus on confirmed bookings with check-in dates in the next 30 days.',
      state: hotelCount > 0 ? 'observed' : 'insufficient-data',
    },
  ];
};

const getOwnerOverview = async (ownerId, nowValue = new Date()) => {
  const now = new Date(nowValue);
  const today = getUtcDayStart(now);
  const paceCurrentStart = new Date(now.getTime() - 7 * DAY_MS);
  const pacePreviousStart = new Date(now.getTime() - 14 * DAY_MS);
  const upcomingEnd = new Date(today.getTime() + 30 * DAY_MS);
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const hotelRecords = await Hotel.find({ owner: ownerId })
    .select('_id name city rooms')
    .lean();
  const hotels = hotelRecords.map((hotel) => ({
    _id: hotel._id,
    name: hotel.name,
    city: hotel.city,
    rooms: (hotel.rooms || []).map((room) => ({
      _id: room._id,
      roomType: room.roomType,
      basePrice: room.basePrice,
      totalRooms: room.totalRooms,
      availableRooms: room.availableRooms,
    })),
  }));
  const hotelIds = hotelRecords.map((hotel) => hotel._id);

  const emptyMetrics = {
    bookingPace: { current7d: 0, previous7d: 0, currentWindowStart: paceCurrentStart, previousWindowStart: pacePreviousStart, windowEnd: now },
    upcoming30d: { arrivals: 0, roomsBooked: 0, confirmedUnpaidBookings: 0, confirmedUnpaidValue: 0, start: today, end: upcomingEnd },
    monthToDate: { confirmedBookingCount: 0, confirmedBookingValue: 0, paidBookingCount: 0, paidBookingValue: 0, start: monthStart, end: nextMonthStart },
  };

  if (hotelIds.length === 0) {
    return {
      generatedAt: now.toISOString(),
      hotelCount: 0,
      hotels,
      metrics: emptyMetrics,
      upcomingBookings: [],
      insights: buildInsights({ hotelCount: 0, bookingPace: emptyMetrics.bookingPace, upcoming: emptyMetrics.upcoming30d, monthToDate: emptyMetrics.monthToDate }),
    };
  }

  const [paceRows, upcomingRows, monthRows, upcomingRecords] = await Promise.all([
    Booking.aggregate([
      { $match: {
        hotel: { $in: hotelIds },
        createdAt: { $gte: pacePreviousStart, $lt: now },
        bookingStatus: { $in: UPCOMING_STATUSES },
        paymentStatus: { $ne: 'refunded' },
      } },
      { $group: {
        _id: { $cond: [{ $gte: ['$createdAt', paceCurrentStart] }, 'current', 'previous'] },
        bookings: { $sum: 1 },
      } },
    ]),
    Booking.aggregate([
      { $match: {
        hotel: { $in: hotelIds },
        checkInDate: { $gte: today, $lt: upcomingEnd },
        bookingStatus: { $in: ACTIVE_STATUSES },
        paymentStatus: { $ne: 'refunded' },
      } },
      { $group: {
        _id: null,
        arrivals: { $sum: 1 },
        roomsBooked: { $sum: '$numberOfRooms' },
        confirmedUnpaidBookings: {
          $sum: { $cond: [{ $and: [{ $eq: ['$bookingStatus', 'confirmed'] }, { $eq: ['$paymentStatus', 'unpaid'] }] }, 1, 0] },
        },
        confirmedUnpaidValue: {
          $sum: { $cond: [{ $and: [{ $eq: ['$bookingStatus', 'confirmed'] }, { $eq: ['$paymentStatus', 'unpaid'] }] }, { $ifNull: ['$totalAmount', 0] }, 0] },
        },
      } },
    ]),
    Booking.aggregate([
      { $match: {
        hotel: { $in: hotelIds },
        checkInDate: { $gte: monthStart, $lt: nextMonthStart },
        bookingStatus: { $in: REVENUE_STATUSES },
        paymentStatus: { $ne: 'refunded' },
      } },
      { $group: {
        _id: null,
        confirmedBookingCount: { $sum: 1 },
        confirmedBookingValue: { $sum: { $ifNull: ['$totalAmount', 0] } },
        paidBookingCount: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] } },
        paidBookingValue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, { $ifNull: ['$totalAmount', 0] }, 0] } },
      } },
    ]),
    Booking.find({
      hotel: { $in: hotelIds },
      checkInDate: { $gte: today, $lt: upcomingEnd },
      bookingStatus: { $in: UPCOMING_STATUSES },
      paymentStatus: { $ne: 'refunded' },
    })
      .select(BOOKING_PROJECTION)
      .sort({ checkInDate: 1 })
      .limit(8)
      .lean(),
  ]);

  const upcomingRow = upcomingRows[0] || {};
  const monthRow = monthRows[0] || {};
  const metrics = {
    bookingPace: {
      ...emptyMetrics.bookingPace,
      current7d: groupValue(paceRows, 'current', 'bookings'),
      previous7d: groupValue(paceRows, 'previous', 'bookings'),
    },
    upcoming30d: {
      ...emptyMetrics.upcoming30d,
      arrivals: Number(upcomingRow.arrivals || 0),
      roomsBooked: Number(upcomingRow.roomsBooked || 0),
      confirmedUnpaidBookings: Number(upcomingRow.confirmedUnpaidBookings || 0),
      confirmedUnpaidValue: Number(upcomingRow.confirmedUnpaidValue || 0),
    },
    monthToDate: {
      ...emptyMetrics.monthToDate,
      confirmedBookingCount: Number(monthRow.confirmedBookingCount || 0),
      confirmedBookingValue: Number(monthRow.confirmedBookingValue || 0),
      paidBookingCount: Number(monthRow.paidBookingCount || 0),
      paidBookingValue: Number(monthRow.paidBookingValue || 0),
    },
  };
  const hotelNameById = new Map(hotels.map((hotel) => [String(hotel._id), hotel.name]));
  const upcomingBookings = upcomingRecords.map((booking) => ({
    _id: booking._id,
    hotelName: hotelNameById.get(String(booking.hotel)) || 'Hotel',
    roomType: booking.roomType,
    numberOfRooms: booking.numberOfRooms,
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
    bookingStatus: booking.bookingStatus,
    paymentStatus: booking.paymentStatus,
    totalAmount: booking.totalAmount,
  }));

  return {
    generatedAt: now.toISOString(),
    hotelCount: hotels.length,
    hotels,
    metrics,
    upcomingBookings,
    insights: buildInsights({
      hotelCount: hotels.length,
      bookingPace: metrics.bookingPace,
      upcoming: metrics.upcoming30d,
      monthToDate: metrics.monthToDate,
    }),
  };
};

module.exports = {
  buildInsights,
  getOwnerOverview,
};