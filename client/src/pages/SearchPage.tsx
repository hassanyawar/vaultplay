import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GameCard } from '@/components/GameCard';
import { searchGames } from '@/lib/api';
import type { GameSearchResult } from '@/types/game';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [currentQuery, setCurrentQuery] = useState('');
  const [allResults, setAllResults] = useState<GameSearchResult[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'loading-more' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="mb-6 sm:mb-10 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">VAULTPLAY</h1>
          <p className="text-muted-foreground">Search for a game and add it to your vault.</p>
        </div>

        <form onSubmit={(e) => void handleSearch(e)} className="flex gap-2 mb-6 sm:mb-10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search games… e.g. Hades, Celeste, Elden Ring"
            className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Searching…' : 'Search'}
          </Button>
        </form>

        {status === 'error' && (
          <p className="text-center text-destructive text-sm mb-6">{error}</p>
        )}

        {status === 'done' && allResults.length === 0 && (
          <p className="text-center text-muted-foreground text-sm">No games found for "{currentQuery}".</p>
        )}

        {allResults.length > 0 && (
          <>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {allResults.map((game) => (
                <GameCard key={game.rawgId} game={game} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => void loadMore()}
                  disabled={status === 'loading-more'}
                >
                  {status === 'loading-more' ? 'Loading…' : 'Load more results'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
