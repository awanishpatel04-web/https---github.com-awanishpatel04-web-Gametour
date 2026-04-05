const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { userValidationRules, loginValidationRules, validateRequest } = require('../middleware/validationMiddleware');

router.post('/register', userValidationRules(), validateRequest, registerUser);
router.post('/login', loginValidationRules(), validateRequest, loginUser);
router.get('/me', protect, getMe);

module.exports = router;