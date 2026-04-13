import { useState } from 'react';
import { useDraftStore } from '../../shared/store';
import { DraftOrderMode } from '../../shared/types';
import { Settings } from 'lucide-react';

export default function DraftSettings() {
  const draft = useDraftStore((state) => state.draft);
  const setDraftOrder = useDraftStore((state) => state.setDraftOrder);
  const setTimerSeconds = useDraftStore((state) => state.setTimerSeconds);
  const [showModal, setShowModal] = useState(false);

  if (!draft) return null;

  const draftModes: { value: DraftOrderMode; label: string; description: string }[] = [
    { value: 'sequential', label: 'Sequential', description: 'Same order every round' },
    { value: 'random', label: 'Random', description: 'Randomize order each round' },
    { value: 'snake', label: 'Snake', description: 'Reverse order alternating rounds' },
  ];

  const timerOptions = [30, 60, 120, 180, 300, 600];

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full px-4 py-3 rounded-lg font-medium transition-colors text-gray-300 hover:bg-gray-800 flex items-center gap-2"
      >
        <Settings size={18} /> Draft Settings
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-6">Draft Settings</h3>

              <div className="space-y-6">
                {/* Draft Order */}
                <div>
                  <label className="block text-sm font-medium mb-3">Draft Order Mode</label>
                  <div className="space-y-2">
                    {draftModes.map((mode) => (
                      <div
                        key={mode.value}
                        onClick={() => setDraftOrder(mode.value)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors border-2 ${
                          draft.draftOrder === mode.value
                            ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                            : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                        }`}
                      >
                        <div className="font-medium">{mode.label}</div>
                        <div className="text-xs text-gray-400">{mode.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timer Settings */}
                <div>
                  <label className="block text-sm font-medium mb-3">Pick Timer (seconds)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {timerOptions.map((seconds) => (
                      <button
                        key={seconds}
                        onClick={() => setTimerSeconds(seconds)}
                        className={`p-3 rounded-lg font-medium transition-colors ${
                          draft.timerSeconds === seconds
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {seconds}s
                      </button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs text-gray-400 mb-2">Custom Duration</label>
                    <input
                      type="number"
                      min="1"
                      max="3600"
                      value={draft.timerSeconds}
                      onChange={(e) => setTimerSeconds(Number(e.target.value))}
                      className="input-field w-full"
                      placeholder="Enter seconds"
                    />
                  </div>
                </div>

                {/* Current Settings Display */}
                <div className="bg-gray-800 rounded p-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Mode:</span>
                    <span className="font-medium capitalize">{draft.draftOrder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Timer Duration:</span>
                    <span className="font-medium">{draft.timerSeconds} seconds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Teams:</span>
                    <span className="font-medium">{draft.teams.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Players:</span>
                    <span className="font-medium">{draft.players.length}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 button-primary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
