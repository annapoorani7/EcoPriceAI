const express = require('express');
const { registerUser, loginUser, getMe, authValidationRules } = require('../controllers/authController');
const validateRequest = require('../middleware/validateRequest');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authValidationRules.register, validateRequest, registerUser);
router.post('/login', authValidationRules.login, validateRequest, loginUser);
router.get('/me', protect, getMe);

module.exports = router;
