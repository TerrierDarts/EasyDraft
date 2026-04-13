import { useState } from 'react';
import { useDraftStore } from '../../shared/store';
import { Team } from '../../shared/types';
import { Trash2, Plus, Edit2 } from 'lucide-react';

export default function TeamManager() {
  const draft = useDraftStore((state) => state.draft);
  const addTeam = useDraftStore((state) => state.addTeam);
  const removeTeam = useDraftStore((state) => state.removeTeam);
  const updateTeam = useDraftStore((state) => state.updateTeam);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Team>>({
    name: '',
    constraints: {},
    color: '#3b82f6',
  });

  if (!draft) return null;

  const allTags = Array.from(new Set(draft.players.flatMap((p) => p.tags)));

  const handleOpenModal = (team?: Team) => {
    if (team) {
      setEditingId(team.id);
      setFormData(team);
    } else {
      setEditingId(null);
      setFormData({ name: '', constraints: {} });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name?.trim()) {
      alert('Team name is required');
      return;
    }

    if (editingId) {
      updateTeam(editingId, formData);
    } else {
      addTeam({
        id: Date.now().toString(),
        name: formData.name,
        roster: [],
        constraints: formData.constraints || {},
        color: formData.color || '#3b82f6',
        image: formData.image,
      });
    }

    setShowModal(false);
  };

  const setConstraint = (tag: string, value: number) => {
    const newConstraints = { ...formData.constraints };
    if (value <= 0) {
      delete newConstraints[tag];
    } else {
      newConstraints[tag] = value;
    }
    setFormData({ ...formData, constraints: newConstraints });
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Teams</h2>
        <button
          onClick={() => handleOpenModal()}
          className="button-primary flex items-center gap-2"
        >
          <Plus size={20} /> Add Team
        </button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {draft.teams.map((team) => (
          <div key={team.id} className="bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-hidden">
            {/* Team Color/Image Preview */}
            <div
              className="h-24 mb-4 rounded flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: team.color || '#3b82f6' }}
            >
              {team.image ? (
                <img src={team.image} alt={team.name} className="w-full h-full object-cover" />
              ) : (
                team.name
              )}
            </div>

            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">{team.name}</h3>
                <p className="text-xs text-gray-400">{team.roster.length} players</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(team)}
                  className="p-2 hover:bg-gray-800 rounded"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remove team "${team.name}"?`)) {
                      removeTeam(team.id);
                    }
                  }}
                  className="p-2 hover:bg-red-900 text-red-400 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Constraints */}
            {team.constraints && Object.keys(team.constraints).length > 0 && (
              <div className="bg-gray-800 rounded p-3 text-sm">
                <p className="text-xs text-gray-400 mb-2">Constraints:</p>
                {Object.entries(team.constraints).map(([tag, count]) => (
                  <div key={tag} className="flex justify-between text-xs">
                    <span className="text-blue-300">{tag}</span>
                    <span className="text-gray-400">≥ {count}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Roster Preview */}
            {team.roster.length > 0 && (
              <div className="mt-3 text-sm">
                <p className="text-xs text-gray-400 mb-2">Players:</p>
                <div className="space-y-1">
                  {team.roster.slice(0, 3).map((playerId) => {
                    const player = draft.players.find((p) => p.id === playerId);
                    return (
                      <div key={playerId} className="text-xs text-gray-300">
                        • {player?.name}
                      </div>
                    );
                  })}
                  {team.roster.length > 3 && (
                    <div className="text-xs text-gray-500">
                      ... and {team.roster.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-4">
                {editingId ? 'Edit Team' : 'Add Team'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Team Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input-field"
                    placeholder="Team name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Team Color</label>
                  <input
                    type="color"
                    value={formData.color || '#3b82f6'}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Team Image (Local File)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setFormData({ ...formData, image: event.target?.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="input-field"
                  />
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Team preview"
                      className="mt-2 h-20 object-cover rounded"
                      onError={() => console.error('Failed to load image')}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">
                    Tag Constraints (Minimum players per tag)
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {allTags.map((tag) => (
                      <div key={tag} className="flex items-center gap-2">
                        <label className="text-sm flex-1">{tag}</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={formData.constraints?.[tag] || 0}
                          onChange={(e) =>
                            setConstraint(tag, Number(e.target.value))
                          }
                          className="input-field w-20"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Set to 0 to disable constraint for this tag
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 button-secondary"
                >
                  Cancel
                </button>
                <button onClick={handleSave} className="flex-1 button-primary">
                  Save Team
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
