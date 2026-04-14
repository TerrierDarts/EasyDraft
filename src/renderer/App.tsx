import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import { User } from '../shared/auth-types';

type AppView = 'landing' | 'login' | 'signup' | 'dashboard';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('landing');

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setCurrentView('dashboard');
      } catch (err) {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        setCurrentView('landing');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (_token: string) => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <>
      {currentView === 'landing' && (
        <LandingPage 
          onLoginClick={() => setCurrentView('login')}
          onSignupClick={() => setCurrentView('signup')}
        />
      )}
      {currentView === 'login' && (
        <LoginPage 
          onLoginSuccess={handleLoginSuccess}
          onBackClick={() => setCurrentView('landing')}
        />
      )}
      {currentView === 'signup' && (
        <LoginPage 
          onLoginSuccess={handleLoginSuccess}
          onBackClick={() => setCurrentView('landing')}
          isSignup
        />
      )}
      {currentView === 'dashboard' && user && (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
