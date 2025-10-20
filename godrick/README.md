# Godrick AI Chatbot

An AI chatbot with a Claude.ai-inspired UI and intelligent chart generation capabilities. Godrick can understand requests for data visualizations and automatically generate beautiful charts using Chart.js.

## Features

- **Claude.ai-inspired UI**: Clean, modern interface with dark theme
- **Real-time streaming**: Messages stream in real-time for a responsive experience
- **Smart Chart Generation**: Automatically detects and renders charts when Godrick generates visualization data
- **Multiple Chart Types**: Supports line, bar, pie, doughnut, radar, and scatter charts
- **Markdown Support**: Full markdown rendering for rich text formatting
- **Conversation History**: Maintains chat context throughout the conversation

## Prerequisites

- Node.js (v14 or higher)
- An Anthropic API key (get one at https://console.anthropic.com/)

## Installation

1. Clone this repository or download the files

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Add your Anthropic API key to the `.env` file:
```
ANTHROPIC_API_KEY=your_actual_api_key_here
PORT=3000
```

## Running the Application

Start the server:
```bash
npm start
```

Then open your browser and navigate to:
```
http://localhost:3000
```

## How Chart Generation Works

Godrick has been trained to generate chart data in a special format. When you ask for a visualization, it will:

1. Generate structured JSON data in a `chart-data` code block
2. The frontend automatically detects these blocks
3. Chart.js renders the visualization
4. The chart appears in place of the raw JSON

### Example Prompts

Try these prompts to see chart generation in action:

- "Generate a line chart showing temperature trends from Monday to Friday"
- "Create a bar chart comparing sales across different regions"
- "Show me a pie chart of market share distribution"
- "Make a radar chart for performance metrics across 5 categories"

### Chart Data Format

Godrick generates charts using this JSON structure:

```json
{
  "type": "line",
  "title": "Chart Title",
  "data": {
    "labels": ["Jan", "Feb", "Mar"],
    "datasets": [{
      "label": "Dataset 1",
      "data": [10, 20, 30],
      "borderColor": "rgb(75, 192, 192)"
    }]
  }
}
```

Supported chart types:
- `line` - Line charts for trends over time
- `bar` - Bar charts for comparisons
- `pie` - Pie charts for proportions
- `doughnut` - Doughnut charts (hollow pie)
- `radar` - Radar charts for multivariate data
- `scatter` - Scatter plots for correlations

## Project Structure

```
godrick/
├── server.js              # Express server & Anthropic API integration
├── public/
│   ├── index.html        # Main HTML file
│   ├── css/
│   │   └── styles.css    # Claude.ai-inspired styling
│   └── js/
│       └── app.js        # Frontend logic & chart rendering
├── package.json
├── .env.example
└── README.md
```

## Technologies Used

- **Backend**: Node.js, Express
- **AI**: Anthropic Claude API (Claude 3.5 Sonnet)
- **Frontend**: Vanilla JavaScript, Chart.js
- **Markdown**: Marked.js
- **Styling**: Custom CSS with CSS variables for theming

## Customization

### Changing the Theme

Edit the CSS variables in `public/css/styles.css`:

```css
:root {
    --bg-primary: #1a1a1a;
    --bg-secondary: #242424;
    --accent: #cc785c;
    /* ... */
}
```

### Modifying the AI Behavior

Edit the `SYSTEM_PROMPT` in `server.js` to change how Godrick responds or generates charts.

### Using Different Models

Change the model in `server.js`:

```javascript
model: 'claude-3-5-sonnet-20241022',  // Current model
```

## Troubleshooting

**Charts not rendering?**
- Check browser console for errors
- Verify the JSON format matches Chart.js specifications
- Ensure Chart.js library loaded (check network tab)

**API errors?**
- Verify your API key is correct in `.env`
- Check you have API credits in your Anthropic account
- Ensure `.env` file is in the root directory

**Server won't start?**
- Check if port 3000 is already in use
- Try changing the PORT in `.env`
- Verify all dependencies installed with `npm install`

## License

ISC

## Contributing

Feel free to open issues or submit pull requests!

---

Built with Claude by Anthropic
