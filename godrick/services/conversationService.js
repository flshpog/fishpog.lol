const { db } = require('../db/database');

// Create new conversation
function createConversation(userId, title = 'New conversation') {
    const stmt = db.prepare(`
        INSERT INTO conversations (user_id, title)
        VALUES (?, ?)
    `);
    const result = stmt.run(userId, title);
    return getConversationById(result.lastInsertRowid, userId);
}

// Get conversation by ID (with ownership check)
function getConversationById(conversationId, userId) {
    return db.prepare(`
        SELECT * FROM conversations WHERE id = ? AND user_id = ?
    `).get(conversationId, userId);
}

// Get all conversations for user
function getUserConversations(userId) {
    return db.prepare(`
        SELECT id, title, created_at, updated_at
        FROM conversations
        WHERE user_id = ?
        ORDER BY updated_at DESC
    `).all(userId);
}

// Get conversation with messages
function getConversationWithMessages(conversationId, userId) {
    const conversation = getConversationById(conversationId, userId);
    if (!conversation) return null;

    const messages = db.prepare(`
        SELECT id, role, content, created_at
        FROM messages
        WHERE conversation_id = ?
        ORDER BY created_at ASC
    `).all(conversationId);

    return { ...conversation, messages };
}

// Update conversation title
function updateConversationTitle(conversationId, userId, title) {
    const stmt = db.prepare(`
        UPDATE conversations
        SET title = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
    `);
    stmt.run(title, conversationId, userId);
    return getConversationById(conversationId, userId);
}

// Delete conversation
function deleteConversation(conversationId, userId) {
    const stmt = db.prepare(`
        DELETE FROM conversations WHERE id = ? AND user_id = ?
    `);
    const result = stmt.run(conversationId, userId);
    return result.changes > 0;
}

// Add message to conversation
function addMessage(conversationId, userId, role, content) {
    // Verify ownership
    const conversation = getConversationById(conversationId, userId);
    if (!conversation) return null;

    const stmt = db.prepare(`
        INSERT INTO messages (conversation_id, role, content)
        VALUES (?, ?, ?)
    `);
    const result = stmt.run(conversationId, role, content);

    // Update conversation timestamp
    db.prepare(`
        UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(conversationId);

    return {
        id: result.lastInsertRowid,
        conversation_id: conversationId,
        role,
        content
    };
}

// Auto-generate title from first user message
function autoGenerateTitle(conversationId, userId, firstMessage) {
    // Truncate to first 50 chars
    const title = firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : '');
    return updateConversationTitle(conversationId, userId, title);
}

module.exports = {
    createConversation,
    getConversationById,
    getUserConversations,
    getConversationWithMessages,
    updateConversationTitle,
    deleteConversation,
    addMessage,
    autoGenerateTitle
};
