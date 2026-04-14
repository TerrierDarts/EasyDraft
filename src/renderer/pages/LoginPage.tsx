import { useState } from 'react';
import { LogIn, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
  onBackClick: () => void;
  isSignup?: boolean;
}

export default function LoginPage({ onLoginSuccess, onBackClick, isSignup = false }: LoginProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // In production, use @react-oauth/google library
      // For now, this is a placeholder
      // You would typically:
      // 1. Initialize Google Sign-In
      // 2. Get the credential from Google
      // 3. Send it to backend
      
      // Mock demo mode
      if (!email) {
        setError('Please enter an email to continue');
        setIsLoading(false);
        return;
      }

      // For testing: create a mock credential
      const mockCredential = btoa(JSON.stringify({
        sub: 'demo-user-' + Math.random().toString(36).substr(2, 9),
        email: email,
        name: email.split('@')[0],
        picture: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(email),
      }));

      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: mockCredential }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLoginSuccess(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative">
      {/* Back Button */}
      <button
        onClick={onBackClick}
        className="absolute top-6 left-6 flex items-center gap-2 text-white hover:text-purple-400 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="text-sm">Back</span>
      </button>

      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">EasyDraft</h1>
          <p className="text-gray-600">{isSignup ? 'Create your account' : 'Sign in to your account'}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading || !email}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <LogIn size={20} />
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Free users get 1 draft. Upgrade for unlimited drafts and more features.
          </p>
        </div>

        <div className="mt-4 space-y-2 text-xs text-gray-600">
          <p className="font-semibold text-gray-700">Demo Credentials:</p>
          <p>You can use any email address to test the app</p>
          <p className="text-blue-600 cursor-pointer hover:underline" onClick={() => setEmail('demo@easydraft.app')}>
            Try: demo@easydraft.app
          </p>
        </div>
      </div>
    </div>
  );
}
