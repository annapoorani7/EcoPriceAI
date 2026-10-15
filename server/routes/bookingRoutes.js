const express = require('express');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
} = require('../controllers/bookingController');
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', protect, authorizeRoles('admin', 'hotelOwner', 'customer'), createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.get('/', protect, authorizeRoles('admin'), getAllBookings);
router.put('/:id/status', protect, authorizeRoles('admin'), updateBookingStatus);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
