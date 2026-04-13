import express, { Express } from 'express';
import http from 'http';
import WebSocket from 'ws';
import path from 'path';
import type { DataManager } from '../main/data-manager';
import { DraftState } from '../shared/types';

const PORT = process.env.PORT || 3001;
let currentDraft: DraftState | null = null;

// WebSocket clients subscribed to updates
const wsClients = new Set<WebSocket>();

export function startServer(dm?: DataManager) {
  void dm;
  const app: Express = express();
  const server = http.createServer(app);
  // ws.Server typing is available as (WebSocket as any).Server in some setups
  const wss = new (WebSocket as any).Server({ server });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.static(path.join(__dirname, '../../public')));

  // CORS - allow renderer to POST state
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (_req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // WebSocket connection handler
  wss.on('connection', (ws: WebSocket) => {
    wsClients.add(ws);

    // Send current state to new client
    if (currentDraft) {
      ws.send(
        JSON.stringify({
          type: 'state',
          data: currentDraft,
          timestamp: Date.now(),
        })
      );
    }

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'draft-update') {
          currentDraft = data.payload;
          broadcastUpdate('state', currentDraft);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      wsClients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      wsClients.delete(ws);
    });
  });

  // API Routes

  // Get current draft state
  app.get('/api/draft', (_req, res) => {
    if (currentDraft) {
      res.json(currentDraft);
    } else {
      res.status(404).json({ error: 'No draft loaded' });
    }
  });

  // Update draft state
  app.post('/api/draft', (req, res) => {
    // req is used here (incoming state)
    currentDraft = req.body;
    broadcastUpdate('state', currentDraft);
    res.json({ success: true });
  });

  // Overlay Routes (HTML pages)

  // Current Pick overlay
  app.get('/overlay/current', (_req, res) => {
    const html = generateCurrentPickOverlay();
    res.send(html);
  });

  // Draft Board overlay
  app.get('/overlay/board', (_req, res) => {
    const html = generateBoardOverlay();
    res.send(html);
  });

  // Team Roster overlay
  app.get('/overlay/roster/:teamId', (req, res) => {
    // req.params.teamId is used below
    const html = generateRosterOverlay(req.params.teamId);
    res.send(html);
  });

  // Health check
  app.get('/health', (_req, res) => {
    void _req;
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  server.listen(PORT, () => {
    console.log(`🎯 EasyDraft Server running on http://localhost:${PORT}`);
    console.log(`📺 Overlay URLs:`);
    console.log(`  - Current Pick: http://localhost:${PORT}/overlay/current`);
    console.log(`  - Draft Board: http://localhost:${PORT}/overlay/board`);
    console.log(`  - Team Roster: http://localhost:${PORT}/overlay/roster/:teamId`);
  });
}

function broadcastUpdate(type: string, data: any) {
  const message = JSON.stringify({
    type,
    data,
    timestamp: Date.now(),
  });

  wsClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export function broadcastDraftUpdate(data: DraftState) {
  currentDraft = data;
  broadcastUpdate('state', data);
}

function generateCurrentPickOverlay(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Current Pick</title>
  <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;700&family=Orbitron:wght@400;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --font: 'Segoe UI', sans-serif;
      --header-font: 'Segoe UI', sans-serif;
      --bg: #1e3c72;
      --bg-end: #2a5298;
      --panel-bg: rgba(0,0,0,0.7);
      --text: #ffffff;
      --header-color: #ffcc00;
      --accent: #60a5fa;
      --timer-color: #ff4444;
      --tag-bg: rgba(96,165,250,0.2);
      --tag-text: #93c5fd;
      --border: rgba(255,255,255,0.15);
      --header-size: 32px;
      --title-size: 48px;
      --body-size: 16px;
      --tag-size: 11px;
      --timer-size: 72px;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--font);
      background: linear-gradient(135deg, var(--bg) 0%, var(--bg-end) 100%);
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; color: var(--text);
    }
    .container {
      text-align: center; padding: 40px;
      background: var(--panel-bg); border-radius: 20px;
      min-width: 700px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }
    .on-the-clock {
      font-size: calc(var(--header-size) * 0.75); color: var(--header-color);
      margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px;
      font-family: var(--header-font); font-weight: bold;
    }
    .team-banner {
      width: 100%; height: 150px; border-radius: 10px; margin: 20px 0;
      display: flex; align-items: center; justify-content: center;
      font-size: var(--title-size); font-weight: bold;
      background-size: cover; background-position: center;
      text-shadow: 2px 2px 8px rgba(0,0,0,0.8);
    }
    .team-name {
      font-size: var(--title-size); font-weight: bold; margin: 20px 0;
      color: var(--text); text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
      font-family: var(--header-font);
    }
    .timer {
      font-size: var(--timer-size); font-weight: bold; color: var(--timer-color);
      margin: 30px 0; font-variant-numeric: tabular-nums; font-family: 'Courier New', monospace;
    }
    .pick-number { font-size: var(--body-size); color: var(--accent); margin: 15px 0; }
    .section-divider { margin-top: 30px; padding-top: 30px; border-top: 2px solid var(--border); text-align: left; }
    .section-header {
      font-size: calc(var(--header-size) * 0.625); font-weight: bold;
      margin-bottom: 15px; text-align: center; font-family: var(--header-font);
    }
    .constraints-header { color: var(--header-color); }
    .roster-header { color: var(--accent); }
    .constraint-item {
      background: rgba(255,255,255,0.1); padding: 12px; margin: 8px 0;
      border-radius: 8px; display: flex; justify-content: space-between;
      align-items: center; border-left: 4px solid var(--header-color);
      font-size: var(--body-size);
    }
    .constraint-label { font-weight: bold; }
    .constraint-progress { font-weight: bold; color: #4ade80; }
    .constraint-progress.pending { color: #fbbf24; }
    .no-constraints, .roster-empty { text-align: center; color: #888; font-style: italic; padding: 15px; }
    .roster-empty { grid-column: 1 / -1; }
    .roster-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .roster-player {
      background: rgba(96,165,250,0.1); border: 1px solid var(--border);
      padding: 10px 14px; border-radius: 8px; font-size: var(--body-size);
      display: flex; align-items: center; gap: 8px;
    }
    .roster-player .pick-num {
      background: var(--tag-bg); color: var(--tag-text);
      font-size: var(--tag-size); padding: 2px 6px; border-radius: 4px; font-weight: bold;
    }
    .roster-player .player-name { flex: 1; }
    .roster-player .player-tags { font-size: var(--tag-size); color: var(--tag-text); }
  </style>
</head>
<body>
  <div class="container">
    <div class="on-the-clock">ON THE CLOCK</div>
    <div class="team-banner" id="team-banner" style="background-color: #3b82f6;"></div>
    <div class="team-name" id="team-name">Waiting...</div>
    <div class="timer" id="timer">5:00</div>
    <div class="pick-number" id="pick-number">Pick --</div>
    <div class="section-divider">
      <div class="section-header constraints-header">RESTRICTIONS</div>
      <div id="constraints-list"></div>
    </div>
    <div class="section-divider">
      <div class="section-header roster-header">CURRENT ROSTER</div>
      <div class="roster-grid" id="roster-list"></div>
    </div>
  </div>

  <script>
    const ws = new WebSocket(\`ws://\${window.location.host}\`);
    let draftState = null;
    let timerInterval = null;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'state') {
        draftState = message.data;
        applyTheme();
        updateDisplay();
      }
    };

    function applyTheme() {
      const t = draftState && draftState.overlayTheme;
      if (!t) return;
      const r = document.documentElement.style;
      r.setProperty('--font', t.fontFamily);
      r.setProperty('--header-font', t.headerFontFamily);
      r.setProperty('--bg', t.backgroundColor);
      r.setProperty('--bg-end', t.backgroundGradientEnd);
      r.setProperty('--panel-bg', t.panelBackground);
      r.setProperty('--text', t.textColor);
      r.setProperty('--header-color', t.headerColor);
      r.setProperty('--accent', t.accentColor);
      r.setProperty('--timer-color', t.timerColor);
      r.setProperty('--tag-bg', t.tagBackground);
      r.setProperty('--tag-text', t.tagTextColor);
      r.setProperty('--border', t.borderColor);
      r.setProperty('--header-size', t.headerSize + 'px');
      r.setProperty('--title-size', t.titleSize + 'px');
      r.setProperty('--body-size', t.bodySize + 'px');
      r.setProperty('--tag-size', t.tagSize + 'px');
      r.setProperty('--timer-size', t.timerSize + 'px');
    }

    function updateDisplay() {
      if (!draftState) return;
      const teamId = getCurrentTeamId();
      const team = draftState.teams.find(t => t.id === teamId);
      const banner = document.getElementById('team-banner');
      if (team) {
        banner.style.backgroundColor = team.color || '#3b82f6';
        if (team.image) {
          banner.style.backgroundImage = \`url('\${team.image}')\`;
          banner.textContent = '';
        } else {
          banner.style.backgroundImage = 'none';
          banner.textContent = team.name;
        }
      }
      document.getElementById('team-name').textContent = team ? team.name : 'Waiting...';
      document.getElementById('pick-number').textContent = \`Pick \${draftState.picks.length + 1}\`;
      updateConstraints(team);
      updateRoster(team);
      updateTimer();
    }

    function updateConstraints(team) {
      const el = document.getElementById('constraints-list');
      if (!team || !team.constraints || Object.keys(team.constraints).length === 0) {
        el.innerHTML = '<div class="no-constraints">No restrictions for this team</div>';
        return;
      }
      let html = '';
      for (const [tag, required] of Object.entries(team.constraints)) {
        const picked = (team.roster || []).filter(pid => {
          const p = draftState.players.find(pl => pl.id === pid);
          return p && p.tags && p.tags.includes(tag);
        }).length;
        const cls = picked < required ? 'pending' : '';
        html += \`<div class="constraint-item"><span class="constraint-label">\${tag.charAt(0).toUpperCase()+tag.slice(1)}:</span><span class="constraint-progress \${cls}">\${picked}/\${required}</span></div>\`;
      }
      el.innerHTML = html;
    }

    function updateRoster(team) {
      const el = document.getElementById('roster-list');
      if (!team || !team.roster || team.roster.length === 0) {
        el.innerHTML = '<div class="roster-empty">No players drafted yet</div>';
        return;
      }
      let html = '';
      team.roster.forEach(pid => {
        const player = draftState.players.find(p => p.id === pid);
        if (player) {
          const pick = draftState.picks.find(pk => pk.playerId === pid && pk.teamId === team.id);
          const pickNum = pick ? pick.pickNumber : '?';
          const tags = player.tags && player.tags.length > 0 ? player.tags.join(', ') : '';
          html += \`<div class="roster-player"><span class="pick-num">#\${pickNum}</span><span class="player-name">\${player.name}</span>\${tags ? \`<span class="player-tags">\${tags}</span>\` : ''}</div>\`;
        }
      });
      el.innerHTML = html;
    }

    function getCurrentTeamId() {
      if (!draftState) return null;
      const order = generateDraftOrder();
      return order[draftState.currentPickIndex];
    }

    function generateDraftOrder() {
      const teamIds = draftState.teams.map(t => t.id);
      if (draftState.draftOrder === 'snake') {
        const n = teamIds.length, total = draftState.players.length;
        const order = [];
        for (let r = 0; r < Math.ceil(total/n); r++) {
          order.push(...(r%2===0 ? teamIds : [...teamIds].reverse()));
        }
        return order.slice(0, total);
      }
      const total = draftState.players.length, order = [];
      for (let i = 0; i < Math.ceil(total/teamIds.length); i++) order.push(...teamIds);
      return order.slice(0, total);
    }

    function updateTimer() {
      if (timerInterval) clearInterval(timerInterval);
      let remaining = draftState.timerSeconds;
      updateTimerDisplay(remaining);
      timerInterval = setInterval(() => {
        remaining--;
        if (remaining < 0) remaining = draftState.timerSeconds;
        updateTimerDisplay(remaining);
      }, 1000);
    }

    function updateTimerDisplay(s) {
      const m = Math.floor(s/60);
      document.getElementById('timer').textContent = \`\${m}:\${(s%60).toString().padStart(2,'0')}\`;
    }

    ws.onerror = (e) => console.error('WebSocket error:', e);
  </script>
</body>
</html>
  `;
}

function generateBoardOverlay(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Draft Board</title>
  <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;700&family=Orbitron:wght@400;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --font: 'Segoe UI', sans-serif;
      --header-font: 'Segoe UI', sans-serif;
      --bg: #0a0e27;
      --bg-end: #0a0e27;
      --text: #ffffff;
      --header-color: #fbbf24;
      --accent: #60a5fa;
      --tag-bg: rgba(96,165,250,0.2);
      --tag-text: #93c5fd;
      --border: rgba(255,255,255,0.1);
      --header-size: 32px;
      --body-size: 16px;
      --tag-size: 11px;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--font);
      background: linear-gradient(135deg, var(--bg), var(--bg-end));
      color: var(--text); padding: 20px; min-height: 100vh;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    .header {
      text-align: center; margin-bottom: 10px;
      font-size: var(--header-size); font-weight: bold;
      text-transform: uppercase; letter-spacing: 2px;
      font-family: var(--header-font); color: var(--text);
    }
    .stats-bar {
      display: flex; justify-content: center; gap: 30px;
      margin-bottom: 25px; font-size: calc(var(--body-size) * 0.875);
    }
    .stats-bar span {
      background: rgba(255,255,255,0.08); padding: 6px 16px; border-radius: 20px;
    }
    .stats-bar .count { color: var(--accent); font-weight: bold; }
    .remaining-section {
      background: rgba(255,255,255,0.04); border: 1px solid var(--border);
      border-radius: 12px; padding: 20px;
    }
    .remaining-header {
      font-size: calc(var(--header-size) * 0.69); font-weight: bold;
      margin-bottom: 15px; padding-bottom: 10px;
      border-bottom: 2px solid var(--border); color: var(--header-color);
      font-family: var(--header-font);
    }
    .player-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px;
    }
    .player-card {
      padding: 12px 16px; background: rgba(255,255,255,0.06);
      border: 1px solid var(--border); border-radius: 8px;
      display: flex; align-items: center; gap: 12px;
      transition: background 0.2s;
    }
    .player-card:hover { background: rgba(255,255,255,0.1); }
    .player-name { font-size: var(--body-size); font-weight: 600; flex-shrink: 0; }
    .player-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-left: auto; }
    .tag {
      font-size: var(--tag-size); padding: 2px 8px; border-radius: 10px;
      background: var(--tag-bg); color: var(--tag-text);
      border: 1px solid rgba(96,165,250,0.3); white-space: nowrap;
    }
    .no-players { text-align: center; color: #666; font-style: italic; padding: 30px; font-size: 18px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Draft Board</div>
    <div class="stats-bar" id="stats-bar"></div>
    <div class="remaining-section">
      <div class="remaining-header">🎯 Available Players</div>
      <div class="player-grid" id="remaining-players"></div>
    </div>
  </div>
  <script>
    const ws = new WebSocket(\`ws://\${window.location.host}\`);
    let draftState = null;

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'state') { draftState = msg.data; applyTheme(); updateBoard(); }
    };

    function applyTheme() {
      const t = draftState && draftState.overlayTheme;
      if (!t) return;
      const r = document.documentElement.style;
      r.setProperty('--font', t.fontFamily);
      r.setProperty('--header-font', t.headerFontFamily);
      r.setProperty('--bg', t.backgroundColor);
      r.setProperty('--bg-end', t.backgroundGradientEnd);
      r.setProperty('--text', t.textColor);
      r.setProperty('--header-color', t.headerColor);
      r.setProperty('--accent', t.accentColor);
      r.setProperty('--tag-bg', t.tagBackground);
      r.setProperty('--tag-text', t.tagTextColor);
      r.setProperty('--border', t.borderColor);
      r.setProperty('--header-size', t.headerSize + 'px');
      r.setProperty('--body-size', t.bodySize + 'px');
      r.setProperty('--tag-size', t.tagSize + 'px');
    }

    function updateBoard() {
      if (!draftState) return;
      const draftedIds = new Set(draftState.picks.map(p => p.playerId));
      const remaining = draftState.players.filter(p => !draftedIds.has(p.id));
      const drafted = draftState.players.length - remaining.length;

      document.getElementById('stats-bar').innerHTML = \`
        <span>Total: <span class="count">\${draftState.players.length}</span></span>
        <span>Remaining: <span class="count">\${remaining.length}</span></span>
        <span>Drafted: <span class="count">\${drafted}</span></span>
        <span>Pick: <span class="count">#\${draftState.picks.length + 1}</span></span>
      \`;

      const el = document.getElementById('remaining-players');
      if (remaining.length === 0) {
        el.innerHTML = '<div class="no-players">All players have been drafted!</div>';
        return;
      }
      el.innerHTML = remaining.map(player => {
        const tags = (player.tags||[]).map(t => \`<span class="tag">\${t}</span>\`).join('');
        return \`<div class="player-card"><span class="player-name">\${player.name}</span><div class="player-tags">\${tags}</div></div>\`;
      }).join('');
    }

    ws.onerror = (e) => console.error('WebSocket error:', e);
  </script>
</body>
</html>
  `;
}

function generateRosterOverlay(teamId: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Roster</title>
  <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;700&family=Orbitron:wght@400;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --font: 'Segoe UI', sans-serif;
      --header-font: 'Segoe UI', sans-serif;
      --bg: #1a1a2e;
      --bg-end: #16213e;
      --panel-bg: rgba(0,0,0,0.5);
      --text: #ffffff;
      --header-color: #ffcc00;
      --accent: #60a5fa;
      --tag-bg: rgba(96,165,250,0.2);
      --tag-text: #93c5fd;
      --border: rgba(255,255,255,0.15);
      --header-size: 32px;
      --title-size: 40px;
      --body-size: 18px;
      --tag-size: 11px;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--font);
      background: linear-gradient(135deg, var(--bg), var(--bg-end));
      color: var(--text); padding: 30px; min-height: 100vh;
    }
    .container { max-width: 600px; margin: 0 auto; }
    .team-banner {
      width: 100%; height: 120px; border-radius: 10px; margin-bottom: 30px;
      display: flex; align-items: center; justify-content: center;
      font-size: 36px; font-weight: bold;
      background-size: cover; background-position: center;
      text-shadow: 2px 2px 8px rgba(0,0,0,0.8);
    }
    .team-name {
      font-size: var(--title-size); font-weight: bold; margin-bottom: 20px;
      text-align: center; text-transform: uppercase; font-family: var(--header-font);
    }
    .roster { list-style: none; display: flex; flex-direction: column; gap: 10px; }
    .player-item {
      padding: 15px; border-radius: 8px; font-size: var(--body-size);
      background: rgba(255,255,255,0.08); border-left: 4px solid var(--accent);
      display: flex; align-items: center; gap: 12px;
    }
    .player-item .pick-num {
      background: var(--tag-bg); color: var(--tag-text);
      font-size: var(--tag-size); padding: 3px 8px; border-radius: 4px; font-weight: bold;
    }
    .player-item .player-tags {
      margin-left: auto; display: flex; gap: 4px;
    }
    .player-item .tag {
      font-size: var(--tag-size); padding: 2px 8px; border-radius: 10px;
      background: var(--tag-bg); color: var(--tag-text); white-space: nowrap;
    }
    .empty-state { text-align: center; padding: 40px; color: #999; font-size: 18px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="team-banner" id="team-banner" style="background-color: #3b82f6;"></div>
    <div class="team-name" id="team-name">Loading...</div>
    <ul class="roster" id="roster"></ul>
  </div>
  <script>
    const teamId = '${teamId}';
    const ws = new WebSocket(\`ws://\${window.location.host}\`);
    let draftState = null;

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'state') { draftState = msg.data; applyTheme(); updateRoster(); }
    };

    function applyTheme() {
      const t = draftState && draftState.overlayTheme;
      if (!t) return;
      const r = document.documentElement.style;
      r.setProperty('--font', t.fontFamily);
      r.setProperty('--header-font', t.headerFontFamily);
      r.setProperty('--bg', t.backgroundColor);
      r.setProperty('--bg-end', t.backgroundGradientEnd);
      r.setProperty('--panel-bg', t.panelBackground);
      r.setProperty('--text', t.textColor);
      r.setProperty('--header-color', t.headerColor);
      r.setProperty('--accent', t.accentColor);
      r.setProperty('--tag-bg', t.tagBackground);
      r.setProperty('--tag-text', t.tagTextColor);
      r.setProperty('--border', t.borderColor);
      r.setProperty('--header-size', t.headerSize + 'px');
      r.setProperty('--title-size', t.titleSize + 'px');
      r.setProperty('--body-size', t.bodySize + 'px');
      r.setProperty('--tag-size', t.tagSize + 'px');
    }

    function updateRoster() {
      if (!draftState) return;
      const team = draftState.teams.find(t => t.id === teamId);
      if (!team) { document.getElementById('team-name').textContent = 'Team not found'; return; }

      const banner = document.getElementById('team-banner');
      banner.style.backgroundColor = team.color || '#3b82f6';
      if (team.image) { banner.style.backgroundImage = \`url('\${team.image}')\`; banner.textContent = ''; }
      else { banner.style.backgroundImage = 'none'; banner.textContent = team.name; }

      document.getElementById('team-name').textContent = team.name;
      const el = document.getElementById('roster');

      if (!team.roster || team.roster.length === 0) {
        el.innerHTML = '<div class="empty-state">No players drafted yet</div>';
        return;
      }

      el.innerHTML = team.roster.map((pid, i) => {
        const player = draftState.players.find(p => p.id === pid);
        if (!player) return '';
        const pick = draftState.picks.find(pk => pk.playerId === pid && pk.teamId === team.id);
        const pickNum = pick ? pick.pickNumber : '?';
        const tags = (player.tags||[]).map(t => \`<span class="tag">\${t}</span>\`).join('');
        return \`<li class="player-item"><span class="pick-num">#\${pickNum}</span>\${player.name}<div class="player-tags">\${tags}</div></li>\`;
      }).join('');
    }

    ws.onerror = (e) => console.error('WebSocket error:', e);
  </script>
</body>
</html>
  `;
}
