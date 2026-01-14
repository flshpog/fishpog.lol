const express = require('express');
const passport = require('passport');
const router = express.Router();

const { hashPassword, comparePassword, generateAccessToken, generateRefreshToken, verifyToken } = require('../services/authService');
const { createUser, getUserByEmail, emailExists, getUserById, updateUserPreferences, getUserPreferences } = require('../services/userService');
const { authenticateToken } = require('../middleware/auth');

// Register with email/password
router.post('/register', async (req, res) => {
    try {
        const { email, password, displayName } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        if (emailExists(email)) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const passwordHash = await hashPassword(password);
        const user = createUser(email, passwordHash, displayName || email.split('@')[0]);

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.json({
            user,
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login with email/password
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const user = getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (!user.password_hash) {
            return res.status(401).json({ error: 'Please login with your social account' });
        }

        const valid = await comparePassword(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Return user without password hash
        const { password_hash, ...safeUser } = user;

        res.json({
            user: safeUser,
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Refresh access token
router.post('/refresh', (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' });
        }

        const decoded = verifyToken(refreshToken);
        if (!decoded || decoded.type !== 'refresh') {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        const user = getUserById(decoded.userId);
        if (!user) {
            return res.status(403).json({ error: 'User not found' });
        }

        const accessToken = generateAccessToken(user);
        res.json({ accessToken });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ error: 'Token refresh failed' });
    }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// Get user preferences
router.get('/preferences', authenticateToken, (req, res) => {
    try {
        const preferences = getUserPreferences(req.user.id);
        res.json({ preferences });
    } catch (error) {
        console.error('Error getting preferences:', error);
        res.status(500).json({ error: 'Failed to get preferences' });
    }
});

// Update user preferences
router.put('/preferences', authenticateToken, (req, res) => {
    try {
        const { preferences } = req.body;
        if (!preferences || typeof preferences !== 'object') {
            return res.status(400).json({ error: 'Valid preferences object required' });
        }
        updateUserPreferences(req.user.id, preferences);
        res.json({ preferences });
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

// Google OAuth
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login?error=oauth_failed' }),
    (req, res) => {
        const accessToken = generateAccessToken(req.user);
        const refreshToken = generateRefreshToken(req.user);

        // Redirect to frontend with tokens
        const frontendUrl = process.env.FRONTEND_URL || '';
        res.redirect(`${frontendUrl}/godrick/?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    }
);

// GitHub OAuth
router.get('/github', passport.authenticate('github', {
    scope: ['user:email']
}));

router.get('/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/login?error=oauth_failed' }),
    (req, res) => {
        const accessToken = generateAccessToken(req.user);
        const refreshToken = generateRefreshToken(req.user);

        // Redirect to frontend with tokens
        const frontendUrl = process.env.FRONTEND_URL || '';
        res.redirect(`${frontendUrl}/godrick/?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    }
);

module.exports = router;
