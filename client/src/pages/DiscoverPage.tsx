import { useEffect, useRef, useState } from 'react';
import { getNextToPlay, getStalledGames, getGenreAffinity } from '@/lib/api';
import type { Recommendation, StalledGame, GenreAffinity } from '@/types/game';

export function DiscoverPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [stalled, setStalled] = useState<StalledGame[]>([]);
  const [affinity, setAffinity] = useState<GenreAffinity[]>([]);
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [error, setError] = useState('');

  const [recsVisible, setRecsVisible] = useState(false);
  const [stalledVisible, setStalledVisible] = useState(false);

  // Genre affinity animation state
  const [affinityVisible, setAffinityVisible] = useState(false);
  const [barsAnimated, setBarsAnimated] = useState(false);
  const [displayedRatings, setDisplayedRatings] = useState<number[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    async function load() {
      setStatus('loading');
      try {
        const [recs, stalledGames, genreAffinity] = await Promise.all([
          getNextToPlay(),
          getStalledGames(),
          getGenreAffinity(),
        ]);
        setRecommendations(recs);
        setStalled(stalledGames);
        setAffinity(genreAffinity);
        setStatus('done');
        setTimeout(() => setRecsVisible(true), 50);
        setTimeout(() => setStalledVisible(true), 150);
      } catch (err) {
        setError((err as Error).message);
        setStatus('error');
      }
    }
    void load();
  }, []);

  useEffect(() => {
    if (affinity.length === 0) return;

    const fadeTimer = setTimeout(() => setAffinityVisible(true), 50);
    const barTimer = setTimeout(() => setBarsAnimated(true), 200);

    const animTimer = setTimeout(() => {
      const duration = 900;
      const startTime = performance.now();
      const targets = affinity.map((a) => a.averageRating);

      const tick = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayedRatings(targets.map((t) => t * eased));
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    }, 200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(barTimer);
      clearTimeout(animTimer);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [affinity]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading discoveries…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-24">

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-1">What to play next</h2>
          <p className="text-muted-foreground text-sm mb-8">
            Based on your ratings and genres you enjoy.
          </p>
          {recommendations.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Rate some completed games to get personalised suggestions.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
              {recommendations.map((rec, i) => {
                const rankColor =
                  i === 0 ? 'bg-amber-400 text-white' :
                  i === 1 ? 'bg-zinc-400 text-white' :
                  i === 2 ? 'bg-orange-400 text-white' :
                  'bg-muted text-muted-foreground';
                return (
                  <div
                    key={rec.gameId}
                    className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                    style={{
                      opacity: recsVisible ? 1 : 0,
                      transform: recsVisible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
                      transitionDuration: '500ms',
                      transitionDelay: `${i * 80}ms`,
                    }}
                  >
                    <div className="relative aspect-[3/4] bg-muted overflow-hidden group">
                      {rec.coverUrl ? (
                        <img
                          src={rec.coverUrl}
                          alt={rec.title}
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No image
                        </div>
                      )}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-300 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                      <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full drop-shadow-md ${rankColor}`}>
                        #{i + 1}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5 p-3">
                      <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2">
                        {rec.title}
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {rec.genres.slice(0, 2).map((g) => (
                          <span key={g} className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                            {g}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground italic border-l-2 border-border pl-2 mt-0.5">
                        {rec.reason}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {stalled.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-1">Left on the shelf</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Games you started but haven't touched in a while.
            </p>
            <div className="flex flex-col gap-3 mt-8">
              {stalled.map((game, i) => {
                const urgency =
                  game.daysSinceUpdate <= 7
                    ? { label: 'Recently played', accent: 'border-l-green-400', badge: 'bg-green-100 text-green-700', idleText: 'text-green-600' }
                    : game.daysSinceUpdate <= 30
                      ? { label: 'Getting dusty', accent: 'border-l-amber-400', badge: 'bg-amber-100 text-amber-700', idleText: 'text-amber-600' }
                      : { label: 'Long abandoned', accent: 'border-l-red-400', badge: 'bg-red-100 text-red-700', idleText: 'text-red-500' };
                const idleLabel = game.daysSinceUpdate === 0
                  ? 'Last played today'
                  : `Last played ${game.daysSinceUpdate} day${game.daysSinceUpdate !== 1 ? 's' : ''} ago`;
                return (
                  <div
                    key={game.vaultEntryId}
                    className={`flex gap-5 rounded-2xl border-l-4 ${urgency.accent} border border-border bg-card p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}
                    style={{
                      opacity: stalledVisible ? 1 : 0,
                      transform: stalledVisible ? 'translateY(0)' : 'translateY(12px)',
                      transitionDuration: '500ms',
                      transitionDelay: `${i * 80}ms`,
                    }}
                  >
                    <div className="w-20 shrink-0 rounded-xl overflow-hidden bg-muted shadow-sm" style={{ height: '104px' }}>
                      {game.coverUrl ? (
                        <img src={game.coverUrl} alt={game.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-base text-foreground leading-snug">{game.title}</h3>
                          <p className={`text-xs font-medium mt-1 ${urgency.idleText}`}>{idleLabel}</p>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${urgency.badge}`}>
                          {urgency.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section
          className="transition-all duration-700"
          style={{
            opacity: affinityVisible ? 1 : 0,
            transform: affinityVisible ? 'translateY(0)' : 'translateY(16px)',
          }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-1">Genre affinity</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Genres ranked by your average rating.
          </p>
          {affinity.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Rate some games to see your genre preferences.
            </p>
          ) : (
            <div className="rounded-lg border border-border bg-card divide-y divide-border">
              {affinity.map((a, i) => {
                const pct = (a.averageRating / 10) * 100;
                const barColor =
                  a.averageRating >= 8
                    ? 'bg-green-500'
                    : a.averageRating >= 6
                      ? 'bg-amber-500'
                      : 'bg-red-400';
                const displayed = displayedRatings[i] ?? 0;
                return (
                  <div key={a.genre} className="flex items-center gap-4 px-4 py-3">
                    <span className="text-xs text-muted-foreground w-4 text-right shrink-0">
                      {i + 1}
                    </span>
                    <span className="w-24 text-sm font-medium text-foreground shrink-0">
                      {a.genre}
                    </span>
                    <div className="flex-1 bg-muted rounded-full h-1.5">
                      <div
                        className={`${barColor} h-1.5 rounded-full`}
                        style={{
                          width: `${barsAnimated ? pct : 0}%`,
                          transition: 'width 900ms cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold text-foreground w-14 text-right shrink-0tabular-nums">
                      {displayed.toFixed(1)}<span className="text-xs font-normal text-muted-foreground"> /10</span>
                    </span>
                    <span className="text-xs text-muted-foreground w-20 text-right shrink-0">
                      {a.totalRated}/{a.totalInVault} rated
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
