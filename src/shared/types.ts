// Shared types across the application

export interface OverlayTheme {
  // Fonts
  fontFamily: string;
  headerFontFamily: string;
  
  // Font Sizes
  headerSize: number;      // px - main headers
  titleSize: number;       // px - team names etc
  bodySize: number;        // px - player names
  tagSize: number;         // px - tag labels
  timerSize: number;       // px - countdown timer
  
  // Colors
  backgroundColor: string;
  backgroundGradientEnd: string;
  panelBackground: string;
  textColor: string;
  headerColor: string;
  accentColor: string;
  timerColor: string;
  tagBackground: string;
  tagTextColor: string;
  borderColor: string;

  // Settings
  showTimer: boolean;

  // Theme preset name
  preset: string;
}

export const DEFAULT_OVERLAY_THEME: OverlayTheme = {
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  headerFontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  headerSize: 32,
  titleSize: 48,
  bodySize: 16,
  tagSize: 11,
  timerSize: 72,
  backgroundColor: '#1e3c72',
  backgroundGradientEnd: '#2a5298',
  panelBackground: 'rgba(0, 0, 0, 0.7)',
  textColor: '#ffffff',
  headerColor: '#ffcc00',
  accentColor: '#60a5fa',
  timerColor: '#ff4444',
  tagBackground: 'rgba(96, 165, 250, 0.2)',
  tagTextColor: '#93c5fd',
  borderColor: 'rgba(255, 255, 255, 0.15)',
  showTimer: true,
  preset: 'default',
};

export const OVERLAY_PRESETS: Record<string, Partial<OverlayTheme>> = {
  default: { ...DEFAULT_OVERLAY_THEME },
  dark: {
    backgroundColor: '#0a0a0a',
    backgroundGradientEnd: '#1a1a1a',
    panelBackground: 'rgba(30, 30, 30, 0.95)',
    textColor: '#e0e0e0',
    headerColor: '#ffffff',
    accentColor: '#3b82f6',
    timerColor: '#ef4444',
    tagBackground: 'rgba(59, 130, 246, 0.2)',
    tagTextColor: '#93c5fd',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    preset: 'dark',
  },
  esports: {
    fontFamily: "'Rajdhani', 'Segoe UI', sans-serif",
    headerFontFamily: "'Rajdhani', 'Segoe UI', sans-serif",
    backgroundColor: '#0f0f23',
    backgroundGradientEnd: '#1a0a2e',
    panelBackground: 'rgba(15, 0, 40, 0.9)',
    textColor: '#e0e0ff',
    headerColor: '#00ff88',
    accentColor: '#00ff88',
    timerColor: '#ff3366',
    tagBackground: 'rgba(0, 255, 136, 0.15)',
    tagTextColor: '#00ff88',
    borderColor: 'rgba(0, 255, 136, 0.3)',
    preset: 'esports',
  },
  sports: {
    fontFamily: "'Arial Black', 'Arial', sans-serif",
    headerFontFamily: "'Arial Black', 'Arial', sans-serif",
    backgroundColor: '#1b2838',
    backgroundGradientEnd: '#0d1b2a',
    panelBackground: 'rgba(0, 20, 40, 0.9)',
    textColor: '#ffffff',
    headerColor: '#ffd700',
    accentColor: '#ffd700',
    timerColor: '#ff6b35',
    tagBackground: 'rgba(255, 215, 0, 0.15)',
    tagTextColor: '#ffd700',
    borderColor: 'rgba(255, 215, 0, 0.3)',
    preset: 'sports',
  },
  clean: {
    fontFamily: "'Inter', 'Helvetica', sans-serif",
    headerFontFamily: "'Inter', 'Helvetica', sans-serif",
    backgroundColor: '#f8fafc',
    backgroundGradientEnd: '#e2e8f0',
    panelBackground: 'rgba(255, 255, 255, 0.95)',
    textColor: '#1e293b',
    headerColor: '#0f172a',
    accentColor: '#2563eb',
    timerColor: '#dc2626',
    tagBackground: 'rgba(37, 99, 235, 0.1)',
    tagTextColor: '#2563eb',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    preset: 'clean',
  },
  neon: {
    fontFamily: "'Orbitron', 'Segoe UI', sans-serif",
    headerFontFamily: "'Orbitron', 'Segoe UI', sans-serif",
    backgroundColor: '#000000',
    backgroundGradientEnd: '#0a0020',
    panelBackground: 'rgba(0, 0, 0, 0.85)',
    textColor: '#ffffff',
    headerColor: '#00ffff',
    accentColor: '#ff00ff',
    timerColor: '#00ffff',
    tagBackground: 'rgba(255, 0, 255, 0.2)',
    tagTextColor: '#ff00ff',
    borderColor: 'rgba(0, 255, 255, 0.4)',
    preset: 'neon',
  },
};

export interface Player {
  id: string;
  name: string;
  tags: string[];
  image?: string;
  notes?: string;
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  image?: string; // Team image/banner for overlays
  color?: string; // Hex color code for team branding
  roster: string[]; // Player IDs
  constraints?: Record<string, number>; // tag -> min required count
}

export interface PickConstraint {
  teamId: string;
  playerId: string;
  pickNumber: number;
}

export interface DraftState {
  id: string;
  createdAt: string;
  updatedAt: string;
  players: Player[];
  teams: Team[];
  draftOrder: DraftOrderMode;
  currentPickIndex: number;
  picks: Array<{ teamId: string; playerId: string; pickNumber: number }>;
  isPaused: boolean;
  constraints: Record<string, number>; // Global tag constraints per team
  predefinedPicks: PickConstraint[];
  timerSeconds: number;
  overlayTheme: OverlayTheme;
}

export type DraftOrderMode = 'sequential' | 'random' | 'snake';

export interface DraftEvent {
  type:
    | 'pick-made'
    | 'state-updated'
    | 'timer-tick'
    | 'draft-started'
    | 'draft-paused'
    | 'draft-reset';
  payload: any;
  timestamp: number;
}

export interface OverlayUpdate {
  type: 'current-pick' | 'board' | 'roster';
  data: any;
  timestamp: number;
}
