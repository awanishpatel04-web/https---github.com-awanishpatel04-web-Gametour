// Tournament details page functionality

function loadTournamentDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const tournamentId = urlParams.get('id');
    
    if (!tournamentId) {
        window.location.href = 'tournaments.html';
        return;
    }
    
    const tournament = getTournamentById(tournamentId);
    if (!tournament) {
        document.getElementById('tournamentDetails').innerHTML = '<div class="error"><i class="fas fa-exclamation-triangle"></i><p>Tournament not found</p><a href="tournaments.html" class="btn-primary">Back to Tournaments</a></div>';
        return;
    }
    
    const matches = getMatchesByTournament(tournamentId);
    const isRegistered = currentUser.registeredTournaments.includes(tournament.id);
    
    const container = document.getElementById('tournamentDetails');
    container.innerHTML = `
        <div class="tournament-header-detail">
            <h1>${tournament.name}</h1>
            <div class="tournament-meta">
                <span class="tournament-status status-${tournament.status}">${tournament.status.toUpperCase()}</span>
                <span class="tournament-sport"><i class="fas fa-tag"></i> ${tournament.sport}</span>
            </div>
        </div>
        
        <div class="tournament-info-grid">
            <div class="info-card">
                <i class="fas fa-map-marker-alt"></i>
                <h3>Location</h3>
                <p>${tournament.location}</p>
            </div>
            <div class="info-card">
                <i class="fas fa-calendar"></i>
                <h3>Dates</h3>
                <p>${tournament.startDate} to ${tournament.endDate}</p>
            </div>
            <div class="info-card">
                <i class="fas fa-users"></i>
                <h3>Teams</h3>
                <p>${tournament.teams} Teams</p>
            </div>
            <div class="info-card">
                <i class="fas fa-trophy"></i>
                <h3>Prize Pool</h3>
                <p>${tournament.prize}</p>
            </div>
            <div class="info-card">
                <i class="fas fa-money-bill"></i>
                <h3>Entry Fee</h3>
                <p>₹${tournament.entryFee}</p>
            </div>
            <div class="info-card">
                <i class="fas fa-chart-line"></i>
                <h3>Format</h3>
                <p>${tournament.format}</p>
            </div>
        </div>
        
        <div class="tournament-description">
            <h3><i class="fas fa-info-circle"></i> About Tournament</h3>
            <p>${tournament.description || 'Join this exciting tournament and showcase your skills! Competitive matches, great prizes, and amazing experience await.'}</p>
            <p><strong>Organized by:</strong> ${tournament.organizer}</p>
        </div>
        
        <div class="tournament-actions">
            ${!isRegistered && tournament.status !== 'completed' ? `
                <button class="btn-primary" onclick="registerForTournament(${tournament.id})">
                    <i class="fas fa-check-circle"></i> Register Now
                </button>
            ` : isRegistered ? `
                <button class="btn-secondary" disabled>
                    <i class="fas fa-check"></i> Already Registered
                </button>
            ` : ''}
            <button class="btn-secondary" onclick="window.location.href='live-scores.html'">
                <i class="fas fa-chart-line"></i> View Live Scores
            </button>
        </div>
        
        <div class="matches-section">
            <h3><i class="fas fa-calendar-alt"></i> Match Schedule</h3>
            ${matches.length > 0 ? `
                <div class="matches-list">
                    ${matches.map(match => `
                        <div class="match-item ${match.status}">
                            <div class="match-teams-detail">
                                <span class="team-name">${match.teamA}</span>
                                <span class="vs">vs</span>
                                <span class="team-name">${match.teamB}</span>
                            </div>
                            <div class="match-score-detail">
                                ${match.status === 'completed' ? `${match.scoreA} - ${match.scoreB}` : match.status === 'live' ? `${match.scoreA} - ${match.scoreB} (LIVE)` : 'Not Started'}
                            </div>
                            <div class="match-info-detail">
                                <span><i class="fas fa-calendar"></i> ${match.date}</span>
                                <span><i class="fas fa-clock"></i> ${match.time}</span>
                                <span><i class="fas fa-map-marker-alt"></i> ${match.venue}</span>
                            </div>
                            ${match.status === 'live' ? `<a href="live-scores.html" class="watch-live">Watch Live <i class="fas fa-arrow-right"></i></a>` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : '<p class="no-matches">Schedule will be announced soon!</p>'}
        </div>
    `;
}

function registerForTournament(tournamentId) {
    const user = localStorage.getItem('gametour_user');
    if (!user) {
        alert('Please login first to register for tournaments!');
        window.location.href = '../index.html';
        return;
    }
    
    const success = registerForTournament(tournamentId);
    if (success) {
        alert('Successfully registered for tournament!');
        saveUserData();
        location.reload();
    } else {
        alert('Already registered for this tournament!');
    }
}

// Load tournament details when page loads
document.addEventListener('DOMContentLoaded', loadTournamentDetails);