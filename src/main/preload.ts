import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  saveDraft: (draft: any) => ipcRenderer.invoke('save-draft', draft),
  loadDraft: (draftId: string) => ipcRenderer.invoke('load-draft', draftId),
  listDrafts: () => ipcRenderer.invoke('list-drafts'),
  exportDraft: (draftId: string, format: string) =>
    ipcRenderer.invoke('export-draft', draftId, format),
  importDraft: (filePath: string) =>
    ipcRenderer.invoke('import-draft', filePath),
  onDraftUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on('draft-update', (_event, data) => callback(data));
  },
  openUrl: (url: string) => ipcRenderer.invoke('open-url', url),
  syncDraftState: (draft: any) => ipcRenderer.invoke('sync-draft-state', draft),
});
