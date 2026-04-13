import React, { useState } from 'react';
import { useDraftStore } from '../../shared/store';
import { Player } from '../../shared/types';
import { Trash2, Plus, Edit2 } from 'lucide-react';

export default function PlayerManager() {
  const draft = useDraftStore((state) => state.draft);
  const addPlayer = useDraftStore((state) => state.addPlayer);
  const removePlayer = useDraftStore((state) => state.removePlayer);
  const updatePlayer = useDraftStore((state) => state.updatePlayer);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Player>>({
    name: '',
    tags: [],
    notes: '',
  });

  if (!draft) return null;

  const handleOpenModal = (player?: Player) => {
    if (player) {
      setEditingId(player.id);
      setFormData(player);
    } else {
      setEditingId(null);
      setFormData({ name: '', tags: [], notes: '' });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name?.trim()) {
      alert('Player name is required');
      return;
    }

    if (editingId) {
      updatePlayer(editingId, formData);
    } else {
      addPlayer({
        id: Date.now().toString(),
        name: formData.name,
        tags: formData.tags || [],
        notes: formData.notes,
      });
    }

    setShowModal(false);
    setFormData({ name: '', tags: [], notes: '' });
  };

  const handleAddTag = (tag: string) => {
    if (tag && !formData.tags?.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tag],
      });
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag),
    });
  };

  const allTags = Array.from(
    new Set(draft.players.flatMap((p) => p.tags))
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Players</h2>
        <button
          onClick={() => handleOpenModal()}
          className="button-primary flex items-center gap-2"
        >
          <Plus size={20} /> Add Player
        </button>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {draft.players.map((player) => {
          const isDrafted = draft.picks.some((p) => p.playerId === player.id);
          return (
            <div
              key={player.id}
              className={`bg-gray-900 border rounded-lg p-4 ${
                isDrafted ? 'border-green-600 opacity-75' : 'border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-lg">{player.name}</h3>
                  {isDrafted && <span className="text-xs text-green-400">✓ Drafted</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(player)}
                    className="p-2 hover:bg-gray-800 rounded"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Remove ${player.name}? ${isDrafted ? 'This player is already drafted.' : ''}`
                        )
                      ) {
                        removePlayer(player.id);
                      }
                    }}
                    className="p-2 hover:bg-red-900 text-red-400 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {player.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-blue-600 bg-opacity-50 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Notes */}
              {player.notes && (
                <p className="text-xs text-gray-400 italic">{player.notes}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-4">
                {editingId ? 'Edit Player' : 'Add Player'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input-field"
                    placeholder="Player name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags?.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleRemoveTag(tag)}
                        className="bg-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        {tag} ×
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="new-tag"
                      className="input-field flex-1"
                      placeholder="Type tag..."
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(
                          'new-tag'
                        ) as HTMLInputElement;
                        if (input?.value) {
                          handleAddTag(input.value);
                          input.value = '';
                        }
                      }}
                      className="button-secondary"
                    >
                      Add
                    </button>
                  </div>

                  {allTags.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-400 mb-2">Existing tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {allTags
                          .filter((t) => !formData.tags?.includes(t))
                          .map((tag) => (
                            <button
                              key={tag}
                              onClick={() => handleAddTag(tag)}
                              className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                            >
                              + {tag}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="input-field"
                    placeholder="Optional notes"
                    rows={3}
                  />
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
                  Save Player
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
