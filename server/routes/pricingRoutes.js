const express = require('express');
const { predictPrice } = require('../controllers/pricingController');
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/predict', protect, authorizeRoles('admin', 'hotelOwner', 'staff'), predictPrice);

module.exports = router;
