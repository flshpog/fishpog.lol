const { db } = require('../db/database');

// Create user with email/password
function createUser(email, passwordHash, displayName) {
    const stmt = db.prepare(`
        INSERT INTO users (email, password_hash, display_name, auth_provider)
        VALUES (?, ?, ?, 'local')
    `);
    const result = stmt.run(email, passwordHash, displayName);
    return getUserById(result.lastInsertRowid);
}

// Create or get OAuth user
function findOrCreateOAuthUser(provider, oauthId, email, displayName, avatarUrl) {
    // First try to find by OAuth provider and ID
    let user = db.prepare(`
        SELECT * FROM users WHERE auth_provider = ? AND oauth_id = ?
    `).get(provider, oauthId);

    if (user) return user;

    // Try to find by email and link accounts
    if (email) {
        user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
        if (user) {
            // Update existing user with OAuth info
            db.prepare(`
                UPDATE users SET auth_provider = ?, oauth_id = ?, avatar_url = COALESCE(avatar_url, ?)
                WHERE id = ?
            `).run(provider, oauthId, avatarUrl, user.id);
            return getUserById(user.id);
        }
    }

    // Create new OAuth user
    const stmt = db.prepare(`
        INSERT INTO users (email, display_name, avatar_url, auth_provider, oauth_id)
        VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(email, displayName, avatarUrl, provider, oauthId);
    return getUserById(result.lastInsertRowid);
}

// Get user by ID
function getUserById(id) {
    return db.prepare(`
        SELECT id, email, display_name, avatar_url, auth_provider, created_at
        FROM users WHERE id = ?
    `).get(id);
}

// Get user by email (includes password hash for auth)
function getUserByEmail(email) {
    return db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
}

// Check if email exists
function emailExists(email) {
    const result = db.prepare(`SELECT 1 FROM users WHERE email = ?`).get(email);
    return !!result;
}

module.exports = {
    createUser,
    findOrCreateOAuthUser,
    getUserById,
    getUserByEmail,
    emailExists
};
