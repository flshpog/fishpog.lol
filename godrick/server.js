const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// System prompt for Wright with chart generation and artifact capabilities
const SYSTEM_PROMPT = `You are Wright, a helpful AI assistant with the ability to generate charts, visualizations, HTML previews, and SVG images.

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

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        // Stream the response
        const stream = await anthropic.messages.stream({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4096,
            system: SYSTEM_PROMPT,
            messages: messages,
        });

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        stream.on('text', (text) => {
            res.write(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`);
        });

        stream.on('message', (message) => {
            res.write(`data: ${JSON.stringify({ type: 'done', message })}\n\n`);
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
