import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { VaultCard } from '@/components/VaultCard';
import { getVault, getVaultCounts, getVaultPlatforms } from '@/lib/api';
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
  const [allEntries, setAllEntries] = useState<VaultEntry[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [error, setError] = useState('');

  const [filterStatus, setFilterStatus] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [sort, setSort] = useState('added_desc');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [counts, setCounts] = useState({ all: 0, backlog: 0, playing: 0, completed: 0 });

  useEffect(() => {
    getVaultPlatforms().then(setPlatforms).catch(() => {});
    getVaultCounts().then(setCounts).catch(() => {});
  }, []);

  // Re-fetch from page 1 whenever filters or sort change
  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setAllEntries([]);
    setPage(1);
    setTotal(0);

    getVault({
      status: filterStatus || undefined,
      platform: filterPlatform || undefined,
      rating: filterRating ? parseInt(filterRating, 10) : undefined,
      sort,
      page: 1,
    })
      .then(({ entries, total: t }) => {
        if (cancelled) return;
        setAllEntries(entries);
        setTotal(t);
        setStatus('done');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError((err as Error).message);
        setStatus('error');
      });

    return () => { cancelled = true; };
  }, [filterStatus, filterPlatform, filterRating, sort]);

  async function loadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const { entries: newEntries, total: t } = await getVault({
        status: filterStatus || undefined,
        platform: filterPlatform || undefined,
        rating: filterRating ? parseInt(filterRating, 10) : undefined,
        sort,
        page: nextPage,
      });
      setAllEntries((prev) => [...prev, ...newEntries]);
      setTotal(t);
      setPage(nextPage);
    } catch {
      // keep current entries visible; user can retry
    } finally {
      setLoadingMore(false);
    }
  }

  function handleUpdate(id: number, updated: Partial<VaultEntry>) {
    setAllEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
    if (updated.status !== undefined) {
      getVaultCounts().then(setCounts).catch(() => {});
    }
  }

  function handleDelete(id: number) {
    setAllEntries((prev) => prev.filter((e) => e.id !== id));
    setTotal((prev) => Math.max(0, prev - 1));
    getVaultCounts().then(setCounts).catch(() => {});
  }

  const hasMore = allEntries.length < total;

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

        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-wrap gap-1.5">
            {(['', 'backlog', 'playing', 'completed'] as const).map((s) => {
              const label = s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1);
              const active = filterStatus === s;
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`text-xs font-medium rounded-full px-3 py-1.5 transition-colors ${
                    active
                      ? 'bg-foreground text-background'
                      : 'border border-input text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
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
        </div>

        {status === 'loading' && (
          <p className="text-center text-muted-foreground text-sm py-12">Loading vault…</p>
        )}

        {status === 'error' && (
          <p className="text-center text-destructive text-sm py-12">{error}</p>
        )}

        {status === 'done' && allEntries.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-12">
            {filterStatus || filterPlatform || filterRating
              ? 'No games match the selected filters.'
              : 'Your vault is empty. Search for games to add them.'}
          </p>
        )}

        {status === 'done' && allEntries.length > 0 && (
          <>
            <div className="flex flex-col gap-3">
              {allEntries.map((entry) => (
                <VaultCard
                  key={entry.id}
                  entry={entry}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-6 text-center">
                <Button variant="outline" onClick={() => void loadMore()} disabled={loadingMore}>
                  {loadingMore ? 'Loading…' : `Load more (${allEntries.length} of ${total})`}
                </Button>
              </div>
            )}

            {!hasMore && total > 16 && (
              <p className="mt-6 text-center text-xs text-muted-foreground">
                All {total} games loaded
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
