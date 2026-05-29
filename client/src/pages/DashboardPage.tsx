import { useEffect, useRef, useState } from 'react';
import { getStatsSummary, getCurrentlyPlaying, getRecentlyAdded } from '@/lib/api';
import type { StatsSummary, CurrentlyPlayingGame, RecentlyAddedGame } from '@/types/game';

function formatLastActivity(isoDate: string | null): string {
  if (!isoDate) return 'No activity yet';
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000);
  if (diff === 0) return 'Last activity: today';
  if (diff === 1) return 'Last activity: yesterday';
  return `Last activity: ${diff} days ago`;
}

function formatDaysPlaying(days: number): string {
  if (days === 0) return 'Started today';
  if (days === 1) return 'Playing for 1 day';
  return `Playing for ${days} days`;
}

function formatAddedAt(isoDate: string): string {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${diff}d ago`;
}

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  accentClass: string;
  bgClass: string;
}

function StatCard({ label, value, sub, accentClass, bgClass }: StatCardProps) {
  return (
    <div className={`rounded-xl border border-border ${bgClass} border-l-4 ${accentClass} px-5 py-4 flex flex-col gap-1`}>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="text-3xl font-bold text-foreground leading-none">{value}</span>
      {sub && <span className="text-xs text-muted-foreground mt-0.5">{sub}</span>}
    </div>
  );
}

function ProgressBar({ backlog, playing, completed, total }: { backlog: number; playing: number; completed: number; total: number }) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setAnimated(true);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (total === 0) return null;

  const backlogPct = (backlog / total) * 100;
  const playingPct = (playing / total) * 100;
  const completedPct = (completed / total) * 100;

  return (
    <div ref={ref} className="mt-4">
      <div className="flex rounded-full overflow-hidden h-2.5 bg-muted gap-0.5">
        <div
          className="bg-muted-foreground/40 rounded-l-full transition-all duration-700 ease-out"
          style={{ width: animated ? `${backlogPct}%` : '0%' }}
        />
        <div
          className="bg-amber-500 transition-all duration-700 ease-out delay-100"
          style={{ width: animated ? `${playingPct}%` : '0%' }}
        />
        <div
          className="bg-green-500 rounded-r-full transition-all duration-700 ease-out delay-200"
          style={{ width: animated ? `${completedPct}%` : '0%' }}
        />
      </div>
      <div className="flex gap-4 mt-2">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/40 inline-block" />
          {backlog} backlog
        </span>
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
          {playing} playing
        </span>
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          {completed} completed
        </span>
      </div>
    </div>
  );
}

function CurrentlyPlayingSection({ games }: { games: CurrentlyPlayingGame[] }) {
  if (games.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Currently Playing</p>
        <p className="text-sm text-muted-foreground">Nothing in progress — pick something from your backlog.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Currently Playing</h2>
      <div className="flex flex-col gap-3">
        {games.map((game) => (
          <div
            key={game.vaultEntryId}
            className="group rounded-xl border border-border bg-card border-l-4 border-l-amber-500 overflow-hidden flex items-center gap-4 pr-5 hover:shadow-md transition-shadow"
          >
            <div className="w-16 h-20 shrink-0 bg-muted overflow-hidden">
              {game.coverUrl ? (
                <img
                  src={game.coverUrl}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No art</div>
              )}
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <p className="font-semibold text-foreground leading-tight truncate">{game.title}</p>
              <p className="text-xs text-muted-foreground">{game.platforms.slice(0, 3).join(' · ')}</p>
              <span className="inline-flex items-center text-xs font-medium text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full w-fit mt-0.5">
                {formatDaysPlaying(game.daysSincePlaying)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentlyAddedSection({ games }: { games: RecentlyAddedGame[] }) {
  if (games.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Most Recently Added</h2>
      <div className="grid grid-cols-4 gap-3">
        {games.map((game) => (
          <div key={game.vaultEntryId} className="group flex flex-col gap-1.5">
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted border border-border">
              {game.coverUrl ? (
                <img
                  src={game.coverUrl}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No art</div>
              )}
            </div>
            <p className="text-xs font-medium text-foreground leading-tight line-clamp-2">{game.title}</p>
            <p className="text-xs text-muted-foreground">{formatAddedAt(game.addedAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [playing, setPlaying] = useState<CurrentlyPlayingGame[] | null>(null);
  const [recent, setRecent] = useState<RecentlyAddedGame[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [summaryData, playingData, recentData] = await Promise.all([
          getStatsSummary(),
          getCurrentlyPlaying(),
          getRecentlyAdded(),
        ]);
        if (cancelled) return;
        setSummary(summaryData);
        setPlaying(playingData);
        setRecent(recentData);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const isLoading = !summary && !error;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your Vault</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {summary ? formatLastActivity(summary.lastActivityAt) : 'Loading…'}
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card h-24 animate-pulse" />
          ))}
        </div>
      )}

      {summary && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Total Games"
              value={summary.total}
              accentClass="border-l-blue-500"
              bgClass="bg-blue-500/5"
            />
            <StatCard
              label="Playing"
              value={summary.playing}
              accentClass="border-l-amber-500"
              bgClass="bg-amber-500/5"
            />
            <StatCard
              label="Completed"
              value={summary.completed}
              sub={summary.total > 0 ? `${Math.round((summary.completed / summary.total) * 100)}% of vault` : undefined}
              accentClass="border-l-green-500"
              bgClass="bg-green-500/5"
            />
            <StatCard
              label="Avg Rating"
              value={summary.averageRating !== null ? summary.averageRating.toFixed(1) : '—'}
              sub={summary.averageRating !== null ? 'out of 10' : 'No ratings yet'}
              accentClass="border-l-purple-500"
              bgClass="bg-purple-500/5"
            />
          </div>

          <ProgressBar
            backlog={summary.backlog}
            playing={summary.playing}
            completed={summary.completed}
            total={summary.total}
          />
        </>
      )}

      {playing && (
        <div className="mt-10">
          <CurrentlyPlayingSection games={playing} />
        </div>
      )}

      {recent && recent.length > 0 && (
        <div className="mt-10">
          <RecentlyAddedSection games={recent} />
        </div>
      )}
    </div>
  );
}
