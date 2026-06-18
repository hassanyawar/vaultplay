import { useState } from 'react';
import { Search, Archive, Compass, BarChart2, Settings2, ShieldCheck, type LucideIcon } from 'lucide-react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SearchPage } from '@/pages/SearchPage';
import { VaultPage } from '@/pages/VaultPage';
import { DiscoverPage } from '@/pages/DiscoverPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AdminPage } from '@/pages/AdminPage';
import { AuthPage } from '@/pages/AuthPage';

type Tab = 'search' | 'vault' | 'discover' | 'dashboard' | 'settings' | 'admin';

const TAB_LABELS: Record<Tab, string> = {
  search: 'Search',
  vault: 'My Vault',
  discover: 'Discover',
  dashboard: 'Dashboard',
  settings: 'Settings',
  admin: 'Admin',
};

const BOTTOM_NAV_LABELS: Record<Tab, string> = {
  search: 'Search',
  vault: 'Vault',
  discover: 'Discover',
  dashboard: 'Dashboard',
  settings: 'Settings',
  admin: 'Admin',
};

const TAB_ICONS: Record<Tab, LucideIcon> = {
  search: Search,
  vault: Archive,
  discover: Compass,
  dashboard: BarChart2,
  settings: Settings2,
  admin: ShieldCheck,
};

function AppShell() {
  const { user, loading, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('search');
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const tabs = ['search', 'vault', 'discover', 'dashboard', 'settings', ...(user.isAdmin ? ['admin' as Tab] : [])] as Tab[];

  const userControls = (
    <>
      <span className="text-xs text-muted-foreground">{user.username}</span>
      <ThemeToggle />
      <button
        onClick={() => void logout()}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Sign out
      </button>
    </>
  );

  return (
    <div className="pb-16 md:pb-0">
      {/* Mobile: slim header — brand + user controls */}
      <header className="sticky top-0 z-40 border-b border-border bg-card md:hidden">
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-xs font-bold tracking-widest text-foreground">VAULTPLAY</span>
          <div className="flex items-center gap-3">{userControls}</div>
        </div>
      </header>

      {/* Desktop: tab bar + user controls */}
      <nav className="border-b border-border bg-card hidden md:block sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-end">
            <div className="flex items-center gap-1 pt-3">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors whitespace-nowrap ${
                    tab === t
                      ? 'bg-background text-foreground border border-b-background border-border -mb-px'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {TAB_LABELS[t]}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-3 pb-2 pl-4 shrink-0">{userControls}</div>
          </div>
        </div>
      </nav>

      {tab === 'search' && <SearchPage />}
      {tab === 'vault' && <VaultPage />}
      {tab === 'discover' && <DiscoverPage />}
      {tab === 'dashboard' && <DashboardPage />}
      {tab === 'settings' && <SettingsPage />}
      {tab === 'admin' && user.isAdmin && <AdminPage />}

      {/* Mobile: bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card md:hidden z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((t) => {
            const Icon = TAB_ICONS[t];
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 min-w-0 transition-colors ${
                  active ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
                <span className="text-[10px] font-medium leading-none">{BOTTOM_NAV_LABELS[t]}</span>
              </button>
            );
          })}
        </div>
      </nav>
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
