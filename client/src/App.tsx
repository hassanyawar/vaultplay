import { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { SearchPage } from '@/pages/SearchPage';
import { VaultPage } from '@/pages/VaultPage';
import { DiscoverPage } from '@/pages/DiscoverPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AdminPage } from '@/pages/AdminPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';

type Tab = 'search' | 'vault' | 'discover' | 'dashboard' | 'settings' | 'admin';

const TAB_LABELS: Record<Tab, string> = {
  search: 'Search',
  vault: 'My Vault',
  discover: 'Discover',
  dashboard: 'Dashboard',
  settings: 'Settings',
  admin: 'Admin',
};

function AppShell() {
  const { user, loading, logout } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const [tab, setTab] = useState<Tab>('search');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return authView === 'login'
      ? <LoginPage onGoToRegister={() => setAuthView('register')} />
      : <RegisterPage onGoToLogin={() => setAuthView('login')} />;
  }

  return (
    <div>
      <nav className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 pt-3">
          {(['search', 'vault', 'discover', 'dashboard', 'settings', ...(user.isAdmin ? ['admin' as Tab] : [])] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
                tab === t
                  ? 'bg-background text-foreground border border-b-background border-border -mb-px'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-3 pb-2">
            <span className="text-xs text-muted-foreground">{user.username}</span>
            <button
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              )}
            </button>
            <button
              onClick={() => void logout()}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {tab === 'search' && <SearchPage />}
      {tab === 'vault' && <VaultPage />}
      {tab === 'discover' && <DiscoverPage />}
      {tab === 'dashboard' && <DashboardPage />}
      {tab === 'settings' && <SettingsPage />}
      {tab === 'admin' && user.isAdmin && <AdminPage />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
