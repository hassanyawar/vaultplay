import { useState } from 'react';
import { SearchPage } from '@/pages/SearchPage';
import { VaultPage } from '@/pages/VaultPage';
import { DiscoverPage } from '@/pages/DiscoverPage';
import { DashboardPage } from '@/pages/DashboardPage';

type Tab = 'search' | 'vault' | 'discover' | 'dashboard';

const TAB_LABELS: Record<Tab, string> = {
  search: 'Search',
  vault: 'My Vault',
  discover: 'Discover',
  dashboard: 'Dashboard',
};

function App() {
  const [tab, setTab] = useState<Tab>('search');

  return (
    <div>
      <nav className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 flex gap-1 pt-3">
          {(['search', 'vault', 'discover', 'dashboard'] as Tab[]).map((t) => (
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
        </div>
      </nav>

      {tab === 'search' && <SearchPage />}
      {tab === 'vault' && <VaultPage />}
      {tab === 'discover' && <DiscoverPage />}
      {tab === 'dashboard' && <DashboardPage />}
    </div>
  );
}

export default App;
