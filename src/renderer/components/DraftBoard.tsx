import React from 'react';
import { useDraftStore } from '../../shared/store';

export default function DraftBoard() {
  const draft = useDraftStore((state) => state.draft);

  if (!draft) return null;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Draft Board</h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-sm text-gray-400">Total Picks</p>
          <p className="text-2xl font-bold text-blue-400">{draft.picks.length}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-sm text-gray-400">Remaining Players</p>
          <p className="text-2xl font-bold text-green-400">
            {draft.players.length - draft.picks.length}
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-sm text-gray-400">Draft Mode</p>
          <p className="text-2xl font-bold text-purple-400 capitalize">
            {draft.draftOrder}
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-sm text-gray-400">Status</p>
          <p className="text-2xl font-bold text-yellow-400">
            {draft.isPaused ? 'Paused' : draft.picks.length === 0 ? 'Ready' : 'Active'}
          </p>
        </div>
      </div>

      {/* Teams Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {draft.teams.map((team) => (
          <div
            key={team.id}
            className="bg-gray-900 border border-gray-800 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{team.name}</h3>
              <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                {team.roster.length} / {Math.ceil(draft.players.length / draft.teams.length)}
              </span>
            </div>

            {/* Constraint Status */}
            {team.constraints && Object.keys(team.constraints).length > 0 && (
              <div className="mb-4 p-3 bg-gray-800 rounded">
                <p className="text-xs text-gray-400 mb-2">Constraints:</p>
                {Object.entries(team.constraints).map(([tag, required]) => {
                  const currentCount = team.roster
                    .map((pid) => draft.players.find((p) => p.id === pid))
                    .filter((p) => p && p.tags.includes(tag)).length;

                  const status =
                    currentCount >= required ? '✓' : '○';
                  const statusColor =
                    currentCount >= required ? 'text-green-400' : 'text-yellow-400';

                  return (
                    <div
                      key={tag}
                      className="flex items-center justify-between text-sm mb-2"
                    >
                      <span>
                        <span className={statusColor}>{status}</span> {tag}: {currentCount}/{required}
                      </span>
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            currentCount >= required ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                          style={{
                            width: `${Math.min((currentCount / required) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Player List */}
            <div className="space-y-2">
              {team.roster.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No players drafted yet</p>
              ) : (
                team.roster.map((playerId, idx) => {
                  const player = draft.players.find((p) => p.id === playerId);
                  return (
                    <div
                      key={playerId}
                      className="flex items-center gap-3 bg-gray-800 p-3 rounded"
                    >
                      <span className="text-xs font-bold text-gray-500 w-6">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold">{player?.name}</p>
                        <p className="text-xs text-gray-400">
                          {player?.tags.join(', ')}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Full Pick History */}
      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Full Pick History</h3>

        {draft.picks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No picks yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-2 text-gray-400">#</th>
                  <th className="text-left p-2 text-gray-400">Team</th>
                  <th className="text-left p-2 text-gray-400">Player</th>
                  <th className="text-left p-2 text-gray-400">Tags</th>
                </tr>
              </thead>
              <tbody>
                {draft.picks.map((pick, idx) => {
                  const team = draft.teams.find((t) => t.id === pick.teamId);
                  const player = draft.players.find((p) => p.id === pick.playerId);
                  return (
                    <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="p-2 text-blue-400 font-semibold">{idx + 1}</td>
                      <td className="p-2">{team?.name}</td>
                      <td className="p-2 font-semibold">{player?.name}</td>
                      <td className="p-2 text-xs text-gray-400">
                        {player?.tags.join(', ')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
