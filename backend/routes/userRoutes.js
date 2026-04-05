const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getUserTournaments,
  getAllUsers
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/tournaments', protect, getUserTournaments);
router.get('/', protect, authorize('admin'), getAllUsers);

module.exports = router;