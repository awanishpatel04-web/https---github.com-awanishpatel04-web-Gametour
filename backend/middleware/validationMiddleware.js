const { body, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }
  next();
};

// User validation rules
const userValidationRules = () => {
  return [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['organizer', 'player', 'fan']).withMessage('Invalid role')
  ];
};

const loginValidationRules = () => {
  return [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ];
};

// Tournament validation rules
const tournamentValidationRules = () => {
  return [
    body('name').notEmpty().withMessage('Tournament name is required'),
    body('sport').notEmpty().withMessage('Sport is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('venue').notEmpty().withMessage('Venue is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('maxTeams').isInt({ min: 2, max: 64 }).withMessage('Max teams must be between 2 and 64'),
    body('format').isIn(['Knockout', 'League', 'Group Stage + Knockout', 'Round Robin'])
  ];
};

module.exports = {
  validateRequest,
  userValidationRules,
  loginValidationRules,
  tournamentValidationRules
};