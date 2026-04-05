const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');

// @desc    Create a new match
// @route   POST /api/matches
// @access  Private (Organizer only)
const createMatch = async (req, res) => {
  try {
    const { tournament, teamA, teamB, round, venue, date, time } = req.body;
    
    // Check if tournament exists
    const tournamentExists = await Tournament.findById(tournament);
    if (!tournamentExists) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }
    
    // Get team names
    const teamAData = await Team.findById(teamA);
    const teamBData = await Team.findById(teamB);
    
    if (!teamAData || !teamBData) {
      return res.status(404).json({
        success: false,
        message: 'One or both teams not found'
      });
    }
    
    const matchData = {
      tournament,
      tournamentName: tournamentExists.name,
      teamA,
      teamAName: teamAData.name,
      teamB,
      teamBName: teamBData.name,
      round,
      venue,
      date,
      time,
      status: 'upcoming',
      scoreA: 0,
      scoreB: 0,
      liveUpdates: []
    };
    
    const match = await Match.create(matchData);
    
    // Add match to tournament
    tournamentExists.matches.push(match._id);
    await tournamentExists.save();
    
    res.status(201).json({
      success: true,
      data: match
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all matches with filters
// @route   GET /api/matches
// @access  Public
const getMatches = async (req, res) => {
  try {
    const { tournament, status, date, team } = req.query;
    let query = {};
    
    if (tournament) query.tournament = tournament;
    if (status) query.status = status;
    if (date) query.date = date;
    if (team) {
      query.$or = [
        { teamA: team },
        { teamB: team }
      ];
    }
    
    const matches = await Match.find(query)
      .populate('teamA teamB winner tournament')
      .sort({ date: 1, time: 1 });
    
    res.json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single match by ID
// @route   GET /api/matches/:id
// @access  Public
const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('teamA teamB winner tournament')
      .populate('liveUpdates');
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }
    
    res.json({
      success: true,
      data: match
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update match score (Live updates)
// @route   PUT /api/matches/:id/score
// @access  Private (Organizer only)
const updateMatchScore = async (req, res) => {
  try {
    const { scoreA, scoreB, message } = req.body;
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }
    
    // Update scores
    match.scoreA = scoreA;
    match.scoreB = scoreB;
    
    // Add live update entry
    match.liveUpdates.push({
      message: message || `Score updated: ${scoreA} - ${scoreB}`,
      scoreA,
      scoreB,
      timestamp: new Date()
    });
    
    // If match was upcoming, change to live
    if (match.status === 'upcoming') {
      match.status = 'live';
    }
    
    await match.save();
    
    // Emit socket event for real-time updates (if socket.io is set up)
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`match-${match._id}`).emit('score-update', {
        matchId: match._id,
        scoreA,
        scoreB,
        message: message || `Score updated: ${scoreA} - ${scoreB}`,
        timestamp: new Date()
      });
    }
    
    res.json({
      success: true,
      data: match
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Complete match and declare winner
// @route   PUT /api/matches/:id/complete
// @access  Private (Organizer only)
const completeMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }
    
    // Set match status to completed
    match.status = 'completed';
    
    // Determine winner based on scores
    if (match.scoreA > match.scoreB) {
      match.winner = match.teamA;
      
      // Update team stats (wins)
      await Team.findByIdAndUpdate(match.teamA, {
        $inc: { wins: 1, points: 2 }
      });
      await Team.findByIdAndUpdate(match.teamB, {
        $inc: { losses: 1 }
      });
      
    } else if (match.scoreB > match.scoreA) {
      match.winner = match.teamB;
      
      // Update team stats (wins)
      await Team.findByIdAndUpdate(match.teamB, {
        $inc: { wins: 1, points: 2 }
      });
      await Team.findByIdAndUpdate(match.teamA, {
        $inc: { losses: 1 }
      });
      
    } else {
      // Draw/Tie - both teams get 1 point
      await Team.findByIdAndUpdate(match.teamA, {
        $inc: { points: 1 }
      });
      await Team.findByIdAndUpdate(match.teamB, {
        $inc: { points: 1 }
      });
    }
    
    // Add completion update to live updates
    match.liveUpdates.push({
      message: `Match completed. Final score: ${match.scoreA} - ${match.scoreB}`,
      scoreA: match.scoreA,
      scoreB: match.scoreB,
      timestamp: new Date()
    });
    
    await match.save();
    
    // Emit socket event for match completion
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`match-${match._id}`).emit('match-completed', {
        matchId: match._id,
        winner: match.winner,
        scoreA: match.scoreA,
        scoreB: match.scoreB,
        message: `Match completed! Final score: ${match.scoreA} - ${match.scoreB}`
      });
    }
    
    res.json({
      success: true,
      data: match,
      message: 'Match completed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get live matches (currently ongoing)
// @route   GET /api/matches/live/now
// @access  Public
const getLiveMatches = async (req, res) => {
  try {
    const liveMatches = await Match.find({ status: 'live' })
      .populate('teamA teamB tournament')
      .sort({ date: 1 });
    
    res.json({
      success: true,
      count: liveMatches.length,
      data: liveMatches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get upcoming matches
// @route   GET /api/matches/upcoming
// @access  Public
const getUpcomingMatches = async (req, res) => {
  try {
    const upcomingMatches = await Match.find({ 
      status: 'upcoming',
      date: { $gte: new Date() }
    })
      .populate('teamA teamB tournament')
      .sort({ date: 1, time: 1 })
      .limit(10);
    
    res.json({
      success: true,
      count: upcomingMatches.length,
      data: upcomingMatches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get match by tournament
// @route   GET /api/matches/tournament/:tournamentId
// @access  Public
const getMatchesByTournament = async (req, res) => {
  try {
    const matches = await Match.find({ tournament: req.params.tournamentId })
      .populate('teamA teamB winner')
      .sort({ round: 1, date: 1 });
    
    res.json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete match
// @route   DELETE /api/matches/:id
// @access  Private (Organizer/Admin only)
const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }
    
    // Remove match from tournament
    await Tournament.findByIdAndUpdate(match.tournament, {
      $pull: { matches: match._id }
    });
    
    await match.remove();
    
    res.json({
      success: true,
      message: 'Match deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Export all controller functions
module.exports = {
  createMatch,
  getMatches,
  getMatchById,
  updateMatchScore,
  completeMatch,
  getLiveMatches,
  getUpcomingMatches,
  getMatchesByTournament,
  deleteMatch
};