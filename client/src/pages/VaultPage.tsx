import { useEffect, useState } from 'react';
import { ArrowUpDown, SlidersHorizontal } from 'lucide-react';
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

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'backlog', label: 'Backlog' },
  { value: 'playing', label: 'Playing' },
  { value: 'completed', label: 'Completed' },
] as const;

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
    let cancelled = false;
    getVaultPlatforms().then((p) => { if (!cancelled) setPlatforms(p); }).catch(() => {});
    getVaultCounts().then((c) => { if (!cancelled) setCounts(c); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus('loading');
      setAllEntries([]);
      setPage(1);
      setTotal(0);

      try {
        const { entries, total: t } = await getVault({
          status: filterStatus || undefined,
          platform: filterPlatform || undefined,
          rating: filterRating ? parseInt(filterRating, 10) : undefined,
          sort,
          page: 1,
        });
        if (cancelled) return;
        setAllEntries(entries);
        setTotal(t);
        setStatus('done');
      } catch (err: unknown) {
        if (cancelled) return;
        setError((err as Error).message);
        setStatus('error');
      }
    }

    void load();
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
      // keep current entries; user can retry
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
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-10">

        {/* Page header */}
        <header style={{ padding: '54px 0 4px' }}>
          <p className="vault-eyebrow">// your collection</p>
          <h1 className="vault-title">
            My <span className="vp-gradient-text">Vault</span>
          </h1>
          <p className="vault-stats">
            <span className="vault-stats-total">{counts.all} game{counts.all !== 1 ? 's' : ''}</span>
            <span className="vault-stats-sep">·</span>
            <span className="vault-stats-playing">{counts.playing} playing</span>
            <span className="vault-stats-sep">·</span>
            <span className="vault-stats-completed">{counts.completed} completed</span>
            <span className="vault-stats-sep">·</span>
            <span className="vault-stats-backlog">{counts.backlog} backlog</span>
          </p>
        </header>

        {/* Controls */}
        <div style={{ marginTop: 38, marginBottom: 22 }} className="flex flex-col gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status chips */}
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setFilterStatus(s.value)}
                  className={`vault-chip ${filterStatus === s.value ? 'vault-chip-active' : ''}`}
                  aria-pressed={filterStatus === s.value}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Tool buttons */}
            <div className="flex gap-2.5 ml-auto">
              <button
                onClick={() => togglePanel('sort')}
                className={`vault-toolbtn ${openPanel === 'sort' ? 'vault-toolbtn-active' : ''}`}
              >
                {currentSortLabel}
                <ArrowUpDown size={14} />
              </button>
              <button
                onClick={() => togglePanel('filters')}
                className={`vault-toolbtn ${openPanel === 'filters' || activeFilterCount > 0 ? 'vault-toolbtn-active' : ''}`}
              >
                <SlidersHorizontal size={14} />
                {activeFilterCount > 0 ? `Filters · ${activeFilterCount}` : 'Filters'}
              </button>
            </div>
          </div>

          {/* Sort panel */}
          {openPanel === 'sort' && (
            <div className="vault-panel">
              <p className="vault-panel-label">Sort by</p>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => { setSort(o.value); localStorage.setItem('vault-sort', o.value); }}
                    className={`vault-chip ${sort === o.value ? 'vault-chip-active' : ''}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filters panel */}
          {openPanel === 'filters' && (
            <div className="vault-panel flex flex-col gap-4">
              {platforms.length > 0 && (
                <div>
                  <p className="vault-panel-label">Platform</p>
                  <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
                    <button
                      onClick={() => setFilterPlatform('')}
                      className={`vault-chip shrink-0 ${filterPlatform === '' ? 'vault-chip-active' : ''}`}
                    >
                      All
                    </button>
                    {platforms.map((p) => (
                      <button
                        key={p}
                        onClick={() => setFilterPlatform(p)}
                        className={`vault-chip shrink-0 ${filterPlatform === p ? 'vault-chip-active' : ''}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="vault-panel-label">Rating</p>
                <div className="flex flex-wrap gap-2">
                  {RATINGS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setFilterRating(r)}
                      className={`vault-chip ${filterRating === r ? 'vault-chip-active' : ''}`}
                    >
                      {r === '' ? 'Any' : r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active filter tags */}
          {(filterPlatform || filterRating) && (
            <div className="flex flex-wrap items-center gap-2">
              {filterPlatform && (
                <span className="vault-filter-tag">
                  {filterPlatform}
                  <button onClick={() => setFilterPlatform('')} aria-label="Remove platform filter">×</button>
                </span>
              )}
              {filterRating && (
                <span className="vault-filter-tag">
                  Rating {filterRating}
                  <button onClick={() => setFilterRating('')} aria-label="Remove rating filter">×</button>
                </span>
              )}
              <button
                onClick={() => { setFilterPlatform(''); setFilterRating(''); }}
                style={{ fontSize: 12, color: 'var(--vp-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--vp-muted)')}
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* States */}
        {status === 'loading' && (
          <p className="vault-empty">// loading vault…</p>
        )}
        {status === 'error' && (
          <p className="vault-empty" style={{ color: 'var(--destructive)' }}>{error}</p>
        )}
        {status === 'done' && allEntries.length === 0 && (
          <p className="vault-empty">
            {filterStatus || filterPlatform || filterRating
              ? '// no titles match this filter'
              : '// your vault is empty — search for games to add them'}
          </p>
        )}

        {/* Vault list */}
        {status === 'done' && allEntries.length > 0 && (
          <>
            <div className="flex flex-col gap-4">
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
              <div className="mt-8 text-center">
                <button
                  onClick={() => void loadMore()}
                  disabled={loadingMore}
                  className="search-btn"
                  style={{ padding: '12px 32px', borderRadius: '10px' }}
                >
                  {loadingMore ? 'Loading…' : `Load more (${allEntries.length} of ${total})`}
                </button>
              </div>
            )}

            {!hasMore && total > 16 && (
              <p className="mt-6 text-center" style={{ fontSize: 12, fontFamily: '"IBM Plex Mono", monospace', color: 'var(--vp-faint)' }}>
                // all {total} games loaded
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
