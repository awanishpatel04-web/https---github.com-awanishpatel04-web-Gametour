const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a team name'],
    trim: true,
    unique: true
  },
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  captainName: {
    type: String,
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    role: {
      type: String,
      enum: ['captain', 'vice-captain', 'player', 'substitute'],
      default: 'player'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament'
  },
  totalPlayers: {
    type: Number,
    default: 1
  },
  maxPlayers: {
    type: Number,
    default: 15
  },
  logo: {
    type: String,
    default: 'default-team.png'
  },
  wins: {
    type: Number,
    default: 0
  },
  losses: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update totalPlayers count
teamSchema.pre('save', function(next) {
  this.totalPlayers = this.members.length;
  next();
});

module.exports = mongoose.model('Team', teamSchema);