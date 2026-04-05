const express = require('express');
const router = express.Router();
const {
  createTournament,
  getTournaments,
  getTournamentById,
  updateTournament,
  deleteTournament,
  registerForTournament
} = require('../controllers/tournamentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { tournamentValidationRules, validateRequest } = require('../middleware/validationMiddleware');

router.route('/')
  .get(getTournaments)
  .post(protect, authorize('organizer', 'admin'), tournamentValidationRules(), validateRequest, createTournament);

router.route('/:id')
  .get(getTournamentById)
  .put(protect, authorize('organizer', 'admin'), updateTournament)
  .delete(protect, authorize('organizer', 'admin'), deleteTournament);

router.post('/:id/register', protect, registerForTournament);

module.exports = router;