import { useEffect, useState } from 'react';
import { VaultCard } from '@/components/VaultCard';
import { getVault, getVaultPlatforms } from '@/lib/api';
import type { VaultEntry } from '@/types/game';

const SORT_OPTIONS = [
  { value: 'added_desc', label: 'Recently added' },
  { value: 'added_asc', label: 'Oldest first' },
  { value: 'rating_desc', label: 'Highest rated' },
  { value: 'rating_asc', label: 'Lowest rated' },
  { value: 'title_asc', label: 'Title A–Z' },
  { value: 'title_desc', label: 'Title Z–A' },
];

export function VaultPage() {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [error, setError] = useState('');

  const [filterStatus, setFilterStatus] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [sort, setSort] = useState('added_desc');
  const [platforms, setPlatforms] = useState<string[]>([]);

  useEffect(() => {
    getVaultPlatforms()
      .then(setPlatforms)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus('loading');
      try {
        const data = await getVault({
          status: filterStatus || undefined,
          platform: filterPlatform || undefined,
          rating: filterRating ? parseInt(filterRating, 10) : undefined,
          sort,
        });
        if (!cancelled) {
          setEntries(data);
          setStatus('done');
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
          setStatus('error');
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [filterStatus, filterPlatform, filterRating, sort]);

  function handleUpdate(id: number, updated: Partial<VaultEntry>) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
  }

  function handleDelete(id: number) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const counts = {
    all: entries.length,
    backlog: entries.filter((e) => e.status === 'backlog').length,
    playing: entries.filter((e) => e.status === 'playing').length,
    completed: entries.filter((e) => e.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="mb-5 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground mb-1">My Vault</h1>
          <p className="text-muted-foreground text-sm">
            {counts.all} game{counts.all !== 1 ? 's' : ''} · {counts.playing} playing ·{' '}
            {counts.completed} completed · {counts.backlog} backlog
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-input rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All statuses</option>
            <option value="backlog">Backlog</option>
            <option value="playing">Playing</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="text-sm border border-input rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All platforms</option>
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="text-sm border border-input rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Any rating</option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} / 10
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-sm border border-input rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {status === 'loading' && (
          <p className="text-center text-muted-foreground text-sm py-12">Loading vault…</p>
        )}

        {status === 'error' && (
          <p className="text-center text-destructive text-sm py-12">{error}</p>
        )}

        {status === 'done' && entries.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-12">
            {filterStatus || filterPlatform || filterRating
              ? 'No games match the selected filters.'
              : 'Your vault is empty. Search for games to add them.'}
          </p>
        )}

        {status === 'done' && entries.length > 0 && (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => (
              <VaultCard
                key={entry.id}
                entry={entry}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
