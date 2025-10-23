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

// System prompt for Godrick with chart generation capabilities
const SYSTEM_PROMPT = `You are Godrick, a helpful AI assistant with the ability to generate charts and visualizations.

When a user asks you to create a chart or graph, you should:
1. Generate the data in a structured JSON format
2. Wrap the JSON in a special code block with the language identifier "chart-data"

Example:
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

For each chart type, structure the data appropriately for Chart.js format.`;

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
    console.log(`Godrick server running on http://localhost:${PORT}`);
});
