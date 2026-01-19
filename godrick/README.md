# Wright AI Chatbot

An AI chatbot with a Claude.ai-inspired UI and intelligent chart generation capabilities. Wright can understand requests for data visualizations and automatically generate beautiful charts using Chart.js.

**Live at:** [fishpog.lol/godrick](https://fishpog.lol/godrick)

## Features

- **Claude.ai-inspired UI**: Clean, modern interface with dark theme
- **Real-time streaming**: Messages stream in real-time for a responsive experience
- **Smart Chart Generation**: Automatically detects and renders charts when Wright generates visualization data
- **Multiple Chart Types**: Supports line, bar, pie, doughnut, radar, and scatter charts
- **Markdown Support**: Full markdown rendering for rich text formatting
- **Conversation History**: Maintains chat context throughout the conversation

## Architecture

This project has two parts:

1. **Frontend** (GitHub Pages): Static HTML/CSS/JS served at fishpog.lol/godrick
2. **Backend** (Separate server): Node.js API server that handles Anthropic API calls

The frontend and backend can be deployed independently.

## Setup

### Backend Setup (Required)

The backend handles API calls to Anthropic Claude.

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
Create a `.env` file (or edit the existing one):
```bash
ANTHROPIC_API_KEY=your_api_key_here
PORT=3000
```

3. **Run locally for testing:**
```bash
npm start
```

The backend will run on http://localhost:3000

### Frontend Setup

The frontend is already configured for GitHub Pages at fishpog.lol/godrick.

**For local testing:** Just open `index.html` in a browser (make sure backend is running on localhost:3000)

**For production:** Update `js/config.js` with your deployed backend URL:
```javascript
const API_URL = 'https://your-backend-url.com';
```

## Deployment

### Deploy Backend (Choose one):

#### Option 1: Render.com (Recommended - Free tier)
1. Push this code to a GitHub repository
2. Go to [render.com](https://render.com) and sign up
3. Create a new "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Add Environment Variable:** `ANTHROPIC_API_KEY` = your key
6. Deploy! You'll get a URL like `https://godrick.onrender.com`

#### Option 2: Railway.app
1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Create new project from GitHub repo
4. Add environment variable `ANTHROPIC_API_KEY`
5. Deploy automatically

#### Option 3: Vercel
```bash
npm install -g vercel
vercel
```
Add `ANTHROPIC_API_KEY` in Vercel dashboard

### Deploy Frontend (GitHub Pages)

Already set up! Just:
1. Update `js/config.js` with your backend URL
2. Commit and push to your fishpog.lol repository
3. Access at fishpog.lol/godrick

## How Chart Generation Works

Wright has been trained to generate chart data in a special format. When you ask for a visualization, it will:

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

Wright generates charts using this JSON structure:

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
├── server.js              # Express backend API server
├── index.html            # Main HTML file (served by GitHub Pages)
├── css/
│   └── styles.css        # Claude.ai-inspired styling
├── js/
│   ├── config.js         # Backend URL configuration
│   └── app.js            # Frontend logic & chart rendering
├── package.json
├── .env                  # Environment variables (backend)
└── README.md
```

## Technologies Used

- **Backend**: Node.js, Express
- **AI**: Anthropic Claude API (Claude 3.5 Sonnet)
- **Frontend**: Vanilla JavaScript, Chart.js, Marked.js
- **Hosting**: GitHub Pages (frontend) + Any Node.js host (backend)

## Customization

### Changing the Theme

Edit the CSS variables in `css/styles.css`:

```css
:root {
    --bg-primary: #1a1a1a;
    --bg-secondary: #242424;
    --accent: #cc785c;
    /* ... */
}
```

### Modifying AI Behavior

Edit the `SYSTEM_PROMPT` in `server.js` to change how Wright responds or generates charts.

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
- Verify backend is running and accessible
- Check `js/config.js` has correct backend URL
- Verify API key in backend `.env` file
- Check CORS is enabled on backend

**CORS errors?**
- Backend has CORS enabled, but make sure your hosting platform doesn't override it
- Check that `config.js` points to the correct backend URL (including https://)

**Server won't start?**
- Check if port 3000 is already in use
- Try changing PORT in `.env`
- Verify all dependencies installed with `npm install`

## Development Workflow

1. **Local development:**
   - Run backend: `npm start` (in godrick directory)
   - Open `index.html` in browser
   - Make changes to frontend files
   - Refresh browser to see changes

2. **Deploy to production:**
   - Deploy backend to Render/Railway/Vercel
   - Update `js/config.js` with backend URL
   - Push to GitHub (auto-deploys to fishpog.lol/godrick)

## License

ISC

---

Built with Claude by Anthropic
