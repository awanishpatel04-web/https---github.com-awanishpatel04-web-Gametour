// Format date to readable string
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Check if tournament is live based on dates
const getTournamentStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  return 'live';
};

// Calculate team ranking based on wins/losses
const calculateRanking = (teams) => {
  return teams.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    return (b.wins - b.losses) - (a.wins - a.losses);
  });
};

// Generate match schedule
const generateSchedule = (teams, format) => {
  const schedule = [];
  // Simple round-robin schedule generator
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      schedule.push({
        teamA: teams[i],
        teamB: teams[j],
        round: 'League'
      });
    }
  }
  return schedule;
};

module.exports = {
  formatDate,
  getTournamentStatus,
  calculateRanking,
  generateSchedule
};