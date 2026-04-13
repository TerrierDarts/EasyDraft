import React, { useEffect, useState } from 'react';
import { useDraftStore } from '../../shared/store';
import { createDraftEngine } from '../../shared/draft-engine';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

export default function ControlPanel() {
  const draft = useDraftStore((state) => state.draft);
  const makePick = useDraftStore((state) => state.makePick);
  const startDraft = useDraftStore((state) => state.startDraft);
  const pauseDraft = useDraftStore((state) => state.pauseDraft);
  const resumeDraft = useDraftStore((state) => state.resumeDraft);
  const resetDraft = useDraftStore((state) => state.resetDraft);
  const undoLastPick = useDraftStore((state) => state.undoLastPick);
  const setTimerSeconds = useDraftStore((state) => state.setTimerSeconds);
  const tickTimer = useDraftStore((state) => state.tickTimer);

  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  if (!draft) return null;

  const engine = createDraftEngine(draft);
  const currentTeam = engine.getCurrentTeam();
  const availablePlayers = engine.getAvailablePlayers();
  const constrainedPlayers = currentTeam
    ? engine.getConstrainedPlayers(currentTeam.id)
    : [];

  // Timer loop
  useEffect(() => {
    if (!draft.isPaused && draft.timerSeconds > 0) {
      const interval = setInterval(() => {
        tickTimer();
      }, 1000);
      setTimerInterval(interval);
      return () => clearInterval(interval);
    }
  }, [draft.isPaused, draft.timerSeconds, tickTimer]);

  const handleStartDraft = () => {
    startDraft();
    setSelectedPlayer(null);
  };

  const handleMakePick = () => {
    if (!currentTeam || !selectedPlayer) return;

    const player = draft.players.find((p) => p.id === selectedPlayer);
    if (!player) return;

    // Check constraints
    const isValid = engine.isPickValid(currentTeam.id, selectedPlayer);
    const warning = engine.getPickWarning(currentTeam.id, selectedPlayer);

    if (!isValid) {
      alert('Invalid pick: Player already drafted or constraint violated');
      return;
    }

    if (warning && !confirm(warning + '\n\nContinue anyway?')) {
      return;
    }

    makePick(currentTeam.id, selectedPlayer);
    setSelectedPlayer(null);
    setTimerSeconds(300); // Reset timer to 5 minutes
  };

  const handleNextPick = () => {
    if (!currentTeam) return;
    const nextAvailable = availablePlayers[0];
    if (nextAvailable) {
      setSelectedPlayer(nextAvailable);
    }
  };

  const remainingPlayers = draft.players.length - draft.picks.length;
  const progress = ((draft.picks.length / draft.players.length) * 100) || 0;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6">
          <p className="text-sm text-blue-200 mb-2">Current Pick</p>
          <p className="text-4xl font-bold text-white">{draft.picks.length + 1}</p>
          <p className="text-xs text-blue-300 mt-2">of {draft.players.length}</p>
        </div>

        <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-6">
          <p className="text-sm text-green-200 mb-2">On The Clock</p>
          <p className="text-3xl font-bold text-white">
            {currentTeam?.name || 'Waiting'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6">
          <p className="text-sm text-purple-200 mb-2">Remaining</p>
          <p className="text-4xl font-bold text-white">{remainingPlayers}</p>
          <p className="text-xs text-purple-300 mt-2">Players left</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Draft Progress</span>
          <span className="text-blue-400">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Player Selection */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-bold mb-4">Select Player to Draft</h3>

        {/* Constrained Players Alert */}
        {constrainedPlayers.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-900 bg-opacity-50 border border-yellow-700 rounded-lg">
            <p className="text-sm text-yellow-300">
              ⚠️ <strong>{currentTeam?.name}</strong> must draft:
            </p>
            <p className="text-xs text-yellow-200 mt-1">
              {constrainedPlayers.map((pid) => draft.players.find((p) => p.id === pid)?.name).join(', ')}
            </p>
          </div>
        )}

        {/* Available Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {availablePlayers.map((playerId) => {
            const player = draft.players.find((p) => p.id === playerId);
            if (!player) return null;

            const isConstrained = constrainedPlayers.includes(playerId);

            return (
              <button
                key={playerId}
                onClick={() => setSelectedPlayer(playerId)}
                className={`p-4 rounded-lg text-left transition-all ${
                  selectedPlayer === playerId
                    ? 'bg-blue-600 border-2 border-blue-400'
                    : 'bg-gray-800 border border-gray-700 hover:border-gray-600'
                } ${isConstrained ? 'ring-2 ring-yellow-500' : ''}`}
              >
                <div className="font-semibold">{player.name}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {player.tags.join(', ')}
                </div>
              </button>
            );
          })}
        </div>

        {availablePlayers.length === 0 && (
          <p className="text-center text-gray-500 py-8">Draft Complete! 🎉</p>
        )}
      </div>

      {/* Timer & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-bold mb-4">Pick Timer</h3>
          <div className="text-6xl font-mono font-bold text-center mb-4 text-red-400">
            {Math.floor(draft.timerSeconds / 60)}:
            {(draft.timerSeconds % 60).toString().padStart(2, '0')}
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="30"
              max="600"
              step="15"
              value={draft.timerSeconds}
              onChange={(e) => setTimerSeconds(Number(e.target.value))}
              className="w-full"
              disabled={!draft.isPaused}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setTimerSeconds(Math.max(0, draft.timerSeconds - 30))}
                className="flex-1 button-secondary"
              >
                -30s
              </button>
              <button
                onClick={() => setTimerSeconds(draft.timerSeconds + 30)}
                className="flex-1 button-secondary"
              >
                +30s
              </button>
            </div>
          </div>
        </div>

        {/* Draft Controls */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-bold mb-4">Draft Controls</h3>
          <div className="space-y-3">
            {!draft.isPaused && draft.picks.length === 0 ? (
              <button
                onClick={handleStartDraft}
                className="w-full button-primary flex items-center justify-center gap-2"
              >
                <Play size={20} /> Start Draft
              </button>
            ) : (
              <>
                <button
                  onClick={draft.isPaused ? resumeDraft : pauseDraft}
                  className="w-full button-secondary flex items-center justify-center gap-2"
                >
                  {draft.isPaused ? (
                    <>
                      <Play size={20} /> Resume
                    </>
                  ) : (
                    <>
                      <Pause size={20} /> Pause
                    </>
                  )}
                </button>
                <button
                  onClick={resetDraft}
                  className="w-full button-secondary flex items-center justify-center gap-2"
                >
                  <RotateCcw size={20} /> Reset
                </button>
              </>
            )}

            <button
              onClick={handleMakePick}
              disabled={!selectedPlayer || !currentTeam}
              className="w-full button-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✓ Make Pick
            </button>

            <button
              onClick={handleNextPick}
              className="w-full button-secondary flex items-center justify-center gap-2"
            >
              <SkipForward size={20} /> Auto-Select Next
            </button>

            {draft.picks.length > 0 && (
              <button
                onClick={undoLastPick}
                className="w-full button-danger"
              >
                ↶ Undo Last Pick
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recent Picks */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-bold mb-4">Recent Picks</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {[...draft.picks].reverse().slice(0, 10).map((pick, idx) => {
            const team = draft.teams.find((t) => t.id === pick.teamId);
            const player = draft.players.find((p) => p.id === pick.playerId);
            return (
              <div key={idx} className="flex items-center justify-between bg-gray-800 p-3 rounded">
                <span className="text-sm text-gray-400">Pick #{pick.pickNumber}</span>
                <span className="font-semibold">{player?.name}</span>
                <span className="text-sm text-blue-400">{team?.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
