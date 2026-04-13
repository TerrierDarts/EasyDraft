# EasyDraft Testing Guide

## ✅ New Features Implemented

### 1. **Team Image & Color Support**
- Teams now have customizable **color** (hex color picker) and **image URL**
- Edit a team in the **Teams tab** to add/change:
  - **Team Color**: Click the color picker to choose a team brand color
  - **Team Image**: Paste a URL to a team logo/banner image
- The color/image displays on:
  - Team cards in the Teams tab
  - Current Pick overlay (banner behind team name)
  - Team Roster overlay (banner at top)
  - Draft Board overlay (colored team headers)

### 2. **Current Pick Overlay Enhancement**
- **URL**: `http://localhost:3001/overlay/current`
- **For OBS**: Add as a Browser Source to your OBS scene
- **Features**:
  - Shows team **banner** (image if available, color background if not)
  - Displays team **name**
  - Large **countdown timer** (default 5:00)
  - Current **pick number**
  - Real-time updates via WebSocket

### 3. **Draft Board Overlay**
- **URL**: `http://localhost:3001/overlay/board`
- **For OBS**: Add as a Browser Source
- **Features**:
  - **Remaining Players** section (left side) - shows all undrafted players
  - **Team Rosters** section (below) - shows all teams with colored headers
  - Each team board shows:
    - Team name with pick count
    - Team color as header background
    - List of drafted players in order
  - Real-time sync as picks are made

### 4. **Team Roster Overlay (Solo Per Team)**
- **URL**: `http://localhost:3001/overlay/roster/:teamId`
- **Example**: `http://localhost:3001/overlay/roster/t1` (for Team Alpha)
- **For OBS**: Create separate Browser Sources for each team
- **Features**:
  - Team banner (image or color)
  - Team name
  - Numbered roster list (1, 2, 3...)
  - Empty state message if no picks yet
  - Only shows that team's players

---

## 🧪 Step-by-Step Testing

### Step 1: Start the App
```bash
npm run dev
```
Wait for:
- ✅ Electron window opens (with React UI)
- ✅ Server outputs: "🎯 EasyDraft Server running on http://localhost:3001"

### Step 2: Add Team Colors & Images
1. Open the **Teams** tab in Electron app
2. Click **Edit** on a team (or Add Team)
3. Fill in:
   - **Team Color**: Click color picker, choose a color
   - **Team Image**: Paste a URL (e.g., `https://via.placeholder.com/600x150?text=Team+Alpha`)
4. Click **Save Team**
5. Verify the color/image appears on the team card

### Step 3: Test Current Pick Overlay
1. Open browser to `http://localhost:3001/overlay/current`
2. Verify:
   - ✅ Team banner displays (color or image)
   - ✅ Team name shows
   - ✅ Timer counts down from 5:00
   - ✅ Pick number displays
3. Go back to Electron app, make a pick in **Control Panel**
4. Refresh browser overlay (or watch auto-update)
5. Verify overlay updates with new team

### Step 4: Test Draft Board Overlay
1. Open browser to `http://localhost:3001/overlay/board`
2. Verify:
   - ✅ "Remaining Players" section shows undrafted players
   - ✅ Team boards show with colored headers
   - ✅ Team colors match what you set
3. Go to Control Panel, make a few picks
4. Refresh overlay
5. Verify:
   - ✅ Picked players move from "Remaining" to team rosters
   - ✅ Remaining count decreases

### Step 5: Test Team Roster Overlay (Per Team)
1. Find a team ID (e.g., `t1` for Team Alpha):
   - Open DevTools (F12) in Electron app
   - Look in Console or Network → Redux/State if visible
   - Or use team abbreviation: `t1`, `t2`, `t3`
2. Open browser to `http://localhost:3001/overlay/roster/t1`
3. Verify:
   - ✅ Team banner with color/image
   - ✅ Team name
   - ✅ Empty state if no picks
4. Make a pick for that team
5. Refresh overlay
6. Verify:
   - ✅ Numbered player appears (1. Player Name)
7. Make more picks for that team
8. Verify list grows

### Step 6: OBS Integration (Optional)
1. Open OBS Studio
2. Add **Browser Source** to a scene:
   - **URL**: `http://localhost:3001/overlay/current` (or board/roster)
   - **Width**: 1280, **Height**: 720
   - Check "Shutdown source when not visible"
3. Position overlay on canvas
4. Go to Electron Control Panel and make picks
5. Watch overlay update in real-time

---

## 🎨 Customization Tips

### Example Team Colors (Hex Codes)
- Red Team: `#ef4444`
- Blue Team: `#3b82f6`
- Green Team: `#10b981`
- Purple Team: `#8b5cf6`
- Orange Team: `#f97316`

### Example Team Image URLs
- Placeholder: `https://via.placeholder.com/600x150?text=Team+Name`
- Gradient: `https://via.placeholder.com/600x150?text=Team+A&bg=3b82f6&txtclr=fff`
- Custom: Upload to Imgur, CloudFlare, etc. and paste URL

---

## ⚠️ Troubleshooting

### Overlay doesn't update?
- Check browser console (F12) for WebSocket errors
- Verify server is running: `http://localhost:3001/health` should return `{status: "ok"}`
- Reload overlay page to reconnect WebSocket

### Team image doesn't show?
- Verify URL is correct (check in browser address bar)
- Image must support CORS or be same-origin
- Try placeholder URL first: `https://via.placeholder.com/600x150`

### Electron app stuck on "Loading..."?
- Check DevTools (F12) for errors
- Restart: `npm run dev` in new terminal
- Kill existing processes: `taskkill /F /IM electron.exe`

### Timer doesn't count down?
- Make sure `Pick Timer` value in Control Panel > Timer section is set to 300 (5 min)
- Click the Start or Resume button to begin draft

---

## 📝 Next Steps

- **Add Sound Effects**: Create sound files in `/public`, trigger on picks
- **Keyboard Shortcuts**: Press Space to make pick, U to undo
- **Custom Themes**: Edit CSS in overlay HTML generators
- **Database**: Replace JSON file storage with SQL/Firebase for cloud sync
- **Mobile App**: Build React Native version for remote control

---

**You're all set! The app now has:**
✅ Electron desktop app  
✅ Team branding (colors + images)  
✅ Enhanced overlays for OBS  
✅ Real-time WebSocket sync  
✅ Remaining player tracking  
✅ Per-team roster views  

Happy drafting! 🎯
