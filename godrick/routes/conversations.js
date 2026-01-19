const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');
const {
    createConversation,
    getUserConversations,
    getConversationWithMessages,
    updateConversationTitle,
    deleteConversation
} = require('../services/conversationService');

// All routes require authentication
router.use(authenticateToken);

// Get all conversations for user
router.get('/', (req, res) => {
    try {
        const conversations = getUserConversations(req.user.id);
        res.json({ conversations });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Create new conversation
router.post('/', (req, res) => {
    try {
        const { title } = req.body;
        const conversation = createConversation(req.user.id, title);
        res.json({ conversation });
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: 'Failed to create conversation' });
    }
});

// Get conversation with messages
router.get('/:id', (req, res) => {
    try {
        const conversation = getConversationWithMessages(
            parseInt(req.params.id),
            req.user.id
        );

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        res.json({ conversation });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ error: 'Failed to fetch conversation' });
    }
});

// Update conversation title
router.put('/:id', (req, res) => {
    try {
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title required' });
        }

        const conversation = updateConversationTitle(
            parseInt(req.params.id),
            req.user.id,
            title
        );

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        res.json({ conversation });
    } catch (error) {
        console.error('Error updating conversation:', error);
        res.status(500).json({ error: 'Failed to update conversation' });
    }
});

// Delete conversation
router.delete('/:id', (req, res) => {
    try {
        const deleted = deleteConversation(
            parseInt(req.params.id),
            req.user.id
        );

        if (!deleted) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({ error: 'Failed to delete conversation' });
    }
});

module.exports = router;
