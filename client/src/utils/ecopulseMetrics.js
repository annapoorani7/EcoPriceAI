const DAY_MS = 24 * 60 * 60 * 1000;

const parseDateOnly = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  const parsed = new Date(timestamp);
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) return null;
  return timestamp;
};

const toCents = (value, label) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`${label} must be greater than zero.`);
  }

  const cents = Math.round(amount * 100);
  if (!Number.isSafeInteger(cents) || cents <= 0) {
    throw new Error(`${label} is outside the supported price range.`);
  }
  return cents;
};

export const formatLocalDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const calculatePriceScenario = ({
  currentPrice,
  proposedPrice,
  checkInDate,
  checkOutDate,
  roomCount,
  availableRooms,
  today = formatLocalDateInput(new Date()),
}) => {
  const checkIn = parseDateOnly(checkInDate);
  const checkOut = parseDateOnly(checkOutDate);
  const todayTimestamp = parseDateOnly(today);

  if (checkIn === null || checkOut === null || todayTimestamp === null) {
    throw new Error('Enter valid check-in, check-out, and current dates.');
  }
  if (checkIn < todayTimestamp) {
    throw new Error('Check-in date must be today or later.');
  }
  if (checkOut <= checkIn) {
    throw new Error('Check-out date must be after check-in.');
  }

  const requestedRooms = Number(roomCount);
  const inventoryRooms = Number(availableRooms);
  if (!Number.isInteger(inventoryRooms) || inventoryRooms < 1 ||
      !Number.isInteger(requestedRooms) || requestedRooms < 1 || requestedRooms > inventoryRooms) {
    throw new Error(`Room count must be between 1 and ${inventoryRooms || 0}.`);
  }

  const currentPriceCents = toCents(currentPrice, 'Current listed price');
  const proposedPriceCents = toCents(proposedPrice, 'Proposed price');
  const nights = (checkOut - checkIn) / DAY_MS;
  const roomNights = nights * requestedRooms;
  const currentTotalCents = currentPriceCents * roomNights;
  const proposedTotalCents = proposedPriceCents * roomNights;

  if (!Number.isSafeInteger(currentTotalCents) || !Number.isSafeInteger(proposedTotalCents)) {
    throw new Error('This scenario is outside the supported calculation range.');
  }

  return {
    nights,
    roomCount: requestedRooms,
    roomNights,
    currentTotal: currentTotalCents / 100,
    proposedTotal: proposedTotalCents / 100,
    difference: (proposedTotalCents - currentTotalCents) / 100,
  };
};