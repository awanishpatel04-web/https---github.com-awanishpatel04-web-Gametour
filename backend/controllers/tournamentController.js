const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const Team = require('../models/Team');

// @desc    Create a new tournament
// @route   POST /api/tournaments
// @access  Private (Organizer only)
const createTournament = async (req, res) => {
  try {
    const tournamentData = {
      ...req.body,
      organizer: req.user._id
    };
    
    const tournament = await Tournament.create(tournamentData);
    
    res.status(201).json({
      success: true,
      data: tournament
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
const getTournaments = async (req, res) => {
  try {
    const { sport, status, location, search } = req.query;
    let query = {};
    
    if (sport) query.sport = sport;
    if (status) query.status = status;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const tournaments = await Tournament.find(query)
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: tournaments.length,
      data: tournaments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single tournament
// @route   GET /api/tournaments/:id
// @access  Public
const getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('teams')
      .populate('matches');
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }
    
    res.json({
      success: true,
      data: tournament
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update tournament
// @route   PUT /api/tournaments/:id
// @access  Private (Organizer only)
const updateTournament = async (req, res) => {
  try {
    let tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }
    
    // Check ownership
    if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this tournament'
      });
    }
    
    tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: tournament
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete tournament
// @route   DELETE /api/tournaments/:id
// @access  Private (Organizer only)
const deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }
    
    // Check ownership
    if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this tournament'
      });
    }
    
    // Delete associated matches and teams
    await Match.deleteMany({ tournament: req.params.id });
    await Team.deleteMany({ tournament: req.params.id });
    await tournament.remove();
    
    res.json({
      success: true,
      message: 'Tournament deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Register team for tournament
// @route   POST /api/tournaments/:id/register
// @access  Private
const registerForTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }
    
    if (tournament.currentTeams >= tournament.maxTeams) {
      return res.status(400).json({
        success: false,
        message: 'Tournament is full'
      });
    }
    
    if (new Date() > new Date(tournament.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed'
      });
    }
    
    const team = await Team.findById(req.body.teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    tournament.teams.push(team._id);
    tournament.currentTeams += 1;
    team.tournament = tournament._id;
    
    await tournament.save();
    await team.save();
    
    res.json({
      success: true,
      message: 'Team registered successfully',
      data: tournament
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createTournament,
  getTournaments,
  getTournamentById,
  updateTournament,
  deleteTournament,
  registerForTournament
};