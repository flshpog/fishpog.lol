// Authentication state management
class AuthManager {
    constructor() {
        this.accessToken = null;
        this.refreshToken = null;
        this.user = null;
        this.onAuthChange = null; // Callback when auth state changes

        this.checkUrlTokens();
        this.loadTokens();
    }

    // Check URL for OAuth tokens (from redirect)
    checkUrlTokens() {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');

        if (accessToken && refreshToken) {
            this.setTokens(accessToken, refreshToken);
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    // Load tokens from localStorage
    loadTokens() {
        const stored = localStorage.getItem('wright_auth');
        if (stored) {
            try {
                const { accessToken, refreshToken } = JSON.parse(stored);
                this.accessToken = accessToken;
                this.refreshToken = refreshToken;
                this.fetchUser();
            } catch (e) {
                this.clearTokens();
            }
        }
    }

    // Save tokens
    setTokens(accessToken, refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        localStorage.setItem('wright_auth', JSON.stringify({ accessToken, refreshToken }));
        this.fetchUser();
    }

    // Clear tokens
    clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;
        this.user = null;
        localStorage.removeItem('wright_auth');
        if (this.onAuthChange) this.onAuthChange(null);
    }

    // Fetch current user
    async fetchUser() {
        if (!this.accessToken) return;

        try {
            const response = await fetch(`${API_URL}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            });

            if (response.ok) {
                const data = await response.json();
                this.user = data.user;
                if (this.onAuthChange) this.onAuthChange(this.user);
            } else if (response.status === 403) {
                // Token expired, try refresh
                await this.refreshAccessToken();
            } else {
                this.clearTokens();
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    }

    // Refresh access token
    async refreshAccessToken() {
        if (!this.refreshToken) {
            this.clearTokens();
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                this.accessToken = data.accessToken;
                localStorage.setItem('wright_auth', JSON.stringify({
                    accessToken: this.accessToken,
                    refreshToken: this.refreshToken
                }));
                await this.fetchUser();
            } else {
                this.clearTokens();
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            this.clearTokens();
        }
    }

    // Register
    async register(email, password, displayName) {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, displayName })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        this.setTokens(data.accessToken, data.refreshToken);
        this.user = data.user;
        if (this.onAuthChange) this.onAuthChange(this.user);
        return data.user;
    }

    // Login
    async login(email, password) {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        this.setTokens(data.accessToken, data.refreshToken);
        this.user = data.user;
        if (this.onAuthChange) this.onAuthChange(this.user);
        return data.user;
    }

    // Logout
    logout() {
        this.clearTokens();
    }

    // OAuth login redirects
    loginWithGoogle() {
        window.location.href = `${API_URL}/api/auth/google`;
    }

    loginWithGithub() {
        window.location.href = `${API_URL}/api/auth/github`;
    }

    // Get auth header for API calls
    getAuthHeader() {
        if (!this.accessToken) return {};
        return { 'Authorization': `Bearer ${this.accessToken}` };
    }

    // Check if logged in
    isLoggedIn() {
        return !!this.user;
    }
}

// Global auth manager instance
const authManager = new AuthManager();
