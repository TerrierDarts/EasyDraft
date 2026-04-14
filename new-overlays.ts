function generateRecentPicksOverlay(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recent Picks</title>
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
      --tag-bg: rgba(96,165,250,0.2);
      --tag-text: #93c5fd;
      --border: rgba(255,255,255,0.15);
      --header-size: 32px;
      --body-size: 16px;
      --tag-size: 11px;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--font);
      background: linear-gradient(135deg, var(--bg) 0%, var(--bg-end) 100%);
      min-height: 100vh;
      padding: 20px;
      color: var(--text);
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: var(--header-size);
      color: var(--header-color);
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
      font-family: var(--header-font);
    }
    .picks-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .pick-item {
      background: var(--panel-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 15px;
      display: flex;
      align-items: center;
      gap: 15px;
      transition: all 0.3s ease;
      border-left: 4px solid var(--header-color);
    }
    .pick-item:hover {
      background: rgba(0,0,0,0.85);
      border-left-color: var(--accent);
    }
    .pick-number {
      font-size: 24px;
      font-weight: bold;
      color: var(--header-color);
      min-width: 60px;
      text-align: center;
      font-family: 'Courier New', monospace;
    }
    .pick-info {
      flex: 1;
    }
    .player-name {
      font-size: calc(var(--body-size) + 2px);
      font-weight: bold;
      margin-bottom: 4px;
    }
    .team-name {
      font-size: var(--body-size);
      color: var(--accent);
      margin-bottom: 6px;
    }
    .player-tags {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
    .tag {
      background: var(--tag-bg);
      color: var(--tag-text);
      font-size: var(--tag-size);
      padding: 2px 8px;
      border-radius: 8px;
      font-weight: bold;
    }
    .empty-state {
      text-align: center;
      padding: 40px;
      color: rgba(255,255,255,0.5);
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Recent Picks</h1>
    </div>
    <div class="picks-list" id="picks"></div>
  </div>

  <script>
    const ws = new WebSocket(\`ws://\${window.location.host}/\`);
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'state' && message.data) {
          updatePicks(message.data);
        }
      } catch (error) {
        console.error('Parse error:', error);
      }
    };

    function updatePicks(draftState) {
      const el = document.getElementById('picks');
      
      if (!draftState.picks || draftState.picks.length === 0) {
        el.innerHTML = '<div class="empty-state">No picks yet</div>';
        return;
      }

      const recentPicks = [...draftState.picks].reverse().slice(0, 10);
      
      el.innerHTML = recentPicks.map(pick => {
        const player = draftState.players.find(p => p.id === pick.playerId);
        const team = draftState.teams.find(t => t.id === pick.teamId);
        
        if (!player || !team) return '';
        
        const tags = player.tags.map(tag => \`<span class="tag">\${tag}</span>\`).join('');
        
        return \`
          <div class="pick-item">
            <div class="pick-number">#\${pick.pickNumber}</div>
            <div class="pick-info">
              <div class="player-name">\${player.name}</div>
              <div class="team-name">\${team.name}</div>
              <div class="player-tags">\${tags || '<span class="tag">no tags</span>'}</div>
            </div>
          </div>
        \`;
      }).join('');
    }

    ws.onerror = (e) => console.error('WebSocket error:', e);
  </script>
</body>
</html>
  \`;
}

function generateAllTeamsOverlay(): string {
  return \`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>All Teams</title>
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
      --tag-bg: rgba(96,165,250,0.2);
      --tag-text: #93c5fd;
      --border: rgba(255,255,255,0.15);
      --header-size: 32px;
      --title-size: 24px;
      --body-size: 14px;
      --tag-size: 10px;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--font);
      background: linear-gradient(135deg, var(--bg) 0%, var(--bg-end) 100%);
      min-height: 100vh;
      padding: 20px;
      color: var(--text);
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: var(--header-size);
      color: var(--header-color);
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
      font-family: var(--header-font);
    }
    .teams-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    .team-card {
      background: var(--panel-bg);
      border: 2px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      transition: all 0.3s ease;
    }
    .team-card:hover {
      border-color: var(--accent);
      background: rgba(0,0,0,0.85);
      box-shadow: 0 4px 20px rgba(96,165,250,0.2);
    }
    .team-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 15px;
    }
    .team-logo {
      width: 50px;
      height: 50px;
      border-radius: 8px;
      background-size: contain;
      background-position: center;
      border: 2px solid var(--border);
    }
    .team-info h2 {
      font-size: var(--title-size);
      color: var(--header-color);
      margin-bottom: 4px;
    }
    .team-info p {
      font-size: var(--body-size);
      color: var(--accent);
    }
    .roster-title {
      font-size: var(--body-size);
      font-weight: bold;
      color: var(--text);
      margin-top: 12px;
      margin-bottom: 8px;
    }
    .roster-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .roster-player {
      background: rgba(255,255,255,0.05);
      padding: 8px 10px;
      border-radius: 6px;
      font-size: var(--body-size);
      border-left: 3px solid var(--accent);
    }
    .pick-num {
      display: inline-block;
      background: var(--tag-bg);
      color: var(--tag-text);
      font-size: var(--tag-size);
      padding: 1px 6px;
      border-radius: 4px;
      margin-right: 6px;
      font-weight: bold;
    }
    .empty-message {
      font-style: italic;
      color: rgba(255,255,255,0.4);
      padding: 10px;
      text-align: center;
      font-size: var(--body-size);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏆 All Teams</h1>
    </div>
    <div class="teams-grid" id="teams"></div>
  </div>

  <script>
    const ws = new WebSocket(\`ws://\${window.location.host}/\`);
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'state' && message.data) {
          updateTeams(message.data);
        }
      } catch (error) {
        console.error('Parse error:', error);
      }
    };

    function updateTeams(draftState) {
      const el = document.getElementById('teams');
      
      el.innerHTML = draftState.teams.map(team => {
        const rosterHtml = team.roster && team.roster.length > 0
          ? team.roster.map(pid => {
              const player = draftState.players.find(p => p.id === pid);
              if (!player) return '';
              const pick = draftState.picks.find(pk => pk.playerId === pid && pk.teamId === team.id);
              const pickNum = pick ? pick.pickNumber : '?';
              return \`<div class="roster-player"><span class="pick-num">#\${pickNum}</span>\${player.name}</div>\`;
            }).join('')
          : '<div class="empty-message">No players drafted</div>';
        
        const logoStyle = team.logoUrl ? \`background-image: url('\${team.logoUrl}')\` : 'background-color: #3b82f6';
        
        return \`
          <div class="team-card">
            <div class="team-header">
              <div class="team-logo" style="\${logoStyle}"></div>
              <div class="team-info">
                <h2>\${team.name}</h2>
                <p>\${team.roster?.length || 0} players</p>
              </div>
            </div>
            <div class="roster-title">Roster</div>
            <div class="roster-list">\${rosterHtml}</div>
          </div>
        \`;
      }).join('');
    }

    ws.onerror = (e) => console.error('WebSocket error:', e);
  </script>
</body>
</html>
  \`;
}
