// GameTour Data Management
// This file manages tournaments, matches, and user data
// All data starts empty - users will create real tournaments

// Initialize empty arrays for data
let tournamentsData = [];
let matchesData = [];

// Current user data (will be populated after login)
let currentUser = {
    id: null,
    name: "",
    email: "",
    role: "",
    avatar: "",
    registeredTournaments: [],
    createdAt: null
};

// Load data from localStorage
function loadDataFromStorage() {
    const savedTournaments = localStorage.getItem('gametour_tournaments');
    const savedMatches = localStorage.getItem('gametour_matches');
    const savedUser = localStorage.getItem('gametour_user');
    
    if (savedTournaments) {
        tournamentsData = JSON.parse(savedTournaments);
    } else {
        tournamentsData = [];
        localStorage.setItem('gametour_tournaments', JSON.stringify([]));
    }
    
    if (savedMatches) {
        matchesData = JSON.parse(savedMatches);
    } else {
        matchesData = [];
        localStorage.setItem('gametour_matches', JSON.stringify([]));
    }
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
}

// Save data to localStorage
function saveTournamentsToStorage() {
    localStorage.setItem('gametour_tournaments', JSON.stringify(tournamentsData));
}

function saveMatchesToStorage() {
    localStorage.setItem('gametour_matches', JSON.stringify(matchesData));
}

function saveUserToStorage() {
    localStorage.setItem('gametour_user', JSON.stringify(currentUser));
}

// Tournament Functions
function getTournaments() {
    return tournamentsData;
}

function getTournamentById(id) {
    return tournamentsData.find(t => t.id === parseInt(id));
}

function createTournament(tournamentData) {
    const newTournament = {
        id: Date.now(),
        name: tournamentData.name,
        sport: tournamentData.sport,
        location: tournamentData.location,
        startDate: tournamentData.startDate,
        endDate: tournamentData.endDate,
        status: 'upcoming',
        entryFee: tournamentData.entryFee || 0,
        prize: tournamentData.prize,
        teams: tournamentData.teams || 0,
        format: tournamentData.format,
        organizer: tournamentData.organizer,
        description: tournamentData.description || '',
        createdAt: new Date().toISOString(),
        registeredTeams: []
    };
    
    tournamentsData.push(newTournament);
    saveTournamentsToStorage();
    return newTournament;
}

function updateTournamentStatus(tournamentId, status) {
    const tournament = getTournamentById(tournamentId);
    if (tournament) {
        tournament.status = status;
        saveTournamentsToStorage();
        return true;
    }
    return false;
}

function deleteTournament(tournamentId) {
    const index = tournamentsData.findIndex(t => t.id === parseInt(tournamentId));
    if (index !== -1) {
        tournamentsData.splice(index, 1);
        saveTournamentsToStorage();
        return true;
    }
    return false;
}

// Match Functions
function getMatches() {
    return matchesData;
}

function getMatchesByTournament(tournamentId) {
    return matchesData.filter(m => m.tournamentId === parseInt(tournamentId));
}

function getLiveMatches() {
    return matchesData.filter(m => m.status === 'live');
}

function createMatch(matchData) {
    const newMatch = {
        id: Date.now(),
        tournamentId: matchData.tournamentId,
        tournamentName: matchData.tournamentName,
        teamA: matchData.teamA,
        teamB: matchData.teamB,
        scoreA: 0,
        scoreB: 0,
        status: matchData.status || 'upcoming',
        time: matchData.time,
        venue: matchData.venue,
        date: matchData.date
    };
    
    matchesData.push(newMatch);
    saveMatchesToStorage();
    return newMatch;
}

function updateMatchScore(matchId, scoreA, scoreB) {
    const match = matchesData.find(m => m.id === parseInt(matchId));
    if (match) {
        match.scoreA = scoreA;
        match.scoreB = scoreB;
        saveMatchesToStorage();
        return true;
    }
    return false;
}

function updateMatchStatus(matchId, status) {
    const match = matchesData.find(m => m.id === parseInt(matchId));
    if (match) {
        match.status = status;
        saveMatchesToStorage();
        return true;
    }
    return false;
}

// User Functions
function registerUser(userData) {
    currentUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatar: userData.name.charAt(0).toUpperCase(),
        registeredTournaments: [],
        createdAt: new Date().toISOString()
    };
    saveUserToStorage();
    return currentUser;
}

function loginUser(email, password) {
    // For demo purposes, create/return user
    const savedUser = localStorage.getItem('gametour_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        return currentUser;
    }
    return null;
}

function logoutUser() {
    localStorage.removeItem('gametour_user');
    currentUser = {
        id: null,
        name: "",
        email: "",
        role: "",
        avatar: "",
        registeredTournaments: [],
        createdAt: null
    };
}

function getCurrentUser() {
    const savedUser = localStorage.getItem('gametour_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        return currentUser;
    }
    return null;
}

function getUserTournaments() {
    if (!currentUser.id) return [];
    return tournamentsData.filter(t => currentUser.registeredTournaments.includes(t.id));
}

function registerForTournament(tournamentId) {
    if (!currentUser.id) {
        return false;
    }
    
    if (!currentUser.registeredTournaments.includes(tournamentId)) {
        currentUser.registeredTournaments.push(tournamentId);
        saveUserToStorage();
        
        // Update tournament team count
        const tournament = getTournamentById(tournamentId);
        if (tournament) {
            tournament.teams += 1;
            saveTournamentsToStorage();
        }
        return true;
    }
    return false;
}

function isUserRegisteredForTournament(tournamentId) {
    if (!currentUser.id) return false;
    return currentUser.registeredTournaments.includes(tournamentId);
}

// Initialize data on page load
loadDataFromStorage();

// Export functions for use in other files (available globally)
window.getTournaments = getTournaments;
window.getTournamentById = getTournamentById;
window.createTournament = createTournament;
window.updateTournamentStatus = updateTournamentStatus;
window.deleteTournament = deleteTournament;
window.getMatches = getMatches;
window.getMatchesByTournament = getMatchesByTournament;
window.getLiveMatches = getLiveMatches;
window.createMatch = createMatch;
window.updateMatchScore = updateMatchScore;
window.updateMatchStatus = updateMatchStatus;
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.getUserTournaments = getUserTournaments;
window.registerForTournament = registerForTournament;
window.isUserRegisteredForTournament = isUserRegisteredForTournament;
window.saveTournamentsToStorage = saveTournamentsToStorage;
window.saveMatchesToStorage = saveMatchesToStorage;
window.saveUserToStorage = saveUserToStorage;