const test = require('node:test');
const assert = require('node:assert/strict');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const { buildInsights, getOwnerOverview } = require('./ecopulseService');

const ownerId = '507f1f77bcf86cd799439011';
const testDate = new Date('2026-10-09T12:00:00.000Z');

const replace = (t, target, property, value) => {
  const original = target[property];
  target[property] = value;
  t.after(() => { target[property] = original; });
};

test('returns an explicit empty owner-scoped overview when no hotels exist', async (t) => {
  let hotelFilter;
  let bookingQueries = 0;
  replace(t, Hotel, 'find', (filter) => {
    hotelFilter = filter;
    return { select: () => ({ lean: async () => [] }) };
  });
  replace(t, Booking, 'aggregate', async () => { bookingQueries += 1; return []; });

  const overview = await getOwnerOverview(ownerId, testDate);

  assert.deepEqual(hotelFilter, { owner: ownerId });
  assert.equal(bookingQueries, 0);
  assert.equal(overview.hotelCount, 0);
  assert.deepEqual(overview.hotels, []);
  assert.deepEqual(overview.upcomingBookings, []);
  assert.equal(overview.metrics.bookingPace.current7d, 0);
  assert.equal(overview.insights.length, 3);
  assert.ok(overview.insights.every((insight) => insight.state === 'insufficient-data'));
});

test('builds evidence-backed insights without treating sparse counts as a forecast', () => {
  const insights = buildInsights({
    hotelCount: 1,
    bookingPace: { current7d: 2, previous7d: 0 },
    upcoming: { arrivals: 1, roomsBooked: 2, confirmedUnpaidBookings: 1, confirmedUnpaidValue: 300 },
    monthToDate: {},
  });

  assert.equal(insights.length, 3);
  assert.match(insights[0].evidence, /2 active booking.*0 in the preceding/);
  assert.match(insights[0].method, /no forecast or probability/);
  assert.match(insights[1].evidence, /1 active arrival.*2 room/);
  assert.match(insights[2].evidence, /1 confirmed upcoming booking/);
  assert.ok(insights.every((insight) => insight.action && insight.method));
});

test('scopes booking aggregates and upcoming projection to the owner hotel IDs', async (t) => {
  const hotelId = '507f1f77bcf86cd799439012';
  const hotel = {
    _id: hotelId,
    name: 'Owner Lodge',
    city: 'Munnar',
    rooms: [{ _id: 'room-1', roomType: 'Standard', basePrice: 4200, totalRooms: 10, availableRooms: 8 }],
  };
  const aggregatePipelines = [];
  let hotelFilter;
  let upcomingFilter;
  const restoreFind = Hotel.find;
  const restoreAggregate = Booking.aggregate;
  const restoreBookingFind = Booking.find;
  Hotel.find = (filter) => {
    hotelFilter = filter;
    return { select: () => ({ lean: async () => [hotel] }) };
  };
  Booking.aggregate = async (pipeline) => {
    aggregatePipelines.push(pipeline);
    if (pipeline.some((stage) => stage.$match?.createdAt)) {
      return [{ _id: 'current', bookings: 3 }, { _id: 'previous', bookings: 1 }];
    }
    if (pipeline.some((stage) => stage.$match?.checkInDate?.$lt?.getTime?.() === new Date('2026-11-08T00:00:00.000Z').getTime())) {
      return [{ arrivals: 2, roomsBooked: 3, confirmedUnpaidBookings: 1, confirmedUnpaidValue: 500 }];
    }
    return [{ confirmedBookingCount: 1, confirmedBookingValue: 600, paidBookingCount: 1, paidBookingValue: 600 }];
  };
  Booking.find = (filter) => {
    upcomingFilter = filter;
    return {
      select: () => ({ sort: () => ({ limit: () => ({ lean: async () => ([{
        _id: 'booking-1', hotel: hotelId, roomType: 'Standard', numberOfRooms: 2,
        checkInDate: new Date('2026-10-15T00:00:00.000Z'), checkOutDate: new Date('2026-10-16T00:00:00.000Z'),
        bookingStatus: 'confirmed', paymentStatus: 'paid', totalAmount: 600,
      }]) }) }) }),
    };
  };
  t.after(() => {
    Hotel.find = restoreFind;
    Booking.aggregate = restoreAggregate;
    Booking.find = restoreBookingFind;
  });

  const overview = await getOwnerOverview(ownerId, testDate);

  assert.deepEqual(hotelFilter, { owner: ownerId });
  assert.equal(aggregatePipelines.length, 3);
  assert.ok(aggregatePipelines.every((pipeline) => pipeline[0].$match.hotel.$in[0] === hotelId));
  assert.deepEqual(upcomingFilter.hotel, { $in: [hotelId] });
  assert.equal(overview.metrics.bookingPace.current7d, 3);
  assert.equal(overview.metrics.bookingPace.previous7d, 1);
  assert.equal(overview.metrics.monthToDate.paidBookingValue, 600);
  assert.equal(overview.upcomingBookings[0].hotelName, 'Owner Lodge');
  assert.equal(overview.upcomingBookings[0].guestEmail, undefined);
});