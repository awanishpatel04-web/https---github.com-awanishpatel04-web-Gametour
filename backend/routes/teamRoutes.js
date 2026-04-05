const express = require('express');
const router = express.Router();
const {
  createTeam,
  getTeams,
  getTeamById,
  joinTeam,
  updateTeamPoints
} = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getTeams)
  .post(protect, createTeam);

router.route('/:id')
  .get(getTeamById);

router.post('/:id/join', protect, joinTeam);
router.put('/:id/points', protect, authorize('organizer', 'admin'), updateTeamPoints);

module.exports = router;