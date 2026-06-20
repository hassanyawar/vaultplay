import { useState, useEffect } from 'react';
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
  dashboard: 'Home',
  search: 'Search',
  vault: 'My Vault',
  discover: 'Discover',
  settings: 'Settings',
  admin: 'Admin',
};

const BOTTOM_NAV_LABELS: Record<Tab, string> = {
  dashboard: 'Home',
  search: 'Search',
  vault: 'Vault',
  discover: 'Discover',
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

function BrandMini({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const iconSize = size === 'sm' ? 17 : 20;
  const fontSize = size === 'sm' ? 12 : 14;
  return (
    <div className="flex items-center gap-2 shrink-0">
      <svg viewBox="0 0 24 24" style={{ width: iconSize, height: iconSize, flexShrink: 0 }}>
        <defs>
          <linearGradient id="vp-brand-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#A78BFF" />
            <stop offset="1" stopColor="#FFC15E" />
          </linearGradient>
        </defs>
        <path d="M13 2 4 14h6l-1 8 9-12h-6z" fill="url(#vp-brand-grad)" />
      </svg>
      <span
        style={{
          fontFamily: '"Chakra Petch", sans-serif',
          fontWeight: 700,
          letterSpacing: '0.12em',
          fontSize,
          lineHeight: 1,
        }}
      >
        <span style={{ color: 'var(--foreground)' }}>VAULT</span>
        <span className="vp-gradient-text">PLAY</span>
      </span>
    </div>
  );
}

function AppShell() {
  const { user, loading, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');

  useEffect(() => {
    if (!user) return;
    document.body.classList.add('app-mode');
    return () => document.body.classList.remove('app-mode');
  }, [user]);

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

  const tabs = ['dashboard', 'search', 'vault', 'discover', 'settings', ...(user.isAdmin ? ['admin' as Tab] : [])] as Tab[];

  const userControls = (
    <>
      <div className="flex items-center gap-2">
        <div className="vp-user-avatar">{user.username[0].toUpperCase()}</div>
        <span className="text-xs text-muted-foreground hidden md:inline" style={{ color: 'var(--vp-muted)' }}>
          {user.username}
        </span>
      </div>
      <ThemeToggle />
      <button
        onClick={() => void logout()}
        className="text-xs transition-colors"
        style={{ color: 'var(--vp-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--vp-muted)')}
      >
        Sign out
      </button>
    </>
  );

  return (
    <div className="md:pb-0">
      {/* Fixed atmosphere layers */}
      <div className="vp-aurora">
        <span className="vp-aurora-1" />
        <span className="vp-aurora-2" />
        <span className="vp-aurora-3" />
      </div>
      <div className="vp-grid-floor" />
      <div className="vp-vignette" />

      {/* Mobile: slim header */}
      <header className="sticky top-0 z-40 md:hidden vp-nav">
        <div className="flex items-center justify-between px-4 py-2.5">
          <BrandMini size="sm" />
          <div className="flex items-center gap-3">{userControls}</div>
        </div>
      </header>

      {/* Desktop: full nav */}
      <nav className="hidden md:block sticky top-0 z-40 vp-nav" style={{ height: 52 }}>
        <div className="max-w-5xl mx-auto px-4 h-full">
          <div className="flex items-stretch h-full">
            {/* Brand */}
            <div className="flex items-center pr-4 mr-2">
              <BrandMini />
            </div>

            {/* Tabs */}
            <div className="flex items-stretch gap-0.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`vp-nav-tab ${tab === t ? 'vp-nav-tab-active' : ''}`}
                >
                  {TAB_LABELS[t]}
                </button>
              ))}
            </div>

            {/* User controls */}
            <div className="ml-auto flex items-center gap-3 pl-4 shrink-0">{userControls}</div>
          </div>
        </div>
      </nav>

      {/* Page content — above atmosphere layers; bottom padding clears the fixed mobile nav */}
      <div className="relative z-[2] pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-0">
        {tab === 'search' && <SearchPage />}
        {tab === 'vault' && <VaultPage />}
        {tab === 'discover' && <DiscoverPage />}
        {tab === 'dashboard' && <DashboardPage onNavigateToSearch={() => setTab('search')} />}
        {tab === 'settings' && <SettingsPage />}
        {tab === 'admin' && user.isAdmin && <AdminPage />}
      </div>

      {/* Mobile: bottom navigation */}
      <nav className="vp-bottom-nav">
        {tabs.map((t) => {
          const Icon = TAB_ICONS[t];
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`vp-bnav-item ${active ? 'vp-bnav-item-active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.75} />
              <span>{BOTTOM_NAV_LABELS[t]}</span>
            </button>
          );
        })}
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
