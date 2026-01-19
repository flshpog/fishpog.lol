const { verifyToken } = require('../services/authService');
const { getUserById } = require('../services/userService');

// Middleware to verify JWT and attach user to request
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const user = getUserById(decoded.userId);
    if (!user) {
        return res.status(403).json({ error: 'User not found' });
    }

    req.user = user;
    next();
}

// Optional auth - doesn't fail if no token, just doesn't set user
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
            req.user = getUserById(decoded.userId);
        }
    }

    next();
}

module.exports = { authenticateToken, optionalAuth };
