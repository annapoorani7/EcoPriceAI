const express = require('express');
const { getOverview } = require('../controllers/ecopulseController');
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/overview', protect, authorizeRoles('hotelOwner'), getOverview);

module.exports = router;