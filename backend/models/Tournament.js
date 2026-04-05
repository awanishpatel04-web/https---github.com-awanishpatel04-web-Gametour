const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a tournament name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  sport: {
    type: String,
    required: [true, 'Please add a sport'],
    enum: ['Cricket', 'Football', 'Kabaddi', 'Basketball', 'Badminton', 'Tennis', 'Other']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  venue: {
    type: String,
    required: [true, 'Please add a venue']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Please add a registration deadline']
  },
  entryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  prizePool: {
    type: String,
    required: [true, 'Please add prize pool information']
  },
  format: {
    type: String,
    enum: ['Knockout', 'League', 'Group Stage + Knockout', 'Round Robin'],
    required: true
  },
  maxTeams: {
    type: Number,
    required: true,
    min: 2,
    max: 64
  },
  currentTeams: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  }],
  rules: {
    type: String,
    default: 'Standard tournament rules apply'
  },
  image: {
    type: String,
    default: 'default-tournament.jpg'
  }
}, {
  timestamps: true
});

// Validate that end date is after start date
tournamentSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  if (this.registrationDeadline >= this.startDate) {
    next(new Error('Registration deadline must be before start date'));
  }
  next();
});

module.exports = mongoose.model('Tournament', tournamentSchema);