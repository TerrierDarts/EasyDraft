import { create } from 'zustand';
import { DraftState, Player, Team, DraftOrderMode, OverlayTheme, DEFAULT_OVERLAY_THEME } from './types';

// Helper to sync draft state to overlay server
function syncToServer(draft: DraftState | null) {
  if (!draft) return;
  // Use IPC if in Electron (main app)
  if ((window as any).electron?.syncDraftState) {
    (window as any).electron.syncDraftState(draft);
  }
  // Also POST to server as fallback
  fetch('http://localhost:3001/api/draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(draft),
  }).catch(() => { /* server may not be ready yet */ });
}

interface DraftStore {
  draft: DraftState | null;
  isDirty: boolean;
  
  // Actions
  createDraft: (teams: Team[], players: Player[]) => void;
  loadDraft: (draftState: DraftState) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  addTeam: (team: Team) => void;
  removeTeam: (teamId: string) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  setDraftOrder: (mode: DraftOrderMode) => void;
  startDraft: () => void;
  pauseDraft: () => void;
  resumeDraft: () => void;
  resetDraft: () => void;
  makePick: (teamId: string, playerId: string) => void;
  undoLastPick: () => void;
  setConstraints: (constraints: Record<string, number>) => void;
  setTimerSeconds: (seconds: number) => void;
  tickTimer: () => void;
  setOverlayTheme: (theme: OverlayTheme) => void;
}

export const useDraftStore = create<DraftStore>((set) => ({
  draft: null,
  isDirty: false,

  createDraft: (teams, players) => {
    const newDraft: DraftState = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      players,
      teams,
      draftOrder: 'sequential',
      currentPickIndex: 0,
      picks: [],
      isPaused: false,
      constraints: {},
      predefinedPicks: [],
      timerSeconds: 300,
      overlayTheme: { ...DEFAULT_OVERLAY_THEME },
    };
    set({ draft: newDraft, isDirty: true });
  },

  loadDraft: (draftState) => {
    set({ draft: draftState, isDirty: false });
  },

  addPlayer: (player) => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          players: [...state.draft.players, player],
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      };
    });
  },

  removePlayer: (playerId) => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          players: state.draft.players.filter((p) => p.id !== playerId),
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      };
    });
  },

  updatePlayer: (playerId, updates) => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          players: state.draft.players.map((p) =>
            p.id === playerId ? { ...p, ...updates } : p
          ),
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      };
    });
  },

  addTeam: (team) => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          teams: [...state.draft.teams, team],
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      };
    });
  },

  removeTeam: (teamId) => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          teams: state.draft.teams.filter((t) => t.id !== teamId),
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      };
    });
  },

  updateTeam: (teamId, updates) => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          teams: state.draft.teams.map((t) =>
            t.id === teamId ? { ...t, ...updates } : t
          ),
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      };
    });
  },

  setDraftOrder: (mode) => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          draftOrder: mode,
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      };
    });
  },

  startDraft: () => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          isPaused: false,
          currentPickIndex: 0,
          picks: [],
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      };
    });
  },

  pauseDraft: () => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          isPaused: true,
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      };
    });
  },

  resumeDraft: () => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          isPaused: false,
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      };
    });
  },

  resetDraft: () => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          currentPickIndex: 0,
          picks: [],
          isPaused: false,
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      };
    });
  },

  makePick: (teamId, playerId) => {
    set((state) => {
      if (!state.draft) return state;
      const newPicks = [
        ...state.draft.picks,
        { teamId, playerId, pickNumber: state.draft.picks.length + 1 },
      ];
      const updatedTeams = state.draft.teams.map((t) =>
        t.id === teamId
          ? { ...t, roster: [...(t.roster || []), playerId] }
          : t
      );
      return {
        draft: {
          ...state.draft,
          picks: newPicks,
          teams: updatedTeams,
          currentPickIndex: state.draft.currentPickIndex + 1,
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      };
    });
  },

  undoLastPick: () => {
    set((state) => {
      if (!state.draft || state.draft.picks.length === 0) return state;
      const lastPick = state.draft.picks[state.draft.picks.length - 1];
      const updatedTeams = state.draft.teams.map((t) =>
        t.id === lastPick.teamId
          ? { ...t, roster: t.roster.filter((id) => id !== lastPick.playerId) }
          : t
      );
      return {
        draft: {
          ...state.draft,
          picks: state.draft.picks.slice(0, -1),
          teams: updatedTeams,
          currentPickIndex: Math.max(0, state.draft.currentPickIndex - 1),
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      };
    });
  },

  setConstraints: (constraints) => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          constraints,
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      };
    });
  },

  setTimerSeconds: (seconds) => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          timerSeconds: seconds,
          updatedAt: new Date().toISOString(),
        },
        isDirty: false, // Don't mark as dirty for timer changes
      };
    });
  },

  tickTimer: () => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          timerSeconds: Math.max(0, state.draft.timerSeconds - 1),
        },
        isDirty: false,
      };
    });
  },

  setOverlayTheme: (theme) => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          overlayTheme: theme,
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      };
    });
  },
}));

// Auto-sync draft state to overlay server whenever it changes
useDraftStore.subscribe((state, prevState) => {
  if (state.draft && state.draft !== prevState.draft) {
    syncToServer(state.draft);
  }
});
