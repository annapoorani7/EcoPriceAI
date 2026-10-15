const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const { createBooking } = require('./bookingController');

const ownerId = '507f1f77bcf86cd799439011';
const hotelId = '507f1f77bcf86cd799439012';
const bookingId = '507f1f77bcf86cd799439013';

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

const createQuery = (value) => ({
  populate() { return this; },
  session() { return Promise.resolve(value); },
  then(resolve, reject) { return Promise.resolve(value).then(resolve, reject); },
});

const replace = (t, target, property, value) => {
  const original = target[property];
  target[property] = value;
  t.after(() => { target[property] = original; });
};

const validRequest = () => ({
  body: {
    hotelId,
    roomType: 'Deluxe',
    numberOfRooms: 1,
    guestName: 'Test Guest',
    guestEmail: 'guest@example.com',
    guestPhone: '555-0100',
    numberOfGuests: 2,
    checkInDate: '2027-10-11',
    checkOutDate: '2027-10-13',
    specialRequests: '',
  },
  user: { _id: ownerId, role: 'customer' },
  get(name) { return name === 'Idempotency-Key' ? 'request-12345678' : undefined; },
});

const availableHotel = () => ({
  _id: hotelId,
  owner: ownerId,
  rooms: [{ roomType: 'Deluxe', availableRooms: 2, capacity: 2, basePrice: 125 }],
});

test('rejects invalid date ranges before opening a transaction', async (t) => {
  let sessionStarted = false;
  replace(t, Hotel, 'findById', async () => availableHotel());
  replace(t, mongoose, 'startSession', async () => { sessionStarted = true; });
  replace(t, Booking, 'findOne', () => createQuery(null));

  const request = validRequest();
  request.body.checkOutDate = request.body.checkInDate;
  const response = createResponse();

  await createBooking(request, response);

  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /Check-in date must be before check-out/);
  assert.equal(sessionStarted, false);
});

test('rejects unavailable rooms before starting writes', async (t) => {
  replace(t, Booking, 'findOne', () => createQuery(null));
  replace(t, Hotel, 'findById', async () => ({ ...availableHotel(), rooms: [{ ...availableHotel().rooms[0], availableRooms: 0 }] }));
  replace(t, mongoose, 'startSession', async () => { throw new Error('A transaction should not start'); });

  const response = createResponse();
  await createBooking(validRequest(), response);

  assert.equal(response.statusCode, 409);
  assert.match(response.body.message, /Insufficient room availability/);
});

test('returns the existing booking for a repeated idempotency key', async (t) => {
  const priorBooking = { _id: bookingId, bookingReference: 'BK-EXISTING' };
  let sessionStarted = false;
  replace(t, Booking, 'findOne', () => createQuery(priorBooking));
  replace(t, mongoose, 'startSession', async () => { sessionStarted = true; });

  const response = createResponse();
  await createBooking(validRequest(), response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.booking, priorBooking);
  assert.equal(sessionStarted, false);
});

test('rejects an overlapping reservation when the last room is already allocated', async (t) => {
  const hotel = availableHotel();
  hotel.rooms[0].availableRooms = 1;
  let bookingCount = 0;

  replace(t, Booking, 'findOne', () => createQuery(null));
  replace(t, Hotel, 'findById', async () => hotel);
  replace(t, Hotel, 'findOne', () => createQuery(hotel));
  replace(t, Hotel, 'findOneAndUpdate', async (filter, update, options) => {
    assert.equal(filter['rooms.availableRooms'].$gte, 1);
    assert.equal(options.session, session);
    if (hotel.rooms[0].availableRooms < 1) return null;
    hotel.rooms[0].availableRooms -= 1;
    return hotel;
  });
  replace(t, Booking, 'create', async (payload, options) => {
    bookingCount += 1;
    return [{ ...payload[0], _id: bookingId }];
  });
  replace(t, Booking, 'findById', () => createQuery({ _id: bookingId }));

  const session = {
    async withTransaction(operation) { await operation(); },
    endSession() {},
  };
  replace(t, mongoose, 'startSession', async () => session);

  const firstResponse = createResponse();
  await createBooking(validRequest(), firstResponse);

  const overlappingRequest = validRequest();
  overlappingRequest.get = () => 'request-87654321';
  overlappingRequest.body.guestEmail = 'another@example.com';
  overlappingRequest.body.checkInDate = '2027-10-12';
  overlappingRequest.body.checkOutDate = '2027-10-14';
  const secondResponse = createResponse();
  await createBooking(overlappingRequest, secondResponse);

  assert.equal(firstResponse.statusCode, 201);
  assert.equal(secondResponse.statusCode, 409);
  assert.equal(bookingCount, 1);
  assert.equal(hotel.rooms[0].availableRooms, 0);
});

test('creates an available booking with server pricing inside one transaction', async (t) => {
  const hotel = availableHotel();
  const createdBooking = { _id: bookingId, bookingReference: 'BK-NEW' };
  let transactionStarted = false;
  let createPayload;
  let createOptions;
  let updateFilter;

  replace(t, Booking, 'findOne', () => createQuery(null));
  replace(t, Hotel, 'findById', async () => hotel);
  replace(t, Hotel, 'findOne', () => createQuery(hotel));
  replace(t, Hotel, 'findOneAndUpdate', async (filter, update, options) => {
    updateFilter = filter;
    assert.deepEqual(update, { $inc: { 'rooms.$.availableRooms': -1 } });
    assert.equal(options.session, session);
    return hotel;
  });
  replace(t, Booking, 'create', async (payload, options) => {
    createPayload = payload[0];
    createOptions = options;
    return [createdBooking];
  });
  replace(t, Booking, 'findById', () => createQuery(createdBooking));

  const session = {
    async withTransaction(operation) {
      transactionStarted = true;
      await operation();
    },
    endSession() {},
  };
  replace(t, mongoose, 'startSession', async () => session);

  const response = createResponse();
  await createBooking(validRequest(), response);

  assert.equal(response.statusCode, 201);
  assert.equal(transactionStarted, true);
  assert.equal(createPayload.basePrice, 125);
  assert.equal(createPayload.totalAmount, 250);
  assert.equal(createPayload.idempotencyKey, 'request-12345678');
  assert.equal(createOptions.session, session);
  assert.equal(updateFilter['rooms.availableRooms'].$gte, 1);
});