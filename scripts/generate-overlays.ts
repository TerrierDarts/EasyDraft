import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '..', 'overlays');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// HTML template for Current Pick overlay
const currentPickHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EasyDraft - Current Pick</title>
  <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;700&family=Orbitron:wght@400;700;900&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --font: 'Inter', sans-serif;
      --header-font: 'Rajdhani', monospace;
      --header-size: 36px;
      --title-size: 24px;
      --body-size: 16px;
      --tag-size: 12px;
      --timer-size: 48px;
      --bg-color: #0f172a;
      --bg-gradient-end: #1e293b;
      --panel-bg: rgba(30, 41, 59, 0.8);
      --text-color: #e2e8f0;
      --header-color: #60a5fa;
      --accent-color: #3b82f6;
      --timer-color: #ef4444;
      --tag-bg: rgba(59, 130, 246, 0.2);
      --tag-text: #93c5fd;
      --border-color: #334155;
    }

    body {
      background: linear-gradient(135deg, var(--bg-color) 0%, var(--bg-gradient-end) 100%);
      color: var(--text-color);
      font-family: var(--font);
      padding: 20px;
      min-height: 100vh;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      font-family: var(--header-font);
      font-size: var(--header-size);
      color: var(--header-color);
      margin-bottom: 20px;
      text-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
    }

    .panel {
      background: var(--panel-bg);
      border: 2px solid var(--border-color);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      backdrop-filter: blur(10px);
    }

    .timer {
      font-size: var(--timer-size);
      color: var(--timer-color);
      font-weight: bold;
      text-align: center;
      margin: 20px 0;
      font-family: var(--header-font);
    }

    .tag {
      display: inline-block;
      background: var(--tag-bg);
      color: var(--tag-text);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: var(--tag-size);
      margin: 4px;
      border: 1px solid var(--tag-text);
    }

    .placeholder {
      color: #64748b;
      font-style: italic;
      padding: 40px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📋 Current Pick</h1>
    
    <div class="panel">
      <div class="placeholder">
        Connect to EasyDraft app to see current pick information.<br>
        <small>Overlays update in real-time via WebSocket connection.</small>
      </div>
    </div>

    <div class="panel">
      <h2 style="color: var(--header-color); margin-bottom: 15px;">⏱️ Timer</h2>
      <div class="timer">0:00</div>
    </div>
  </div>

  <script>
    // Placeholder for WebSocket connection in future versions
    console.log('Current Pick Overlay loaded. Waiting for connection...');
  </script>
</body>
</html>`;

// HTML template for Draft Board overlay
const boardHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EasyDraft - Draft Board</title>
  <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;700&family=Orbitron:wght@400;700;900&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --font: 'Inter', sans-serif;
      --header-font: 'Rajdhani', monospace;
      --header-size: 36px;
      --title-size: 24px;
      --body-size: 16px;
      --tag-size: 12px;
      --bg-color: #0f172a;
      --bg-gradient-end: #1e293b;
      --panel-bg: rgba(30, 41, 59, 0.8);
      --text-color: #e2e8f0;
      --header-color: #60a5fa;
      --accent-color: #3b82f6;
      --tag-bg: rgba(59, 130, 246, 0.2);
      --tag-text: #93c5fd;
      --border-color: #334155;
    }

    body {
      background: linear-gradient(135deg, var(--bg-color) 0%, var(--bg-gradient-end) 100%);
      color: var(--text-color);
      font-family: var(--font);
      padding: 20px;
      min-height: 100vh;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    h1 {
      font-family: var(--header-font);
      font-size: var(--header-size);
      color: var(--header-color);
      margin-bottom: 20px;
      text-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
    }

    .panel {
      background: var(--panel-bg);
      border: 2px solid var(--border-color);
      border-radius: 8px;
      padding: 20px;
      backdrop-filter: blur(10px);
    }

    .placeholder {
      color: #64748b;
      font-style: italic;
      padding: 60px 20px;
      text-align: center;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }

    .stat-box {
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid var(--border-color);
      padding: 15px;
      border-radius: 6px;
      text-align: center;
    }

    .stat-label {
      color: #94a3b8;
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: var(--header-color);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Draft Board</h1>
    
    <div class="stats">
      <div class="stat-box">
        <div class="stat-label">Total</div>
        <div class="stat-value">0</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Remaining</div>
        <div class="stat-value">0</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Drafted</div>
        <div class="stat-value">0</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Pick #</div>
        <div class="stat-value">0</div>
      </div>
    </div>

    <div class="panel">
      <div class="placeholder">
        Connect to EasyDraft app to see draft board.<br>
        <small>Players and their tags will display here.</small>
      </div>
    </div>
  </div>

  <script>
    console.log('Draft Board Overlay loaded. Waiting for connection...');
  </script>
</body>
</html>`;

// HTML template for Roster overlay
const rosterHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EasyDraft - Team Roster</title>
  <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;700&family=Orbitron:wght@400;700;900&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --font: 'Inter', sans-serif;
      --header-font: 'Rajdhani', monospace;
      --header-size: 36px;
      --title-size: 24px;
      --body-size: 16px;
      --tag-size: 12px;
      --bg-color: #0f172a;
      --bg-gradient-end: #1e293b;
      --panel-bg: rgba(30, 41, 59, 0.8);
      --text-color: #e2e8f0;
      --header-color: #60a5fa;
      --accent-color: #3b82f6;
      --tag-bg: rgba(59, 130, 246, 0.2);
      --tag-text: #93c5fd;
      --border-color: #334155;
    }

    body {
      background: linear-gradient(135deg, var(--bg-color) 0%, var(--bg-gradient-end) 100%);
      color: var(--text-color);
      font-family: var(--font);
      padding: 20px;
      min-height: 100vh;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
    }

    h1 {
      font-family: var(--header-font);
      font-size: var(--header-size);
      color: var(--header-color);
      margin-bottom: 20px;
      text-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
    }

    .panel {
      background: var(--panel-bg);
      border: 2px solid var(--border-color);
      border-radius: 8px;
      padding: 20px;
      backdrop-filter: blur(10px);
    }

    .placeholder {
      color: #64748b;
      font-style: italic;
      padding: 60px 20px;
      text-align: center;
    }

    .roster-list {
      list-style: none;
    }

    .roster-item {
      background: rgba(59, 130, 246, 0.1);
      border-left: 3px solid var(--accent-color);
      padding: 12px;
      margin-bottom: 10px;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .player-name {
      font-weight: 600;
    }

    .pick-number {
      color: #94a3b8;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>👥 Team Roster</h1>
    
    <div class="panel">
      <div class="placeholder">
        Connect to EasyDraft app to see team roster.<br>
        <small>Drafted players will display here.</small>
      </div>
    </div>
  </div>

  <script>
    console.log('Roster Overlay loaded. Waiting for connection...');
  </script>
</body>
</html>`;

// Write files
fs.writeFileSync(path.join(outputDir, 'current-pick.html'), currentPickHTML);
fs.writeFileSync(path.join(outputDir, 'draft-board.html'), boardHTML);
fs.writeFileSync(path.join(outputDir, 'team-roster.html'), rosterHTML);

console.log(`✓ Generated overlay HTML files in ${outputDir}`);
console.log('  - current-pick.html');
console.log('  - draft-board.html');
console.log('  - team-roster.html');
