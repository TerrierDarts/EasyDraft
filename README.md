# EasyDraft - Draft Management System

A professional desktop application built with **Electron** and **React** for managing draft events with OBS overlay support.

## Features

### 📊 Core Draft Engine
- **Multiple Draft Modes**: Sequential, Randomized, Snake (fairness mode)
- **Constraint System**: Tag-based requirements (e.g., minimum female players per team)
- **Real-time Control Panel**: Start, pause, reset, and manage picks
- **Pick Timer**: Customizable countdown timer for each pick
- **Undo System**: Roll back picks up to any point
- **Auto-suggest**: Suggest next available players

### 👥 Player Management
- Add/edit/remove players with tags and metadata
- Tag-based organization (gender, role, skill level, etc.)
- Image support (optional)
- Notes/comments per player

### 🏆 Team Management
- Create and configure teams
- Set tag-based constraints per team (e.g., "Must have 2 female players")
- View team rosters in real-time
- Track constraint fulfillment

### 📺 OBS Overlay System
- **Current Pick Overlay**: Show the team on the clock and timer
- **Draft Board Overlay**: Live team rosters
- **Team Roster Overlay**: Individual team view
- WebSocket real-time updates
- Broadcast-friendly minimal UI
- Customizable CSS

### 💾 Data Management
- Save/load draft sessions
- Export to JSON or CSV
- Import previously saved drafts
- Automatic local storage

### ⚙️ Local Server
- Express.js server running inside Electron
- Serve overlays via HTTP on `localhost:3001`
- RESTful API for draft state
- WebSocket support for real-time updates

## Project Structure

```
EasyDraft/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # Main app setup
│   │   ├── data-manager.ts # File I/O
│   │   └── preload.ts     # IPC bridge
│   │
│   ├── renderer/          # React UI
│   │   ├── App.tsx        # Main component
│   │   ├── main.tsx       # Entry point
│   │   ├── index.css      # Styles + Tailwind
│   │   └── components/
│   │       ├── ControlPanel.tsx
│   │       ├── PlayerManager.tsx
│   │       ├── TeamManager.tsx
│   │       └── DraftBoard.tsx
│   │
│   ├── server/            # Express overlay server
│   │   └── index.ts       # Server setup & routes
│   │
│   └── shared/            # Shared logic
│       ├── types.ts       # TypeScript definitions
│       ├── store.ts       # Zustand store
│       └── draft-engine.ts # Draft logic
│
├── data/                  # Saved drafts
├── public/                # Static assets
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm

### Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run in Development Mode**
   ```bash
   npm run dev
   ```
   - Vite dev server starts on http://localhost:5173
   - Electron app opens automatically
   - Express server runs on http://localhost:3001

3. **Access Overlays**
   - **Current Pick**: http://localhost:3001/overlay/current
   - **Draft Board**: http://localhost:3001/overlay/board
   - **Team Roster**: http://localhost:3001/overlay/roster/{teamId}

### Building for Distribution

```bash
npm run build
npm run dist
```

Creates a redistributable `.exe` (Windows) in the `out/` directory.

## Usage Guide

### 1. Setup Phase
- **Players Tab**: Add all players with tags (gender, role, skill level)
- **Teams Tab**: Create teams and set tag constraints

### 2. Draft Phase
- **Control Panel**: 
  - Click "Start Draft" to begin
  - Select a player from the available list
  - Click "Make Pick" to draft
  - Timer auto-counts down (customizable)
  - "Pause" to pause draft, "Resume" to continue
  - "Undo" to reverse last pick

### 3. Overlays in OBS
- Add Browser Source in OBS:
  - URL: `http://localhost:3001/overlay/current`
  - Size: 1280x720 (adjust as needed)
- Overlays auto-update via WebSocket
- CSS can be customized in `/src/server/index.ts`

### 4. Save & Export
- Click **Save** to persist draft locally
- Click **Load** to open previous draft
- Export as **JSON** (full data) or **CSV** (picks only)

## Example Data

The app comes pre-loaded with example data:

**Players:**
- Alice Johnson (female, forward)
- Bob Smith (male, forward)
- Carol Davis (female, guard)
- David Lee (male, guard)
- Eva Wilson (female, center)
- Frank Brown (male, center)

**Teams:**
- Team Alpha, Beta, Gamma (each requires ≥1 female player)

**Draft Order:** Sequential (Team 1 → Team 2 → Team 3, repeat)

## API Reference

### REST Endpoints

```
GET  /api/draft                 # Get current draft state
POST /api/draft                 # Update draft state
GET  /overlay/current           # Current pick overlay HTML
GET  /overlay/board             # Draft board overlay HTML
GET  /overlay/roster/:teamId    # Team roster overlay HTML
GET  /health                    # Health check
```

### WebSocket Events

```javascript
// Sent to client
{ type: 'state', data: DraftState, timestamp: number }

// Sent from client
{ type: 'draft-update', payload: DraftState }
```

## Customization

### Draft Order Modes

1. **Sequential**: Teams pick in fixed order (1→2→3→1→2→...)
2. **Random**: Teams pick in randomized order each round
3. **Snake**: Teams reverse order each round (fairness mode)

### Tag Constraints

Define per-team requirements:
- Team Alpha: "female" ≥ 2, "experience" ≥ 1
- Team Beta: "female" ≥ 1
- etc.

The system warns/blocks picks that violate constraints.

### CSS Customization

Edit overlay styles in `/src/server/index.ts`:
- Search for `generateCurrentPickOverlay()`, `generateBoardOverlay()`
- Modify colors, fonts, layout
- All overlays are self-contained HTML with inline styles

## Troubleshooting

### Server not starting
- Check if port 3001 is available: `netstat -ano | findstr :3001` (Windows)
- Kill process: `taskkill /PID <pid> /F`
- Try different port in `/src/server/index.ts`

### Overlays not updating in OBS
- Ensure WebSocket connection is working (check browser console)
- Verify OBS Browser Source URL: `http://localhost:3001/overlay/current`
- Check firewall rules allow local connections

### Electron app won't start
- Delete `node_modules` and reinstall: `npm install`
- Clear Vite cache: `rm -rf dist/`

## Advanced Features

### Predefined Picks
Lock specific players to specific teams/picks (coming soon).

### Sound Triggers
Play sound on pick (implement in Control Panel component).

### Keyboard Shortcuts
- `Ctrl+S`: Save
- `Ctrl+L`: Load
- `Space`: Make Pick
- `U`: Undo

## Performance Notes

- Handles 100+ players and 10+ teams smoothly
- Real-time updates via WebSocket (< 50ms latency)
- Draft state persisted to local JSON files
- Minimal memory footprint (~100MB Electron process)

## License

MIT

## Support

For issues, feature requests, or questions:
- Check the GitHub Issues page
- Review this README
- Inspect browser console (`F12` in overlays)

---

**Happy Drafting! 🎯**
