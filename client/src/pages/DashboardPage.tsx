import { useEffect, useRef, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  getStatsSummary, getCurrentlyPlaying, getRecentlyAdded,
  getCompletionsByMonth, getGenreBreakdown,
} from '@/lib/api';
import type {
  StatsSummary, CurrentlyPlayingGame, RecentlyAddedGame,
  CompletionByMonth, GenreBreakdown,
} from '@/types/game';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

function buildMonthSeries(raw: CompletionByMonth[]): { label: string; count: number }[] {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const found = raw.find(r => r.year === d.getFullYear() && r.month === d.getMonth() + 1);
    return { label: MONTH_NAMES[d.getMonth()], count: found?.count ?? 0 };
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-muted-foreground">{payload[0].value} completed</p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function GenreTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-muted-foreground">{payload[0].value} games</p>
    </div>
  );
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

function ProgressBar({ backlog, playing, completed, total }: {
  backlog: number; playing: number; completed: number; total: number;
}) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setAnimated(true); observer.disconnect(); }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (total === 0) return null;

  const backlogPct  = (backlog   / total) * 100;
  const playingPct  = (playing   / total) * 100;
  const completedPct = (completed / total) * 100;

  return (
    <div ref={ref} className="mt-4">
      <div className="flex rounded-full overflow-hidden h-2.5 bg-muted gap-0.5">
        <div className="bg-muted-foreground/40 rounded-l-full transition-all duration-700 ease-out"
          style={{ width: animated ? `${backlogPct}%` : '0%' }} />
        <div className="bg-amber-500 transition-all duration-700 ease-out delay-100"
          style={{ width: animated ? `${playingPct}%` : '0%' }} />
        <div className="bg-green-500 rounded-r-full transition-all duration-700 ease-out delay-200"
          style={{ width: animated ? `${completedPct}%` : '0%' }} />
      </div>
      <div className="flex gap-4 mt-2">
        {[
          { label: `${backlog} backlog`,   color: 'bg-muted-foreground/40' },
          { label: `${playing} playing`,   color: 'bg-amber-500' },
          { label: `${completed} completed`, color: 'bg-green-500' },
        ].map(({ label, color }) => (
          <span key={label} className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${color} inline-block`} />
            {label}
          </span>
        ))}
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
          <div key={game.vaultEntryId}
            className="group rounded-xl border border-border bg-card border-l-4 border-l-amber-500 overflow-hidden flex items-center gap-4 pr-5 hover:shadow-md transition-shadow"
          >
            <div className="w-16 h-20 shrink-0 bg-muted overflow-hidden">
              {game.coverUrl
                ? <img src={game.coverUrl} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No art</div>
              }
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {games.map((game) => (
          <div key={game.vaultEntryId} className="group flex flex-col gap-1.5">
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted border border-border">
              {game.coverUrl
                ? <img src={game.coverUrl} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No art</div>
              }
            </div>
            <p className="text-xs font-medium text-foreground leading-tight line-clamp-2">{game.title}</p>
            <p className="text-xs text-muted-foreground">{formatAddedAt(game.addedAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompletionsChart({ data }: { data: CompletionByMonth[] }) {
  const series = buildMonthSeries(data);
  const isEmpty = series.every(d => d.count === 0);

  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-1">
        Completions — Last 12 Months
      </h2>
      <p className="text-xs text-muted-foreground mb-4">Games you marked as completed each month.</p>
      {isEmpty ? (
        <div className="rounded-xl border border-border bg-card px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">No completions in the last 12 months.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card px-4 pt-5 pb-3">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={series} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={24} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} isAnimationActive={false} />
              <Bar
                dataKey="count"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                shape={(props: any) => {
                  const { x, y, width, height, count } = props;
                  return <rect x={x} y={y} width={width} height={Math.max(height, 0)} rx={4} ry={4} fill={count > 0 ? '#22c55e' : 'hsl(var(--muted))'} />;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function GenreBreakdownChart({ data }: { data: GenreBreakdown[] }) {
  if (data.length === 0) return null;

  const PURPLE_SHADES = [
    '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd',
    '#6d28d9', '#9333ea', '#a855f7', '#c084fc',
  ];

  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-1">
        Genre Breakdown
      </h2>
      <p className="text-xs text-muted-foreground mb-4">How your vault is split across genres.</p>
      <div className="rounded-xl border border-border bg-card px-4 pt-5 pb-3">
        <ResponsiveContainer width="100%" height={data.length * 36 + 20}>
          <BarChart data={data} layout="vertical" barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="genre" width={80} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip content={<GenreTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} isAnimationActive={false} />
            <Bar
              dataKey="count"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              shape={(props: any) => {
                const { x, y, width, height, index } = props;
                return <rect x={x} y={y} width={Math.max(width, 0)} height={height} rx={4} ry={4} fill={PURPLE_SHADES[index % PURPLE_SHADES.length]} />;
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [summary, setSummary]       = useState<StatsSummary | null>(null);
  const [playing, setPlaying]       = useState<CurrentlyPlayingGame[] | null>(null);
  const [recent, setRecent]         = useState<RecentlyAddedGame[] | null>(null);
  const [completions, setCompletions] = useState<CompletionByMonth[] | null>(null);
  const [genres, setGenres]         = useState<GenreBreakdown[] | null>(null);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [summaryData, playingData, recentData, completionsData, genresData] = await Promise.all([
          getStatsSummary(),
          getCurrentlyPlaying(),
          getRecentlyAdded(),
          getCompletionsByMonth(),
          getGenreBreakdown(),
        ]);
        if (cancelled) return;
        setSummary(summaryData);
        setPlaying(playingData);
        setRecent(recentData);
        setCompletions(completionsData);
        setGenres(genresData);
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Your Vault</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {summary ? formatLastActivity(summary.lastActivityAt) : 'Loading…'}
        </p>
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
            <StatCard label="Total Games"  value={summary.total}     accentClass="border-l-blue-500"   bgClass="bg-blue-500/5" />
            <StatCard label="Playing"      value={summary.playing}   accentClass="border-l-amber-500"  bgClass="bg-amber-500/5" />
            <StatCard
              label="Completed" value={summary.completed}
              sub={summary.total > 0 ? `${Math.round((summary.completed / summary.total) * 100)}% of vault` : undefined}
              accentClass="border-l-green-500" bgClass="bg-green-500/5"
            />
            <StatCard
              label="Avg Rating"
              value={summary.averageRating !== null ? summary.averageRating.toFixed(1) : '—'}
              sub={summary.averageRating !== null ? 'out of 10' : 'No ratings yet'}
              accentClass="border-l-purple-500" bgClass="bg-purple-500/5"
            />
          </div>
          <ProgressBar backlog={summary.backlog} playing={summary.playing} completed={summary.completed} total={summary.total} />
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

      {completions && (
        <div className="mt-10">
          <CompletionsChart data={completions} />
        </div>
      )}

      {genres && genres.length > 0 && (
        <div className="mt-10">
          <GenreBreakdownChart data={genres} />
        </div>
      )}
    </div>
  );
}
