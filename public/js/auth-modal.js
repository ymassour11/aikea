// Auth Modal UI and Logic
// Handles login, signup, and Google OAuth modals

// Create and inject auth modal HTML into the page
function createAuthModal() {
    const modalHTML = `
    <div id="authModal" class="auth-modal-overlay">
        <div class="auth-modal">
            <button class="auth-modal-close" onclick="closeAuthModal()">&times;</button>

            <!-- Login Form -->
            <div id="loginForm" class="auth-form active">
                <h2>Welcome Back</h2>
                <p class="auth-subtitle">Sign in to your Dikoora account</p>

                <button type="button" class="google-btn" onclick="handleGoogleSignIn()">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                </button>

                <div class="auth-divider">
                    <span>or</span>
                </div>

                <form onsubmit="handleEmailSignIn(event)">
                    <div class="auth-input-group">
                        <label for="loginEmail">Email</label>
                        <input type="email" id="loginEmail" placeholder="Enter your email" required>
                    </div>
                    <div class="auth-input-group">
                        <label for="loginPassword">Password</label>
                        <input type="password" id="loginPassword" placeholder="Enter your password" required>
                    </div>
                    <button type="button" class="forgot-password-link" onclick="showForgotPassword()">Forgot password?</button>
                    <button type="submit" class="auth-submit-btn">Sign In</button>
                </form>

                <p class="auth-switch">
                    Don't have an account? <button type="button" onclick="showSignupForm()">Sign up</button>
                </p>
            </div>

            <!-- Signup Form -->
            <div id="signupForm" class="auth-form">
                <h2>Create Account</h2>
                <p class="auth-subtitle">Start designing your perfect space</p>

                <button type="button" class="google-btn" onclick="handleGoogleSignIn()">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                </button>

                <div class="auth-divider">
                    <span>or</span>
                </div>

                <form onsubmit="handleEmailSignUp(event)">
                    <div class="auth-input-group">
                        <label for="signupName">Full Name</label>
                        <input type="text" id="signupName" placeholder="Enter your name" required>
                    </div>
                    <div class="auth-input-group">
                        <label for="signupEmail">Email</label>
                        <input type="email" id="signupEmail" placeholder="Enter your email" required>
                    </div>
                    <div class="auth-input-group">
                        <label for="signupPassword">Password</label>
                        <input type="password" id="signupPassword" placeholder="Create a password (min 6 chars)" minlength="6" required>
                    </div>
                    <button type="submit" class="auth-submit-btn">Create Account</button>
                </form>

                <p class="auth-switch">
                    Already have an account? <button type="button" onclick="showLoginForm()">Sign in</button>
                </p>
            </div>

            <!-- Forgot Password Form -->
            <div id="forgotPasswordForm" class="auth-form">
                <h2>Reset Password</h2>
                <p class="auth-subtitle">Enter your email to receive a reset link</p>

                <form onsubmit="handlePasswordReset(event)">
                    <div class="auth-input-group">
                        <label for="resetEmail">Email</label>
                        <input type="email" id="resetEmail" placeholder="Enter your email" required>
                    </div>
                    <button type="submit" class="auth-submit-btn">Send Reset Link</button>
                </form>

                <p class="auth-switch">
                    <button type="button" onclick="showLoginForm()">Back to Sign In</button>
                </p>
            </div>

            <!-- Error/Success Messages -->
            <div id="authMessage" class="auth-message"></div>
        </div>
    </div>
    `;

    // Inject modal into body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Inject auth modal styles
function injectAuthStyles() {
    const styles = `
    <style id="authModalStyles">
        .auth-modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            z-index: 10000;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .auth-modal-overlay.active {
            display: flex;
        }

        .auth-modal {
            background: white;
            border-radius: 16px;
            padding: 40px;
            max-width: 420px;
            width: 100%;
            position: relative;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            animation: modalSlideIn 0.3s ease;
        }

        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .auth-modal-close {
            position: absolute;
            top: 16px;
            right: 16px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #9ca3af;
            transition: color 0.2s;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
        }

        .auth-modal-close:hover {
            color: #374151;
            background: #f3f4f6;
        }

        .auth-form {
            display: none;
        }

        .auth-form.active {
            display: block;
        }

        .auth-form h2 {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            margin: 0 0 8px 0;
            text-align: center;
        }

        .auth-subtitle {
            color: #6b7280;
            text-align: center;
            margin: 0 0 24px 0;
            font-size: 14px;
        }

        .google-btn {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 12px 16px;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            background: white;
            font-size: 15px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            color: #374151;
        }

        .google-btn:hover {
            background: #f9fafb;
            border-color: #d1d5db;
        }

        .auth-divider {
            display: flex;
            align-items: center;
            margin: 24px 0;
        }

        .auth-divider::before,
        .auth-divider::after {
            content: '';
            flex: 1;
            height: 1px;
            background: #e5e7eb;
        }

        .auth-divider span {
            padding: 0 16px;
            color: #9ca3af;
            font-size: 13px;
        }

        .auth-input-group {
            margin-bottom: 16px;
        }

        .auth-input-group label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 6px;
        }

        .auth-input-group input {
            width: 100%;
            padding: 12px 14px;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            font-size: 15px;
            transition: all 0.2s;
            box-sizing: border-box;
        }

        .auth-input-group input:focus {
            outline: none;
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .forgot-password-link {
            background: none;
            border: none;
            color: #2563eb;
            font-size: 13px;
            cursor: pointer;
            padding: 0;
            margin-bottom: 20px;
            display: block;
        }

        .forgot-password-link:hover {
            text-decoration: underline;
        }

        .auth-submit-btn {
            width: 100%;
            padding: 14px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .auth-submit-btn:hover {
            background: #1d4ed8;
        }

        .auth-submit-btn:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }

        .auth-switch {
            text-align: center;
            margin-top: 24px;
            color: #6b7280;
            font-size: 14px;
        }

        .auth-switch button {
            background: none;
            border: none;
            color: #2563eb;
            font-weight: 600;
            cursor: pointer;
            padding: 0;
        }

        .auth-switch button:hover {
            text-decoration: underline;
        }

        .auth-message {
            margin-top: 16px;
            padding: 12px;
            border-radius: 8px;
            font-size: 14px;
            text-align: center;
            display: none;
        }

        .auth-message.error {
            display: block;
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
        }

        .auth-message.success {
            display: block;
            background: #f0fdf4;
            color: #16a34a;
            border: 1px solid #bbf7d0;
        }

        /* User Menu (logged in state) */
        .user-menu {
            position: relative;
        }

        .user-avatar-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border: 1px solid #e5e7eb;
            border-radius: 50px;
            background: white;
            cursor: pointer;
            transition: all 0.2s;
        }

        .user-avatar-btn:hover {
            border-color: #d1d5db;
            background: #f9fafb;
        }

        .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #2563eb;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
        }

        .user-avatar img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
        }

        .user-menu-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 8px;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            min-width: 200px;
            display: none;
            z-index: 1000;
            overflow: hidden;
        }

        .user-menu-dropdown.active {
            display: block;
        }

        .user-menu-header {
            padding: 16px;
            border-bottom: 1px solid #e5e7eb;
        }

        .user-menu-header .user-name {
            font-weight: 600;
            color: #111827;
        }

        .user-menu-header .user-email {
            font-size: 13px;
            color: #6b7280;
            margin-top: 2px;
        }

        .user-menu-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            color: #374151;
            text-decoration: none;
            transition: background 0.2s;
            cursor: pointer;
            border: none;
            background: none;
            width: 100%;
            text-align: left;
            font-size: 14px;
        }

        .user-menu-item:hover {
            background: #f9fafb;
        }

        .user-menu-item.logout {
            color: #dc2626;
            border-top: 1px solid #e5e7eb;
        }

        @media (max-width: 480px) {
            .auth-modal {
                padding: 24px;
            }
        }
    </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
}

// Modal Control Functions
function openAuthModal(mode = 'login') {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.add('active');
        if (mode === 'signup') {
            showSignupForm();
        } else {
            showLoginForm();
        }
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('active');
        clearAuthMessage();
    }
}

function showLoginForm() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('signupForm').classList.remove('active');
    document.getElementById('forgotPasswordForm').classList.remove('active');
    clearAuthMessage();
}

function showSignupForm() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('signupForm').classList.add('active');
    document.getElementById('forgotPasswordForm').classList.remove('active');
    clearAuthMessage();
}

function showForgotPassword() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('signupForm').classList.remove('active');
    document.getElementById('forgotPasswordForm').classList.add('active');
    clearAuthMessage();
}

function showAuthMessage(message, type = 'error') {
    const msgEl = document.getElementById('authMessage');
    if (msgEl) {
        msgEl.textContent = message;
        msgEl.className = 'auth-message ' + type;
    }
}

function clearAuthMessage() {
    const msgEl = document.getElementById('authMessage');
    if (msgEl) {
        msgEl.className = 'auth-message';
        msgEl.textContent = '';
    }
}

// Auth Event Handlers
async function handleEmailSignIn(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const submitBtn = event.target.querySelector('.auth-submit-btn');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    try {
        const { data, error } = await signInWithEmail(email, password);

        if (error) {
            showAuthMessage(error.message);
        } else {
            showAuthMessage('Signed in successfully!', 'success');
            setTimeout(() => {
                closeAuthModal();
                updateAuthUI();
                // If on home page, redirect to design page
                if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
                    window.location.href = 'design.html';
                }
            }, 1000);
        }
    } catch (err) {
        showAuthMessage('An error occurred. Please try again.');
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign In';
}

async function handleEmailSignUp(event) {
    event.preventDefault();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const submitBtn = event.target.querySelector('.auth-submit-btn');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
        const { data, error } = await signUpWithEmail(email, password, name);

        if (error) {
            showAuthMessage(error.message);
        } else if (data.user && !data.session) {
            // Email confirmation required - user exists but no session
            showAuthMessage('Please check your email to confirm your account!', 'success');
            // Don't redirect - user needs to confirm email first
        } else if (data.session) {
            // Logged in immediately (email confirmation disabled)
            showAuthMessage('Account created!', 'success');
            setTimeout(() => {
                closeAuthModal();
                updateAuthUI();
                // Only redirect to design page if on home page
                if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
                    window.location.href = 'design.html';
                }
            }, 1000);
        } else {
            showAuthMessage('Account created! Please check your email to confirm.', 'success');
        }
    } catch (err) {
        showAuthMessage('An error occurred. Please try again.');
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
}

async function handleGoogleSignIn() {
    try {
        const { data, error } = await signInWithGoogle();

        if (error) {
            showAuthMessage(error.message);
        }
        // Google OAuth will redirect, so no need to handle success here
    } catch (err) {
        showAuthMessage('An error occurred with Google sign in.');
    }
}

async function handlePasswordReset(event) {
    event.preventDefault();

    const email = document.getElementById('resetEmail').value;
    const submitBtn = event.target.querySelector('.auth-submit-btn');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
        const { data, error } = await resetPassword(email);

        if (error) {
            showAuthMessage(error.message);
        } else {
            showAuthMessage('Reset link sent! Check your email.', 'success');
        }
    } catch (err) {
        showAuthMessage('An error occurred. Please try again.');
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Reset Link';
}

async function handleSignOut() {
    try {
        const { error } = await signOut();
        if (!error) {
            updateAuthUI();
            closeUserMenu();
            // Redirect to home page after sign out
            window.location.href = 'index.html';
        }
    } catch (err) {
        console.error('Sign out error:', err);
    }
}

// User Menu Functions
function toggleUserMenu() {
    const dropdown = document.querySelector('.user-menu-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

function closeUserMenu() {
    const dropdown = document.querySelector('.user-menu-dropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
}

// Update UI based on auth state
async function updateAuthUI() {
    const user = await getUser();
    const navButtons = document.querySelector('.nav-buttons');
    const navLinks = document.querySelector('.nav-links');

    if (!navButtons) return;

    if (user) {
        // User is logged in - show user menu
        const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        const initials = displayName.charAt(0).toUpperCase();
        const avatarUrl = user.user_metadata?.avatar_url;

        // Update navigation links to include Create and My Designs links when logged in
        if (navLinks) {
            const currentPath = window.location.pathname;
            const isDesignPage = currentPath.includes('design.html');
            const isProfileDesigns = currentPath.includes('profile.html') && window.location.hash === '#designs';

            navLinks.innerHTML = `
                <li><a href="index.html" ${currentPath.includes('index.html') || currentPath === '/' ? 'class="active"' : ''}>Home</a></li>
                <li><a href="design.html" ${isDesignPage ? 'class="active"' : ''}>Create</a></li>
                <li><a href="profile.html#designs" ${currentPath.includes('profile.html') ? 'class="active"' : ''}>My Designs</a></li>
                <li><a href="features.html" ${currentPath.includes('features.html') ? 'class="active"' : ''}>Features</a></li>
                <li><a href="pricing.html" ${currentPath.includes('pricing.html') ? 'class="active"' : ''}>Pricing</a></li>
            `;
        }

        navButtons.innerHTML = `
            <div class="user-menu">
                <button class="user-avatar-btn" onclick="toggleUserMenu()">
                    <div class="user-avatar">
                        ${avatarUrl ? `<img src="${avatarUrl}" alt="${displayName}">` : initials}
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 9l6 6 6-6"/>
                    </svg>
                </button>
                <div class="user-menu-dropdown">
                    <div class="user-menu-header">
                        <div class="user-name">${displayName}</div>
                        <div class="user-email">${user.email}</div>
                    </div>
                    <a href="profile.html" class="user-menu-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        My Profile
                    </a>
                    <a href="profile.html#designs" class="user-menu-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        My Designs
                    </a>
                    <button class="user-menu-item logout" onclick="handleSignOut()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Sign Out
                    </button>
                </div>
            </div>
        `;
    } else {
        // User is not logged in - show login/signup buttons
        navButtons.innerHTML = `
            <button class="btn-login" onclick="openAuthModal('login')">Log in</button>
            <button class="btn-signup" onclick="openAuthModal('signup')">Get Started</button>
        `;
    }
}

// Close user menu when clicking outside
document.addEventListener('click', (e) => {
    const userMenu = document.querySelector('.user-menu');
    if (userMenu && !userMenu.contains(e.target)) {
        closeUserMenu();
    }
});

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('authModal');
    if (modal && e.target === modal) {
        closeAuthModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAuthModal();
        closeUserMenu();
    }
});

// Initialize auth modal when DOM is ready
async function initAuthModal() {
    injectAuthStyles();
    createAuthModal();

    // Initialize Supabase and wait for session to be established
    if (typeof initSupabase === 'function') {
        await initSupabase();
    }

    // Update UI based on current auth state (after session is ready)
    await updateAuthUI();

    // Check for login URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'true') {
        setTimeout(() => openAuthModal('login'), 100);
    }

    // Listen for auth state changes
    if (typeof onAuthStateChange === 'function') {
        onAuthStateChange((event, session) => {
            updateAuthUI();

            // Check for pending plan after successful login
            if (event === 'SIGNED_IN' && session) {
                checkPendingPlan();
            }
        });
    }
}

// Check if there's a pending plan to checkout
function checkPendingPlan() {
    const pendingPlan = localStorage.getItem('pendingPlan');
    if (pendingPlan) {
        try {
            const plan = JSON.parse(pendingPlan);
            localStorage.removeItem('pendingPlan');
            // Redirect to checkout with the saved plan
            window.location.href = `checkout.html?plan=${plan.plan}&price=${plan.price}&billing=${plan.billing}`;
        } catch (e) {
            localStorage.removeItem('pendingPlan');
        }
    }
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthModal);
} else {
    initAuthModal();
}
