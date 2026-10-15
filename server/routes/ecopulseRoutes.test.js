const test = require('node:test');
const assert = require('node:assert/strict');
const router = require('./ecopulseRoutes');
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

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

test('registers overview behind authentication and hotel-owner authorization', () => {
  const route = router.stack.find((layer) => layer.route?.path === '/overview')?.route;

  assert.ok(route);
  assert.equal(route.methods.get, true);
  assert.equal(route.stack[0].handle, protect);
  assert.equal(route.stack.length, 3);
});

test('the overview role guard denies customers and permits hotel owners', () => {
  const roleGuard = authorizeRoles('hotelOwner');
  let customerNextCalled = false;
  const customerResponse = createResponse();
  roleGuard({ user: { role: 'customer' } }, customerResponse, () => { customerNextCalled = true; });
  assert.equal(customerResponse.statusCode, 403);
  assert.equal(customerNextCalled, false);

  let ownerNextCalled = false;
  roleGuard({ user: { role: 'hotelOwner' } }, createResponse(), () => { ownerNextCalled = true; });
  assert.equal(ownerNextCalled, true);
});