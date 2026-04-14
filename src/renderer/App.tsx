import { useEffect, useState } from 'react';
import { useDraftStore } from '../shared/store';
import ControlPanel from './components/ControlPanel';
import PlayerManager from './components/PlayerManager';
import TeamManager from './components/TeamManager';
import DraftBoard from './components/DraftBoard';
import DraftSettings from './components/DraftSettings';
import OverlaySettings from './components/OverlaySettings';
import { DraftState, Player, Team } from '../shared/types';

type TabType = 'control' | 'players' | 'teams' | 'board';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('control');
  const draft = useDraftStore((state) => state.draft);
  const isDirty = useDraftStore((state) => state.isDirty);
  const createDraft = useDraftStore((state) => state.createDraft);

  // Initialize with example data if no draft exists
  useEffect(() => {
    if (!draft) {
      const examplePlayers: Player[] = [
        { id: '1', name: 'Alice Johnson', tags: ['female', 'forward'] },
        { id: '2', name: 'Bob Smith', tags: ['male', 'forward'] },
        { id: '3', name: 'Carol Davis', tags: ['female', 'guard'] },
        { id: '4', name: 'David Lee', tags: ['male', 'guard'] },
        { id: '5', name: 'Eva Wilson', tags: ['female', 'center'] },
        { id: '6', name: 'Frank Brown', tags: ['male', 'center'] },
      ];

      const exampleTeams: Team[] = [
        {
          id: 't1',
          name: 'Team Alpha',
          roster: [],
          constraints: { female: 1 },
        },
        {
          id: 't2',
          name: 'Team Beta',
          roster: [],
          constraints: { female: 1 },
        },
        {
          id: 't3',
          name: 'Team Gamma',
          roster: [],
          constraints: { female: 1 },
        },
      ];

      createDraft(exampleTeams, examplePlayers);
    }
  }, [draft, createDraft]);

  const handleSaveDraft = async () => {
    if (!draft) return;
    
    try {
      const result = await window.electron?.saveDraft(draft);
      if (result?.success) {
        alert('Draft saved successfully!');
      } else {
        alert('Failed to save draft: ' + (result?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleLoadDraft = async () => {
    try {
      const result = await window.electron?.listDrafts();
      if (result?.success && result.drafts.length > 0) {
        const draftId = result.drafts[0].id;
        const loaded = await window.electron?.loadDraft(draftId);
        if (loaded?.success) {
          useDraftStore.setState({ draft: loaded.data, isDirty: false });
          alert('Draft loaded successfully!');
        }
      } else {
        alert('No drafts found');
      }
    } catch (error) {
      console.error('Load error:', error);
    }
  };

  const handleExportDraft = async (format: 'json' | 'csv') => {
    if (!draft) return;
    
    try {
      const result = await window.electron?.exportDraft(draft.id, format);
      if (result?.success) {
        const blob = new Blob([result.data], {
          type: format === 'json' ? 'application/json' : 'text/csv',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `draft-${draft.id}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  if (!draft) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">⚙️ Loading EasyDraft...</h1>
          <p className="text-gray-400">Initializing application</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-blue-400">EasyDraft</h1>
          <p className="text-xs text-gray-400 mt-1">Draft Management System</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {(
            [
              { id: 'control', label: '🎯 Control Panel', icon: '📊' },
              { id: 'board', label: '📋 Draft Board', icon: '📈' },
              { id: 'players', label: '👥 Players', icon: '🎮' },
              { id: 'teams', label: '🏆 Teams', icon: '⚡' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Settings Buttons */}
        <div className="px-4 py-2 border-t border-gray-800 space-y-1">
          <DraftSettings />
          <OverlaySettings />
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <button
            onClick={handleSaveDraft}
            className="w-full button-primary text-sm"
            title={isDirty ? 'Unsaved changes' : 'All saved'}
          >
            💾 Save {isDirty ? '*' : ''}
          </button>
          <button
            onClick={handleLoadDraft}
            className="w-full button-secondary text-sm"
          >
            📂 Load
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => handleExportDraft('json')}
              className="flex-1 button-secondary text-xs"
            >
              JSON
            </button>
            <button
              onClick={() => handleExportDraft('csv')}
              className="flex-1 button-secondary text-xs"
            >
              CSV
            </button>
          </div>
        </div>

        {/* Overlay Links */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <p className="text-xs font-semibold text-gray-400 mb-2">📺 OBS Overlays</p>
          <button
            onClick={() => window.electron?.openUrl('http://localhost:3001/overlay/current')}
            className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors"
            title="Open Current Pick overlay in browser"
          >
            🎯 Current Pick
          </button>
          <button
            onClick={() => window.electron?.openUrl('http://localhost:3001/overlay/board')}
            className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors"
            title="Open Draft Board overlay in browser"
          >
            📋 Draft Board
          </button>
          <button
            onClick={() => {
              if (draft?.teams && draft.teams.length > 0) {
                const teamId = draft.teams[0].id;
                window.electron?.openUrl(`http://localhost:3001/overlay/roster/${teamId}`);
              } else {
                alert('No teams available');
              }
            }}
            className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors"
            title="Open Team Roster overlay in browser"
          >
            🏆 Team Roster
          </button>
        </div>

        {/* Server Info */}
        <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
          <p>🔗 Server: localhost:3001</p>
          <p className="mt-1">✅ Ready for OBS</p>
          
          {/* Support Links */}
          <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
            <p className="text-xs font-semibold text-gray-400 mb-2">💜 Support</p>
            <a
              href="https://x.com/TerrierDarts"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2 px-2 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors"
              title="Follow on X/Twitter"
            >
              𝕏 Twitter
            </a>
            <a
              href="https://www.twitch.tv/codewithTD"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2 px-2 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors"
              title="Follow on Twitch"
            >
              📺 Twitch
            </a>
            <a
              href="https://www.paypal.com/paypalme/terrierdarts"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2 px-2 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors"
              title="Support via PayPal"
            >
              💳 PayPal
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'control' && <ControlPanel />}
        {activeTab === 'board' && <DraftBoard />}
        {activeTab === 'players' && <PlayerManager />}
        {activeTab === 'teams' && <TeamManager />}
      </div>
    </div>
  );
}

declare global {
  interface Window {
    electron?: {
      saveDraft: (draft: DraftState) => Promise<any>;
      loadDraft: (draftId: string) => Promise<any>;
      listDrafts: () => Promise<any>;
      exportDraft: (draftId: string, format: string) => Promise<any>;
      importDraft: (filePath: string) => Promise<any>;
      openUrl: (url: string) => Promise<any>;
      openFolder: (folderPath: string) => Promise<any>;
      syncDraftState: (draft: DraftState) => Promise<any>;
    };
  }
}
