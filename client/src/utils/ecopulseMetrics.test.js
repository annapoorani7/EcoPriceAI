import { calculatePriceScenario } from './ecopulseMetrics';

const validScenario = {
  currentPrice: 100.5,
  proposedPrice: 125.25,
  checkInDate: '2026-10-10',
  checkOutDate: '2026-10-12',
  roomCount: 3,
  availableRooms: 8,
  today: '2026-10-09',
};

test('calculates transparent current and proposed booking amounts', () => {
  expect(calculatePriceScenario(validScenario)).toEqual({
    nights: 2,
    roomCount: 3,
    roomNights: 6,
    currentTotal: 603,
    proposedTotal: 751.5,
    difference: 148.5,
  });
});

test('rejects invalid, reversed, or past date ranges', () => {
  expect(() => calculatePriceScenario({ ...validScenario, checkInDate: '2026-02-30' })).toThrow(/valid check-in/);
  expect(() => calculatePriceScenario({ ...validScenario, checkOutDate: '2026-10-10' })).toThrow(/after check-in/);
  expect(() => calculatePriceScenario({ ...validScenario, checkInDate: '2026-10-08' })).toThrow(/today or later/);
});

test('rejects invalid prices and room counts outside inventory', () => {
  expect(() => calculatePriceScenario({ ...validScenario, proposedPrice: 0 })).toThrow(/greater than zero/);
  expect(() => calculatePriceScenario({ ...validScenario, currentPrice: Number.NaN })).toThrow(/greater than zero/);
  expect(() => calculatePriceScenario({ ...validScenario, roomCount: 9 })).toThrow(/between 1 and 8/);
  expect(() => calculatePriceScenario({ ...validScenario, roomCount: 1.5 })).toThrow(/between 1 and 8/);
});