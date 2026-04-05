// Authentication Management
let isLoggedIn = false;

function checkAuthStatus() {
    const user = localStorage.getItem('gametour_user');
    if (user) {
        isLoggedIn = true;
        const userData = JSON.parse(user);
        updateUIForLoggedInUser(userData);
    } else {
        isLoggedIn = false;
        updateUIForLoggedOutUser();
    }
}

function updateUIForLoggedInUser(userData) {
    const authBtn = document.getElementById('authBtn');
    const dashboardLink = document.getElementById('dashboardLink');
    
    if (authBtn) {
        authBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${userData.name}`;
        authBtn.href = "javascript:void(0)";
        authBtn.onclick = showUserMenu;
    }
    
    if (dashboardLink) {
        dashboardLink.style.display = 'block';
        dashboardLink.onclick = (e) => {
            e.preventDefault();
            window.location.href = 'pages/dashboard.html';
        };
    }
}

function updateUIForLoggedOutUser() {
    const authBtn = document.getElementById('authBtn');
    const dashboardLink = document.getElementById('dashboardLink');
    
    if (authBtn) {
        authBtn.innerHTML = 'Login / Sign Up';
        authBtn.href = "javascript:void(0)";
        authBtn.onclick = showLoginModal;
    }
    
    if (dashboardLink) {
        dashboardLink.style.display = 'none';
    }
}

function showLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Welcome to GameTour</h2>
            <form id="loginForm">
                <input type="email" id="loginEmail" placeholder="Email Address" required>
                <input type="password" id="loginPassword" placeholder="Password" required>
                <select id="loginRole">
                    <option value="organizer">Organizer</option>
                    <option value="player">Player</option>
                    <option value="fan">Fan / Viewer</option>
                </select>
                <button type="submit">Login / Sign Up</button>
            </form>
            <p>Demo: Use any email/password to continue</p>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.querySelector('.close').onclick = () => modal.remove();
    
    modal.querySelector('#loginForm').onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const role = document.getElementById('loginRole').value;
        const name = email.split('@')[0];
        
        const userData = {
            id: Date.now(),
            name: name,
            email: email,
            role: role,
            avatar: name.charAt(0).toUpperCase(),
            registeredTournaments: [],
            createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('gametour_user', JSON.stringify(userData));
        modal.remove();
        window.location.reload();
    };
}

function showUserMenu() {
    const user = JSON.parse(localStorage.getItem('gametour_user'));
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2><i class="fas fa-user-circle"></i> ${user.name}</h2>
            <p>Role: ${user.role}</p>
            <p>Email: ${user.email}</p>
            <hr style="margin: 1rem 0;">
            <button onclick="window.location.href='pages/dashboard.html'">My Dashboard</button>
            <button onclick="window.location.href='pages/profile.html'" style="margin-top: 0.5rem;">Profile Settings</button>
            <button onclick="logout()" style="margin-top: 1rem; background: #ef4444;">Logout</button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.close').onclick = () => modal.remove();
}

function logout() {
    localStorage.removeItem('gametour_user');
    window.location.href = 'index.html';
}