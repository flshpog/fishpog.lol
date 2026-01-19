const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 12;

// Hash password
async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}

// Compare password with hash
async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}

// Generate access token (short-lived)
function generateAccessToken(user) {
    return jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
}

// Generate refresh token (long-lived)
function generateRefreshToken(user) {
    return jwt.sign(
        { userId: user.id, type: 'refresh' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// Verify token
function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
}

module.exports = {
    hashPassword,
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
    verifyToken
};
