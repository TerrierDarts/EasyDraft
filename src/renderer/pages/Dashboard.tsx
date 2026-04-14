import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, LogOut } from 'lucide-react';
import { User, Draft } from '../../shared/auth-types';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newDraftName, setNewDraftName] = useState('');
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/drafts', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to load drafts');
      }

      const data = await response.json();
      setDrafts(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load drafts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDraftName.trim()) {
      setError('Draft name is required');
      return;
    }

    // Check if user can create more drafts
    if (user.subscriptionTier === 'free' && drafts.length >= user.maxDrafts) {
      setError(`Free users can only have ${user.maxDrafts} draft. Upgrade to create more!`);
      return;
    }

    try {
      setIsCreating(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newDraftName }),
      });

      if (!response.ok) {
        throw new Error('Failed to create draft');
      }

      const newDraft = await response.json();
      setDrafts([...drafts, newDraft]);
      setNewDraftName('');
      setShowCreateForm(false);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create draft');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!window.confirm('Are you sure you want to delete this draft?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to delete draft');
      }

      setDrafts(drafts.filter(d => d.id !== draftId));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete draft');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">EasyDraft</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {user.picture && (
                <img 
                  src={user.picture} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div>
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">
                  {user.subscriptionTier === 'free' ? '🎁 Free Plan' : '⭐ ' + user.subscriptionTier}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {user.name.split(' ')[0]}!</h2>
          <p className="text-gray-600">
            {user.subscriptionTier === 'free' 
              ? `You have ${user.maxDrafts - drafts.length} draft slot remaining. Upgrade to create more drafts.`
              : 'Create and manage your drafts for OBS overlays.'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            {error}
          </div>
        )}

        {/* Create Draft Section */}
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={user.subscriptionTier === 'free' && drafts.length >= user.maxDrafts}
            className="mb-8 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            <Plus size={20} />
            New Draft
          </button>
        ) : (
          <form onSubmit={handleCreateDraft} className="mb-8 bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newDraftName}
                onChange={(e) => setNewDraftName(e.target.value)}
                placeholder="Enter draft name (e.g., 'Spring 2026 Draft')"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                autoFocus
              />
              <button
                type="submit"
                disabled={isCreating}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-400"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewDraftName('');
                }}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Drafts Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : drafts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No drafts yet</p>
            <p className="text-gray-400 mb-6">Create your first draft to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Plus size={20} />
              Create First Draft
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drafts.map((draft) => (
              <div key={draft.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{draft.name}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Updated {new Date(draft.updatedAt).toLocaleDateString()}
                </p>
                
                <div className="flex gap-2">
                  <a
                    href={`/draft/${draft.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
                  >
                    <Edit2 size={16} />
                    Open
                  </a>
                  <button
                    onClick={() => handleDeleteDraft(draft.id)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg transition-colors text-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upgrade CTA for free users */}
        {user.subscriptionTier === 'free' && (
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-2">Ready for more?</h3>
            <p className="mb-6 text-blue-100">Upgrade to create unlimited drafts and unlock premium features</p>
            <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
              Upgrade to Pro
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
