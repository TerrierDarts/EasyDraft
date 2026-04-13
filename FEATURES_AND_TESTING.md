# EasyDraft Complete Testing Guide

## 🚀 Quick Start

```bash
npm run dev
```

This launches:
- **Electron App** on main window (http://localhost:5173)
- **Express Server** on localhost:3001
- **Three OBS Overlays** (accessible as browser sources)

---

## ✅ Features Implemented

### 1. **Team Management with Images & Colors**
- ✅ Add/Edit/Delete teams
- ✅ **Upload local image files** (PNG, JPG, etc.) - converts to base64
- ✅ Pick team color with color picker
- ✅ Set tag constraints (min players per tag)
- ✅ View team rosters on card preview

### 2. **Player Management**
- ✅ Add/Edit/Delete players
- ✅ Tag system (female, male, forward, guard, center, etc.)
- ✅ Auto-suggest existing tags
- ✅ Track drafted status with checkmark

### 3. **Draft Control Panel**
- ✅ Three draft order modes: Sequential, Random, Snake
- ✅ Start/Pause/Resume/Reset
- ✅ Make picks with constraint validation
- ✅ Undo last pick
- ✅ **Countdown timer displays team image & name**
- ✅ Warning alerts for constraint violations
- ✅ Recent picks history

### 4. **OBS Overlay Enhancements**
- ✅ **Current Pick**: Shows team image, name, color, countdown timer
- ✅ **Draft Board**: Shows all remaining (undrafted) players + team rosters
- ✅ **Team Roster**: Individual team view with image, color, picked players
- ✅ Real-time WebSocket sync across all overlays
- ✅ Self-contained HTML (no external dependencies)

### 5. **Data Persistence**
- ✅ Save/Load/Export drafts (JSON, CSV)
- ✅ Local file storage in user directory
- ✅ Images embedded as base64 in JSON

---

## 🧪 Quick Test Walkthrough

### Step 1: Create Teams with Images
1. Start app: `npm run dev`
2. Click **👥 Players** tab
3. Click **🏆 Add Team**
4. Fill in:
   - Team Name: "Team Alpha"
   - Color: Pick any color
   - Image: **Upload a PNG or JPG file from your computer**
   - Constraints: Set "female" = 1
5. Click "Save Team"
6. Repeat for 2-3 more teams

### Step 2: Add Players
1. Still in **Players** tab
2. Click **➕ Add Player**
3. Fill in:
   - Name: "Alice Johnson"
   - Tags: female, forward
4. Click "Save Player"
5. Add 4-6 more players with mix of tags

### Step 3: Test Draft Control
1. Click **🎯 Control Panel** tab
2. Set draft order (e.g., Sequential)
3. Click **▶️ Start Draft**
4. Click a player to make a pick
5. Watch **team image + name appear on timer**
6. Use +/- to adjust timer
7. Click **↶ Undo** to reverse a pick

### Step 4: Test OBS Overlays

**In your browser (or OBS Browser Source):**

1. **Current Pick**: `http://localhost:3001/overlay/current`
   - Should show team color, image, countdown timer
   - Updates when you make picks

2. **Draft Board**: `http://localhost:3001/overlay/board`
   - Shows all remaining players
   - Shows team rosters below

3. **Team Roster**: `http://localhost:3001/overlay/roster/t1`
   - Shows Team Alpha roster only
   - Displays team image and color
   - Lists picked players

---

## 📱 OBS Integration Steps

1. **Open OBS**
2. **Add Browser Source** (for Current Pick overlay):
   - Click "+" under Sources
   - Select "Browser"
   - Name: "EasyDraft Current Pick"
   - URL: `http://localhost:3001/overlay/current`
   - Width: 1280, Height: 720
3. **Repeat** for Draft Board and Team Roster overlays with respective URLs
4. **Position** overlays on your stream layout
5. **Start draft** in Electron app
6. Watch overlays update in real-time as picks are made

---

## 🎨 Key New Features

### Team Image Upload
- File input in Team modal accepts local images
- Automatically converts to base64 data URL
- Stored with draft (no external URLs needed)
- Displayed in all overlays (Current Pick, Roster)

### Team Color Selection
- Color picker in Team modal
- Displays in overlay backgrounds
- Used to identify teams visually

### Enhanced Current Pick Overlay
- Large team image display
- Team name and color
- Countdown timer in large text
- Shows whose turn it is

### Enhanced Draft Board
- Lists all **remaining players** (not drafted)
- Shows team rosters with player names
- Organized layout for viewing

### Individual Team Roster
- Solo view of one team
- Shows picked players only
- Team branding (image + color)
- Use different URL for each team: `/overlay/roster/t1`, `/overlay/roster/t2`, etc.

---

## 💾 Save/Load/Export

- **Save**: Sidebar button saves draft to local storage
- **Load**: Loads last saved draft (or pick from list)
- **Export JSON**: Full draft as JSON file
- **Export CSV**: Pick history as CSV

---

## ✨ Testing Checklist

- [ ] Add team with local image upload
- [ ] Pick team color
- [ ] Set constraints on tags
- [ ] Add 6+ players with mixed tags
- [ ] Start draft in Sequential mode
- [ ] Make a pick and verify constraint
- [ ] Check Current Pick overlay shows team image
- [ ] Check Draft Board shows remaining players
- [ ] Check Team Roster shows correct team
- [ ] Undo a pick
- [ ] Save draft
- [ ] Load draft and verify it restored
- [ ] Export to JSON
- [ ] Export to CSV

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Image not showing in upload | Ensure file is PNG/JPG and < 10MB |
| Overlay blank in browser | Check if `http://localhost:3001` is accessible |
| Timer not showing team image | Ensure team image was uploaded before starting draft |
| WebSocket errors in console | Server may have crashed; restart with `npm run dev` |
| Constraint not enforced | Check tag name matches exactly (case-sensitive) |

---

## 📁 File Locations

- **Main App**: `src/renderer/App.tsx`
- **Team Manager**: `src/renderer/components/TeamManager.tsx` (image upload logic)
- **Draft Control**: `src/renderer/components/ControlPanel.tsx`
- **Overlays**: `src/server/index.ts` (HTML generators)
- **Saved Drafts**: `~/.easydraft/drafts/` (user directory)

---

Enjoy! 🎯🏆

