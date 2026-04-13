# GETTING STARTED GUIDE

## Quick Start (Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

This command will:
- Start Vite dev server on `http://localhost:5173` (React UI)
- Start Electron app automatically
- Start Express server on `http://localhost:3001` (Overlays)

### 3. Access the Application
- **Main App**: Electron window opens automatically
- **Overlays**:
  - Current Pick: http://localhost:3001/overlay/current
  - Draft Board: http://localhost:3001/overlay/board
  - Team Roster: http://localhost:3001/overlay/roster/{teamId}

### 4. Add to OBS
In OBS Studio:
1. Add a **Browser Source** to a scene
2. Set URL to: `http://localhost:3001/overlay/current`
3. Set size: 1280x720 (or your broadcast resolution)
4. Check "Local file" if using file path, or leave unchecked for URL
5. The overlay will auto-update when picks are made!

## Production Build

### Build for Distribution
```bash
npm run build
```

Outputs:
- React app compiled to `dist/renderer/`
- Electron bundled to `dist/main/`

### Package as Executable
```bash
npm run dist
```

Creates installers in `out/` directory:
- Windows: `EasyDraft-Setup-x.x.x.exe`
- Can be distributed to users

## Project Structure Overview

```
src/
├── main/          # Electron main process
│   ├── index.ts   # App initialization
│   ├── data-manager.ts  # File persistence
│   └── preload.ts # IPC security bridge
│
├── renderer/      # React UI
│   ├── App.tsx    # Main component
│   ├── main.tsx   # React entry point
│   └── components/ # UI components
│
├── server/        # Express overlay server
│   └── index.ts   # HTTP + WebSocket
│
└── shared/        # Shared code
    ├── types.ts   # TypeScript definitions
    ├── store.ts   # Zustand state management
    └── draft-engine.ts # Draft logic
```

## Key Features to Try

### Control Panel
1. Start with example data (pre-loaded)
2. Click "Start Draft" to begin
3. Select a player and click "Make Pick"
4. Watch overlays update in real-time

### Player & Team Management
- **Players Tab**: Add custom players with tags
- **Teams Tab**: Create teams with constraints (e.g., "must have 1 female player")

### Draft Modes
In the control panel, see different draft orders:
- Sequential: Teams pick in fixed order
- Random: Randomized each round
- Snake: Alternates direction each round (fairness)

### Data Persistence
- Click "Save" to save draft locally
- Click "Load" to open previously saved draft
- Export as JSON (full data) or CSV (picks only)

## Troubleshooting

### App won't start
```bash
# Clear cache and reinstall
rm -r node_modules dist
npm install
npm run dev
```

### Port 3001 in use
Edit `/src/server/index.ts`:
```typescript
const PORT = process.env.PORT || 3001;  // Change 3001 to another port
```

### Overlays not updating
1. Check browser console (F12 in overlay tab)
2. Verify WebSocket connection
3. Check firewall allows `localhost:3001`

### Can't build
- Ensure you have `build-essential` (Linux) or Visual Studio Build Tools (Windows)
- Run: `npm audit fix` to resolve dependency issues

## Next Steps

1. **Customize Appearance**
   - Edit component styles in `src/renderer/components/`
   - Modify overlay CSS in `src/server/index.ts`

2. **Add Features**
   - Sound triggers on picks (add audio file to `public/`)
   - Keyboard shortcuts (add to `ControlPanel.tsx`)
   - Pick timer sound (edit timer section)

3. **Deploy**
   - Build with `npm run dist`
   - Distribute `.exe` to users
   - Users run installer and app works standalone

## Support Resources

- **Electron**: https://www.electronjs.org/docs
- **React**: https://react.dev
- **Zustand**: https://github.com/pmndrs/zustand
- **Vite**: https://vitejs.dev

---

**Questions?** Check the main README.md for more details!
