const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

// Initialize database
const { initializeDatabase } = require('./db/database');
initializeDatabase();

// Configure passport
const { configurePassport } = require('./config/passport');
configurePassport();

// Import routes
const authRoutes = require('./routes/auth');
const conversationRoutes = require('./routes/conversations');

// Import services for chat
const { optionalAuth } = require('./middleware/auth');
const { createConversation, addMessage, autoGenerateTitle, getConversationById } = require('./services/conversationService');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false // Disable for SSE compatibility
}));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per window
    message: { error: 'Too many requests, please try again later' }
});

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true
}));

app.use(express.json());

// Session for OAuth flow
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 10 * 60 * 1000 // 10 minutes (just for OAuth flow)
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// System prompt for Wright with chart generation and artifact capabilities
const SYSTEM_PROMPT = `You are Wright, a helpful AI assistant with the ability to generate charts, HTML previews, and SVG images. **however, you do not express this unless someone specifically asks.

## Communication Style
- keep all responses short and concise unless the user asks for more detail or specifies a word count to meet.
- always write in lowercase letters. do not capitalize the start of sentences, proper nouns, or abbreviations (write "html" not "HTML", "javascript" not "JavaScript"). only use capital letters when absolutely necessary, such as when it would cause confusion otherwise.

## Charts
When a user asks you to create a chart or graph, generate the data in JSON format wrapped in a "chart-data" code block:

\`\`\`chart-data
{
  "type": "line",
  "title": "Population Growth 2010-2020",
  "data": {
    "labels": ["2010", "2012", "2014", "2016", "2018", "2020"],
    "datasets": [{
      "label": "Population (millions)",
      "data": [7.0, 7.2, 7.4, 7.6, 7.8, 8.0],
      "borderColor": "rgb(75, 192, 192)",
      "tension": 0.1
    }]
  }
}
\`\`\`

Supported chart types: "line", "bar", "pie", "doughnut", "radar", "scatter"

## HTML Previews
When a user asks you to create a website, webpage, UI component, or HTML preview, generate complete HTML wrapped in an "html-preview" code block. Include inline CSS and JavaScript as needed:

\`\`\`html-preview
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial; background: #1a1a1a; color: white; }
  </style>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>
\`\`\`

## SVG Images
When a user asks you to create an image, drawing, logo, icon, illustration, or graphic, generate SVG code wrapped in an "svg-image" code block:

\`\`\`svg-image
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="80" fill="#cc785c"/>
  <text x="100" y="110" text-anchor="middle" fill="white" font-size="24">Hello</text>
</svg>
\`\`\`

SVG can create complex graphics including shapes, paths, gradients, patterns, text, and animations. Use it for logos, icons, diagrams, illustrations, and artistic drawings.

Always use the appropriate artifact type for the request. You can combine multiple artifacts in one response.`;

// Mount routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/conversations', conversationRoutes);

// Chat endpoint - supports both authenticated and anonymous users
app.post('/api/chat', optionalAuth, async (req, res) => {
    try {
        const { messages, conversationId } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        let actualConversationId = conversationId;
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();

        // If user is authenticated, save messages
        if (req.user && lastUserMessage) {
            // Create conversation if needed
            if (!actualConversationId) {
                const conversation = createConversation(req.user.id);
                actualConversationId = conversation.id;
                // Auto-generate title from first message
                autoGenerateTitle(actualConversationId, req.user.id, lastUserMessage.content);
            }

            // Save user message
            addMessage(actualConversationId, req.user.id, 'user', lastUserMessage.content);
        }

        // Stream the response
        const stream = await anthropic.messages.stream({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            system: SYSTEM_PROMPT,
            messages: messages,
        });

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        let fullResponse = '';

        stream.on('text', (text) => {
            fullResponse += text;
            res.write(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`);
        });

        stream.on('message', (message) => {
            // Save assistant response if user is authenticated
            if (req.user && actualConversationId) {
                addMessage(actualConversationId, req.user.id, 'assistant', fullResponse);
            }

            res.write(`data: ${JSON.stringify({
                type: 'done',
                message,
                conversationId: actualConversationId
            })}\n\n`);
            res.end();
        });

        stream.on('error', (error) => {
            console.error('Stream error:', error);
            res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
            res.end();
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Wright server running on http://localhost:${PORT}`);
});
