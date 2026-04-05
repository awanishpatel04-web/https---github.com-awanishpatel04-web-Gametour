const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  tournamentName: {
    type: String,
    required: true
  },
  teamA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  teamAName: {
    type: String,
    required: true
  },
  teamB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  teamBName: {
    type: String,
    required: true
  },
  scoreA: {
    type: Number,
    default: 0
  },
  scoreB: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  round: {
    type: String,
    enum: ['Quarter Final', 'Semi Final', 'Final', 'League', 'Group Stage'],
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  umpire: {
    type: String,
    default: 'TBA'
  },
  liveUpdates: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    message: String,
    scoreA: Number,
    scoreB: Number
  }],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  }
}, {
  timestamps: true
});

// Update winner when match is completed
matchSchema.pre('save', function(next) {
  if (this.status === 'completed' && !this.winner) {
    if (this.scoreA > this.scoreB) {
      this.winner = this.teamA;
    } else if (this.scoreB > this.scoreA) {
      this.winner = this.teamB;
    }
  }
  next();
});

module.exports = mongoose.model('Match', matchSchema);