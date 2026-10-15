const express = require('express');
const { getEvents } = require('../controllers/eventController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getEvents);

module.exports = router;
