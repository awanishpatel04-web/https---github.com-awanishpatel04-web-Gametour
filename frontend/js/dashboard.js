// Dashboard functionality for GameTour

function loadDashboard() {
    const user = localStorage.getItem('gametour_user');
    if (!user) {
        window.location.href = '../index.html';
        return;
    }
    
    const userData = JSON.parse(user);
    const container = document.getElementById('dashboardContent');
    
    function renderOverview() {
        const myTournaments = getUserTournaments();
        const liveMatches = getLiveMatches();
        
        container.innerHTML = `
            <h2>Welcome back, ${userData.name}!</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <i class="fas fa-trophy"></i>
                    <h3>${myTournaments.length}</h3>
                    <p>Tournaments Joined</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-users"></i>
                    <h3>${myTournaments.reduce((sum, t) => sum + t.teams, 0)}</h3>
                    <p>Total Teams</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-chart-line"></i>
                    <h3>${getTournaments().filter(t => t.status === 'live').length}</h3>
                    <p>Live Events</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-calendar"></i>
                    <h3>${getTournaments().filter(t => t.status === 'upcoming').length}</h3>
                    <p>Upcoming Events</p>
                </div>
            </div>
            
            <div class="recent-activity">
                <h3><i class="fas fa-clock"></i> Recent Activity</h3>
                <div class="activity-item">
                    <i class="fas fa-plus-circle"></i>
                    <div class="activity-details">
                        <div class="activity-title">Welcome to GameTour!</div>
                        <div class="activity-time">Start exploring tournaments</div>
                    </div>
                </div>
                ${myTournaments.length > 0 ? `
                <div class="activity-item">
                    <i class="fas fa-trophy"></i>
                    <div class="activity-details">
                        <div class="activity-title">You're registered in ${myTournaments.length} tournament(s)</div>
                        <div class="activity-time">Check your matches</div>
                    </div>
                </div>
                ` : ''}
                ${liveMatches.length > 0 ? `
                <div class="activity-item">
                    <i class="fas fa-chart-line"></i>
                    <div class="activity-details">
                        <div class="activity-title">${liveMatches.length} match(es) currently live!</div>
                        <div class="activity-time">Watch live scores now</div>
                    </div>
                </div>
                ` : ''}
            </div>
            
            <h3 style="margin-top: 2rem;">Your Active Tournaments</h3>
            <div class="tournament-grid">
                ${myTournaments.length > 0 ? myTournaments.map(t => `
                    <div class="tournament-card" onclick="viewTournamentDetails(${t.id})">
                        <div class="tournament-header">
                            <h3>${t.name}</h3>
                        </div>
                        <div class="tournament-body">
                            <span class="tournament-status status-${t.status}">${t.status.toUpperCase()}</span>
                            <p><i class="fas fa-calendar"></i> ${t.startDate} to ${t.endDate}</p>
                            <p><i class="fas fa-map-marker-alt"></i> ${t.location}</p>
                            <button class="btn-primary-small" onclick="event.stopPropagation(); viewTournamentDetails(${t.id})">
                                View Details
                            </button>
                        </div>
                    </div>
                `).join('') : '<p style="text-align: center; padding: 2rem;">No tournaments joined yet. <a href="tournaments.html">Browse tournaments</a> to get started!</p>'}
            </div>
        `;
    }
    
    function renderMyTournaments() {
        const myTournaments = getUserTournaments();
        container.innerHTML = `
            <h2><i class="fas fa-trophy"></i> My Tournaments</h2>
            ${myTournaments.length > 0 ? `
                <div class="tournament-grid">
                    ${myTournaments.map(t => `
                        <div class="tournament-card">
                            <div class="tournament-header">
                                <h3>${t.name}</h3>
                            </div>
                            <div class="tournament-body">
                                <span class="tournament-status status-${t.status}">${t.status}</span>
                                <p><i class="fas fa-tag"></i> ${t.sport}</p>
                                <p><i class="fas fa-map-marker-alt"></i> ${t.location}</p>
                                <p><i class="fas fa-calendar"></i> ${t.startDate}</p>
                                <p><i class="fas fa-trophy"></i> Prize: ${t.prize}</p>
                                <button class="btn-primary-small" onclick="viewTournamentDetails(${t.id})">
                                    Manage Tournament
                                </button>
                                ${t.status === 'live' ? '<button class="btn-secondary-small" onclick="viewLiveMatches(${t.id})">View Live Matches</button>' : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '<div class="empty-state"><i class="fas fa-trophy"></i><p>You haven\'t joined any tournaments yet.</p><button class="btn-primary" onclick="window.location.href=\'tournaments.html\'">Browse Tournaments</button></div>'}
        `;
    }
    
    function renderLiveMatches() {
        const liveMatches = getLiveMatches();
        container.innerHTML = `
            <h2><i class="fas fa-chart-line"></i> Live Matches</h2>
            ${liveMatches.length > 0 ? `
                <div class="matches-container">
                    ${liveMatches.map(match => `
                        <div class="match-card live">
                            <div class="match-header-info">
                                <span class="tournament-badge">${match.tournamentName}</span>
                                <span class="live-badge"><i class="fas fa-circle"></i> LIVE</span>
                            </div>
                            <div class="match-teams">
                                <div class="team">
                                    <h4>${match.teamA}</h4>
                                    <div class="score-large">${match.scoreA}</div>
                                </div>
                                <div class="vs">VS</div>
                                <div class="team">
                                    <h4>${match.teamB}</h4>
                                    <div class="score-large">${match.scoreB}</div>
                                </div>
                            </div>
                            <div class="match-info">
                                <p><i class="fas fa-clock"></i> ${match.time}</p>
                                <p><i class="fas fa-map-marker-alt"></i> ${match.venue}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '<div class="empty-state"><i class="fas fa-futbol"></i><p>No live matches at the moment.</p><a href="live-scores.html" class="btn-primary">Check All Matches</a></div>'}
        `;
    }
    
    function renderProfile() {
        container.innerHTML = `
            <h2><i class="fas fa-user-circle"></i> My Profile</h2>
            <div class="profile-card">
                <div class="profile-avatar">${userData.avatar || userData.name.charAt(0)}</div>
                <div class="profile-info">
                    <p><strong>Name:</strong> ${userData.name}</p>
                    <p><strong>Email:</strong> ${userData.email}</p>
                    <p><strong>Role:</strong> ${userData.role}</p>
                    <p><strong>Member since:</strong> ${new Date(userData.createdAt).toLocaleDateString()}</p>
                    <p><strong>Tournaments Joined:</strong> ${getUserTournaments().length}</p>
                </div>
                <button class="btn-primary" onclick="editProfile()">Edit Profile</button>
                <button class="btn-secondary" onclick="logout()">Logout</button>
            </div>
        `;
    }
    
    // Tab switching
    const tabs = document.querySelectorAll('.dashboard-sidebar li');
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const tabName = tab.dataset.tab;
            if (tabName === 'overview') renderOverview();
            else if (tabName === 'tournaments') renderMyTournaments();
            else if (tabName === 'matches') renderLiveMatches();
            else if (tabName === 'profile') renderProfile();
        };
    });
    
    renderOverview();
}

function viewTournamentDetails(id) {
    window.location.href = `tournament-details.html?id=${id}`;
}

function viewLiveMatches(id) {
    window.location.href = `live-scores.html?tournament=${id}`;
}

function editProfile() {
    const user = JSON.parse(localStorage.getItem('gametour_user'));
    const newName = prompt('Enter your name:', user.name);
    if (newName) {
        user.name = newName;
        user.avatar = newName.charAt(0);
        localStorage.setItem('gametour_user', JSON.stringify(user));
        location.reload();
    }
}

function logout() {
    localStorage.removeItem('gametour_user');
    window.location.href = '../index.html';
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', loadDashboard);