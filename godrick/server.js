// ============================================================================
// WRIGHT CHATBOT - BACKEND SERVER (server.js)
// ============================================================================
// This is the main entry point for the backend. It handles:
//   1. Receiving messages from the frontend
//   2. Sending those messages to the Anthropic Claude API
//   3. Streaming responses back to the frontend in real-time
//   4. Saving conversations to the database (for logged-in users)
// ============================================================================

// --- DEPENDENCIES ---
// Express: Web framework for handling HTTP requests
const express = require('express');
// CORS: Allows frontend (different domain) to talk to backend
const cors = require('cors');
// Session: Stores temporary data during OAuth login flow
const session = require('express-session');
// Passport: Handles Google/GitHub OAuth authentication
const passport = require('passport');
// Helmet: Adds security headers to protect against common attacks
const helmet = require('helmet');
// Rate Limit: Prevents spam/abuse by limiting requests per IP
const rateLimit = require('express-rate-limit');
// Anthropic SDK: Official library to communicate with Claude AI
const Anthropic = require('@anthropic-ai/sdk');
// Dotenv: Loads secret keys from .env file
require('dotenv').config();

// --- DATABASE SETUP ---
// Initialize SQLite database with users, conversations, and messages tables
const { initializeDatabase } = require('./db/database');
initializeDatabase();

// --- AUTHENTICATION SETUP ---
// Configure OAuth strategies for Google and GitHub login
const { configurePassport } = require('./config/passport');
configurePassport();

// --- ROUTE IMPORTS ---
// authRoutes: Login, signup, OAuth callbacks (/api/auth/*)
const authRoutes = require('./routes/auth');
// conversationRoutes: Load/save conversation history (/api/conversations/*)
const conversationRoutes = require('./routes/conversations');

// --- SERVICE IMPORTS ---
// Middleware to check if user is logged in (optional - allows anonymous chat)
const { optionalAuth } = require('./middleware/auth');
// Database operations for saving chat history
const { createConversation, addMessage, autoGenerateTitle, getConversationById } = require('./services/conversationService');

// --- CREATE EXPRESS APP ---
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================
// Middleware = functions that run on every request before reaching endpoints

// Security middleware - adds HTTP headers to prevent common attacks
app.use(helmet({
    contentSecurityPolicy: false // Disabled so streaming (SSE) works properly
}));

// Rate limiting - prevents abuse by limiting login attempts
// If someone tries to login more than 20 times in 15 minutes, they're blocked
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minute window
    max: 20,                   // max 20 requests per window
    message: { error: 'Too many requests, please try again later' }
});

// CORS - allows the frontend (hosted on GitHub Pages) to make requests to this backend
// Without this, browsers would block requests from a different domain
app.use(cors({
    origin: process.env.FRONTEND_URL || true,  // Allow frontend URL from .env
    credentials: true                           // Allow cookies/auth headers
}));

// Parse JSON request bodies (converts JSON strings to JavaScript objects)
app.use(express.json());

// Session middleware - temporarily stores data during OAuth flow
// When user clicks "Login with Google", we need to remember who they are
// between the redirect to Google and the callback
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
        maxAge: 10 * 60 * 1000  // 10 minutes - just enough for OAuth flow
    }
}));

// Initialize Passport.js for OAuth authentication
app.use(passport.initialize());
app.use(passport.session());

// ============================================================================
// ANTHROPIC AI CLIENT
// ============================================================================
// This is what connects us to Claude AI - the brain of the chatbot
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,  // API key from .env file
});

// ============================================================================
// SYSTEM PROMPT - This is the "personality" and instructions for the AI
// ============================================================================
// The system prompt tells Claude HOW to behave and WHAT special formats to use.
// This is what makes Wright different from generic Claude - it teaches the AI
// to output special code blocks that our frontend knows how to render as:
//   - Charts (using Chart.js library)
//   - HTML previews (rendered in iframes)
//   - SVG images (vector graphics)
const SYSTEM_PROMPT = `You are Wright, a helpful AI assistant
When responding to user requests, you can create the following special artifacts:

charts,
visualizations
HTML previews
SVG images

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

// ============================================================================
// API ROUTES
// ============================================================================
// Routes define what URLs the server responds to

// Authentication routes at /api/auth/* (login, signup, OAuth)
// authLimiter applied here to prevent brute-force login attacks
app.use('/api/auth', authLimiter, authRoutes);

// Conversation history routes at /api/conversations/*
app.use('/api/conversations', conversationRoutes);

// ============================================================================
// MAIN CHAT ENDPOINT - THE HEART OF THE CHATBOT
// ============================================================================
// This is where the magic happens! When user sends a message:
//   1. Frontend POSTs to /api/chat with the conversation history
//   2. We forward that to Claude AI
//   3. Claude streams back a response word-by-word
//   4. We forward each chunk to the frontend in real-time (SSE)
//   5. If user is logged in, we save the conversation to the database
app.post('/api/chat', optionalAuth, async (req, res) => {
    try {
        // --- STEP 1: Extract data from the request ---
        const { messages, conversationId } = req.body;
        // messages = array of {role: 'user'|'assistant', content: '...'}
        // conversationId = optional ID if continuing an existing conversation

        // Validate input
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        let actualConversationId = conversationId;
        // Get the last message the user sent (the new one)
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();

        // --- STEP 2: Save to database (only if user is logged in) ---
        if (req.user && lastUserMessage) {
            // If this is a new conversation, create one in the database
            if (!actualConversationId) {
                const conversation = createConversation(req.user.id);
                actualConversationId = conversation.id;
                // Use first message to auto-generate a title (e.g., "Help with JavaScript")
                autoGenerateTitle(actualConversationId, req.user.id, lastUserMessage.content);
            }

            // Save the user's message to the database
            addMessage(actualConversationId, req.user.id, 'user', lastUserMessage.content);
        }

        // --- STEP 3: Send messages to Claude AI and get streaming response ---
        // anthropic.messages.stream() returns responses word-by-word as they're generated
        const stream = await anthropic.messages.stream({
            model: 'claude-sonnet-4-20250514',  // Which Claude model to use
            max_tokens: 4096,                   // Maximum response length
            system: SYSTEM_PROMPT,              // The personality/instructions defined above
            messages: messages,                 // The full conversation history
        });

        // --- STEP 4: Set up Server-Sent Events (SSE) for real-time streaming ---
        // SSE allows server to push data to the client as it becomes available
        res.setHeader('Content-Type', 'text/event-stream');  // Tell browser this is SSE
        res.setHeader('Cache-Control', 'no-cache');          // Don't cache the response
        res.setHeader('Connection', 'keep-alive');           // Keep connection open

        let fullResponse = '';  // Accumulate the complete response

        // --- STEP 5: Handle streaming events ---
        // 'text' event fires every time we receive a new chunk of text
        stream.on('text', (text) => {
            fullResponse += text;  // Add to our accumulated response
            // Send chunk to frontend in SSE format: "data: {...}\n\n"
            res.write(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`);
        });

        // 'message' event fires when the response is complete
        stream.on('message', (message) => {
            // Save the AI's response to database if user is logged in
            if (req.user && actualConversationId) {
                addMessage(actualConversationId, req.user.id, 'assistant', fullResponse);
            }

            // Send completion signal to frontend
            res.write(`data: ${JSON.stringify({
                type: 'done',
                message,
                conversationId: actualConversationId  // Send back conversation ID for future messages
            })}\n\n`);
            res.end();  // Close the connection
        });

        // 'error' event fires if something goes wrong with the AI request
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

// ============================================================================
// START THE SERVER
// ============================================================================
app.listen(PORT, () => {
    console.log(`Wright server running on http://localhost:${PORT}`);
});
