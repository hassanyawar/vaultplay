import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { GameCard } from '@/components/GameCard';
import { getPopularGames, searchGames } from '@/lib/api';
import type { GameSearchResult } from '@/types/game';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [currentQuery, setCurrentQuery] = useState('');
  const [allResults, setAllResults] = useState<GameSearchResult[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'loading-more' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const [popularGames, setPopularGames] = useState<GameSearchResult[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  useEffect(() => {
    getPopularGames()
      .then(({ results }) => setPopularGames(results))
      .catch(() => {})
      .finally(() => setLoadingPopular(false));
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setStatus('loading');
    setError('');
    setAllResults([]);
    setPage(1);
    setCurrentQuery(q);

    try {
      const { results, hasMore: more } = await searchGames(q, 1);
      setAllResults(results);
      setHasMore(more);
      setStatus('done');
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
    }
  }

  async function loadMore() {
    const nextPage = page + 1;
    setStatus('loading-more');
    try {
      const { results: newResults, hasMore: more } = await searchGames(currentQuery, nextPage);
      setAllResults((prev) => [...prev, ...newResults]);
      setHasMore(more);
      setPage(nextPage);
      setStatus('done');
    } catch {
      setStatus('done');
    }
  }

  const isIdle = status === 'idle';

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-10">

        {/* Hero */}
        <header className="search-hero">
          <h1>
            <span style={{ color: 'var(--foreground)' }}>VAULT</span>
            <span className="vp-gradient-text">PLAY</span>
          </h1>
          <p>// search for a game and add it to your vault</p>
        </header>

        {/* Search bar */}
        <form onSubmit={(e) => void handleSearch(e)} className="search-row">
          <div className="search-input-wrap">
            <Search strokeWidth={1.8} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search games… e.g. Hades, Celeste, Elden Ring"
              aria-label="Search games"
              className="search-input"
            />
          </div>
          <button type="submit" disabled={status === 'loading'} className="search-btn">
            {status === 'loading' ? 'Searching…' : 'Search'}
          </button>
        </form>

        {/* Error */}
        {status === 'error' && (
          <p className="text-center text-destructive text-sm mt-6">{error}</p>
        )}

        {/* No results */}
        {status === 'done' && allResults.length === 0 && (
          <p
            className="text-center text-sm mt-10"
            style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--vp-muted)' }}
          >
            No results for "{currentQuery}"
          </p>
        )}

        {/* Popular games (idle state) */}
        {isIdle && (
          <div>
            <div className="search-sec-head">
              <span className="ln" />
              <h2>Popular Games</h2>
              <span className="ln ln-r" />
            </div>
            {loadingPopular ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] rounded-[14px] animate-pulse" style={{ background: 'rgba(139,108,255,0.1)' }} />
                ))}
              </div>
            ) : popularGames.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {popularGames.map((game) => (
                  <GameCard key={game.rawgId} game={game} />
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* Search results */}
        {allResults.length > 0 && (
          <>
            <div className="search-sec-head">
              <span className="ln" />
              <h2>Results for "{currentQuery}"</h2>
              <span className="ln ln-r" />
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {allResults.map((game) => (
                <GameCard key={game.rawgId} game={game} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => void loadMore()}
                  disabled={status === 'loading-more'}
                  className="search-btn"
                  style={{ padding: '12px 32px', borderRadius: '10px' }}
                >
                  {status === 'loading-more' ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
