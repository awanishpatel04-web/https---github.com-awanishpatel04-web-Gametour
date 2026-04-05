// Main JavaScript for GameTour

// Load tournament preview on homepage
function loadTournamentPreview() {
    const container = document.getElementById('tournamentPreview');
    if (container) {
        const tournaments = getTournaments();
        if (tournaments.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 3rem; grid-column: 1/-1;">
                    <i class="fas fa-plus-circle" style="font-size: 3rem; color: #cbd5e1;"></i>
                    <h3>No Tournaments Yet</h3>
                    <p>Be the first to create a tournament!</p>
                    <button class="btn-primary" onclick="window.location.href='pages/create-tournament.html'">
                        Create Tournament
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = tournaments.slice(0, 3).map(t => `
            <div class="tournament-card" onclick="viewTournament(${t.id})">
                <div class="tournament-header">
                    <h3>${t.name}</h3>
                </div>
                <div class="tournament-body">
                    <span class="tournament-status status-${t.status}">${t.status.toUpperCase()}</span>
                    <p><i class="fas fa-map-marker-alt"></i> ${t.location}</p>
                    <p><i class="fas fa-calendar"></i> ${t.startDate} to ${t.endDate}</p>
                    <p><i class="fas fa-users"></i> ${t.teams} Teams</p>
                    <p><i class="fas fa-trophy"></i> Prize: ${t.prize}</p>
                    <button class="btn-primary-small" onclick="event.stopPropagation(); registerForTournamentPrompt(${t.id})">
                        Register Now
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function viewTournament(id) {
    window.location.href = `pages/tournament-details.html?id=${id}`;
}

function registerForTournamentPrompt(tournamentId) {
    const user = getCurrentUser();
    if (!user) {
        showLoginModal();
        return;
    }
    
    const success = registerForTournament(tournamentId);
    if (success) {
        alert('Successfully registered for tournament!');
        location.reload();
    } else {
        alert('Already registered for this tournament!');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    loadTournamentPreview();
});