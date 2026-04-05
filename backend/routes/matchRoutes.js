const express = require('express');
const router = express.Router();

const {
  createMatch,
  getMatches,
  getMatchById,
  updateMatchScore,
  completeMatch,
  getLiveMatches,
  getUpcomingMatches,
  getMatchesByTournament,
  deleteMatch
} = require('../controllers/matchController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/live', getLiveMatches);
router.get('/upcoming', getUpcomingMatches);
router.get('/tournament/:tournamentId', getMatchesByTournament);

// Main match routes
router.route('/')
  .get(getMatches)
  .post(protect, authorize('organizer', 'admin'), createMatch);

router.route('/:id')
  .get(getMatchById)
  .delete(protect, authorize('organizer', 'admin'), deleteMatch);

// Match update routes
router.put('/:id/score', protect, authorize('organizer', 'admin'), updateMatchScore);
router.put('/:id/complete', protect, authorize('organizer', 'admin'), completeMatch);

module.exports = router;