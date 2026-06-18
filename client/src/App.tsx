import { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SearchPage } from '@/pages/SearchPage';
import { VaultPage } from '@/pages/VaultPage';
import { DiscoverPage } from '@/pages/DiscoverPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';

type Tab = 'search' | 'vault' | 'discover' | 'dashboard' | 'settings';

const TAB_LABELS: Record<Tab, string> = {
  search: 'Search',
  vault: 'My Vault',
  discover: 'Discover',
  dashboard: 'Dashboard',
  settings: 'Settings',
};

function AppShell() {
  const { user, loading, logout } = useAuth();
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
          {(['search', 'vault', 'discover', 'dashboard', 'settings'] as Tab[]).map((t) => (
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
            <span className="text-xs text-muted-foreground">{user.email}</span>
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
