import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { VaultCard } from '@/components/VaultCard';
import { getVault, getVaultCounts, getVaultPlatforms } from '@/lib/api';
import type { VaultEntry } from '@/types/game';

const SORT_OPTIONS = [
  { value: 'added_desc', label: 'Latest' },
  { value: 'added_asc', label: 'Oldest' },
  { value: 'rating_desc', label: '★ High' },
  { value: 'rating_asc', label: '★ Low' },
  { value: 'title_asc', label: 'A–Z' },
  { value: 'title_desc', label: 'Z–A' },
];

const RATINGS = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

function Pill({
  active,
  onClick,
  children,
  className = '',
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-medium rounded-full px-3 py-1.5 transition-colors whitespace-nowrap ${
        active
          ? 'bg-foreground text-background'
          : 'border border-input text-muted-foreground hover:text-foreground'
      } ${className}`}
    >
      {children}
    </button>
  );
}

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
  const [sort, setSort] = useState(() => localStorage.getItem('vault-sort') ?? 'added_desc');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [counts, setCounts] = useState({ all: 0, backlog: 0, playing: 0, completed: 0 });
  const [openPanel, setOpenPanel] = useState<'sort' | 'filters' | null>(null);

  const activeFilterCount = [filterPlatform, filterRating].filter(Boolean).length;
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Sort';

  function togglePanel(panel: 'sort' | 'filters') {
    setOpenPanel((prev) => (prev === panel ? null : panel));
  }

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

        <div className="flex flex-col gap-2.5 mb-6">
          {/* Control bar: status pills + Sort + Filters buttons */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {(['', 'backlog', 'playing', 'completed'] as const).map((s) => (
                <Pill key={s} active={filterStatus === s} onClick={() => setFilterStatus(s)}>
                  {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </Pill>
              ))}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => togglePanel('sort')}
                className={`text-xs font-medium rounded-full px-3 py-1.5 transition-colors ${
                  openPanel === 'sort'
                    ? 'bg-foreground text-background'
                    : 'border border-input text-muted-foreground hover:text-foreground'
                }`}
              >
                {currentSortLabel} ↕
              </button>
              <button
                onClick={() => togglePanel('filters')}
                className={`text-xs font-medium rounded-full px-3 py-1.5 transition-colors ${
                  openPanel === 'filters' || activeFilterCount > 0
                    ? 'bg-foreground text-background'
                    : 'border border-input text-muted-foreground hover:text-foreground'
                }`}
              >
                {activeFilterCount > 0 ? `Filters · ${activeFilterCount}` : 'Filters'}
              </button>
            </div>
          </div>

          {/* Sort inline panel */}
          {openPanel === 'sort' && (
            <div className="rounded-xl border border-border bg-card px-4 py-3">
              <div className="flex flex-wrap gap-1.5">
                {SORT_OPTIONS.map((o) => (
                  <Pill key={o.value} active={sort === o.value} onClick={() => { setSort(o.value); localStorage.setItem('vault-sort', o.value); }}>
                    {o.label}
                  </Pill>
                ))}
              </div>
            </div>
          )}

          {/* Filters inline panel — platform + rating only */}
          {openPanel === 'filters' && (
            <div className="rounded-xl border border-border bg-card px-4 py-4 flex flex-col gap-4">
              {platforms.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Platform</p>
                  <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <Pill active={filterPlatform === ''} onClick={() => setFilterPlatform('')} className="shrink-0">All</Pill>
                    {platforms.map((p) => (
                      <Pill key={p} active={filterPlatform === p} onClick={() => setFilterPlatform(p)} className="shrink-0">{p}</Pill>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Rating</p>
                <div className="flex flex-wrap gap-1.5">
                  {RATINGS.map((r) => (
                    <Pill key={r} active={filterRating === r} onClick={() => setFilterRating(r)}>
                      {r === '' ? 'Any' : r}
                    </Pill>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active filter chips — visible regardless of panel state */}
          {(filterPlatform || filterRating) && (
            <div className="flex flex-wrap items-center gap-2">
              {filterPlatform && (
                <span className="inline-flex items-center gap-1 text-xs bg-muted text-foreground rounded-full px-2.5 py-1">
                  {filterPlatform}
                  <button
                    onClick={() => setFilterPlatform('')}
                    className="text-muted-foreground hover:text-foreground leading-none"
                    aria-label="Remove platform filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {filterRating && (
                <span className="inline-flex items-center gap-1 text-xs bg-muted text-foreground rounded-full px-2.5 py-1">
                  Rating {filterRating}
                  <button
                    onClick={() => setFilterRating('')}
                    className="text-muted-foreground hover:text-foreground leading-none"
                    aria-label="Remove rating filter"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => { setFilterPlatform(''); setFilterRating(''); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
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
