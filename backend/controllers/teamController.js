const Team = require('../models/Team');
const User = require('../models/User');

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private
const createTeam = async (req, res) => {
  try {
    const teamData = {
      ...req.body,
      captain: req.user._id,
      captainName: req.user.name,
      members: [{
        user: req.user._id,
        name: req.user.name,
        role: 'captain'
      }]
    };
    
    const team = await Team.create(teamData);
    
    // Add team to user's registered teams
    await User.findByIdAndUpdate(req.user._id, {
      $push: { registeredTeams: team._id }
    });
    
    res.status(201).json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all teams
// @route   GET /api/teams
// @access  Public
const getTeams = async (req, res) => {
  try {
    const { tournament } = req.query;
    let query = {};
    
    if (tournament) query.tournament = tournament;
    
    const teams = await Team.find(query)
      .populate('captain', 'name email')
      .sort({ points: -1, wins: -1 });
    
    res.json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Public
const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('captain', 'name email')
      .populate('members.user', 'name email');
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Join a team
// @route   POST /api/teams/:id/join
// @access  Private
const joinTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    if (team.totalPlayers >= team.maxPlayers) {
      return res.status(400).json({
        success: false,
        message: 'Team is full'
      });
    }
    
    // Check if user already in team
    const alreadyMember = team.members.some(m => m.user.toString() === req.user._id.toString());
    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'Already a member of this team'
      });
    }
    
    team.members.push({
      user: req.user._id,
      name: req.user.name,
      role: 'player'
    });
    
    await team.save();
    
    // Add team to user's registered teams
    await User.findByIdAndUpdate(req.user._id, {
      $push: { registeredTeams: team._id }
    });
    
    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update team points (after match)
// @route   PUT /api/teams/:id/points
// @access  Private (Organizer only)
const updateTeamPoints = async (req, res) => {
  try {
    const { wins, losses, points } = req.body;
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    if (wins !== undefined) team.wins = wins;
    if (losses !== undefined) team.losses = losses;
    if (points !== undefined) team.points = points;
    
    await team.save();
    
    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  joinTeam,
  updateTeamPoints
};