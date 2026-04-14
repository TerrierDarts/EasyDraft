import { app, BrowserWindow, Menu, ipcMain, shell } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import { startServer, broadcastDraftUpdate } from '../server';
import { DataManager } from './data-manager';

let mainWindow: BrowserWindow | null = null;
let dataManager: DataManager;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
    },
    icon: path.join(__dirname, '../../public/icon.png'),
  });

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../renderer/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.on('ready', async () => {
  dataManager = new DataManager();
  await dataManager.init();

  // Start overlay server
  startServer(dataManager);

  createWindow();

  // Create application menu
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        {
          label: 'Toggle DevTools',
          accelerator: 'F12',
          click: () => mainWindow?.webContents.toggleDevTools(),
        },
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers for file operations
ipcMain.handle('save-draft', async (_event, draftData) => {
  void _event;
  try {
    await dataManager.saveDraft(draftData);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('load-draft', async (_event, draftId) => {
  void _event;
  try {
    const data = await dataManager.loadDraft(draftId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('list-drafts', async () => {
  try {
    const drafts = await dataManager.listDrafts();
    return { success: true, drafts };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('export-draft', async (_event, draftId, format) => {
  void _event;
  try {
    const exported = await dataManager.exportDraft(draftId, format);
    return { success: true, data: exported };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('import-draft', async (_event, filePath) => {
  void _event;
  try {
    const imported = await dataManager.importDraft(filePath);
    return { success: true, data: imported };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

export function getMainWindow() {
  return mainWindow;
}

// IPC handler: open URL in default browser
ipcMain.handle('open-url', async (_event, url: string) => {
  void _event;
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// IPC handler: open folder in file explorer
ipcMain.handle('open-folder', async (_event, folderPath: string) => {
  void _event;
  try {
    await shell.openPath(folderPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// IPC handler: sync draft state to overlay server
ipcMain.handle('sync-draft-state', async (_event, draftData) => {
  void _event;
  try {
    broadcastDraftUpdate(draftData);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});
