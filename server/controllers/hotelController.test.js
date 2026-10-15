const test = require('node:test');
const assert = require('node:assert/strict');
const Hotel = require('../models/Hotel');
const { getMyHotel, updateMyHotel } = require('./hotelController');

const ownerId = '507f1f77bcf86cd799439011';

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

const replace = (t, target, property, value) => {
  const original = target[property];
  target[property] = value;
  t.after(() => { target[property] = original; });
};

test('loads only the hotel associated with the authenticated owner', async (t) => {
  const hotel = { name: 'Owner Hotel' };
  let queryFilter;
  replace(t, Hotel, 'findOne', (filter) => {
    queryFilter = filter;
    return { populate: async () => hotel };
  });

  const response = createResponse();
  await getMyHotel({ user: { _id: ownerId } }, response);

  assert.deepEqual(queryFilter, { owner: ownerId });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.hotel, hotel);
});

test('updates only profile fields on the authenticated owner hotel', async (t) => {
  const hotel = {
    name: 'Owner Hotel',
    email: 'old@example.com',
    phone: '555-0100',
    address: 'Old address',
    owner: ownerId,
    async save() { return this; },
    async populate() { return this; },
  };
  let queryFilter;
  replace(t, Hotel, 'findOne', async (filter) => {
    queryFilter = filter;
    return hotel;
  });

  const response = createResponse();
  await updateMyHotel({
    user: { _id: ownerId },
    body: {
      name: 'Updated Hotel',
      email: 'new@example.com',
      phone: '555-0101',
      address: 'New address',
      owner: '507f1f77bcf86cd799439099',
    },
  }, response);

  assert.deepEqual(queryFilter, { owner: ownerId });
  assert.equal(hotel.name, 'Updated Hotel');
  assert.equal(hotel.email, 'new@example.com');
  assert.equal(hotel.phone, '555-0101');
  assert.equal(hotel.address, 'New address');
  assert.equal(hotel.owner, ownerId);
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.hotel, hotel);
});

test('returns not found when the authenticated owner has no hotel', async (t) => {
  replace(t, Hotel, 'findOne', async () => null);

  const response = createResponse();
  await updateMyHotel({ user: { _id: ownerId }, body: { name: 'Unassociated' } }, response);

  assert.equal(response.statusCode, 404);
  assert.match(response.body.message, /No hotel is associated/);
});