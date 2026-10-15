const express = require('express');
const { getWeatherSummary } = require('../controllers/weatherController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getWeatherSummary);

module.exports = router;
