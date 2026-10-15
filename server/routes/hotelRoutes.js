const express = require('express');
const {
  createHotel,
  getMyHotel,
  updateMyHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
} = require('../controllers/hotelController');
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', protect, authorizeRoles('admin', 'hotelOwner'), getHotels);
router.get('/my-hotel', protect, authorizeRoles('admin', 'hotelOwner'), getMyHotel);
router.put('/my-hotel', protect, authorizeRoles('admin', 'hotelOwner'), updateMyHotel);
router.get('/:id', protect, authorizeRoles('admin', 'hotelOwner'), getHotelById);

router.post('/', protect, authorizeRoles('admin', 'hotelOwner'), createHotel);
router.put('/:id', protect, authorizeRoles('admin', 'hotelOwner'), updateHotel);
router.delete('/:id', protect, authorizeRoles('admin', 'hotelOwner'), deleteHotel);

module.exports = router;
