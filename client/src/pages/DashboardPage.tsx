import { Fragment, useEffect, useRef, useState } from 'react';
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatLastActivity(isoDate: string | null): string {
  if (!isoDate) return 'no activity yet';
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000);
  if (diff === 0) return 'today';
  if (diff === 1) return 'yesterday';
  return `${diff} days ago`;
}

function formatDaysPlaying(days: number): string {
  if (days === 0) return 'Started today';
  if (days === 1) return 'Playing for 1 day';
  return `Playing for ${days} days`;
}

function formatAddedAt(isoDate: string): string {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000);
  if (diff === 0) return 'Added today';
  if (diff === 1) return 'Added yesterday';
  if (diff < 7) return `Added ${diff} days ago`;
  if (diff < 30) {
    const w = Math.round(diff / 7);
    return `Added ${w} week${w !== 1 ? 's' : ''} ago`;
  }
  const m = Math.round(diff / 30);
  return `Added ${m} month${m !== 1 ? 's' : ''} ago`;
}

function buildMonthSeries(raw: CompletionByMonth[]): { label: string; count: number }[] {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const found = raw.find(r => r.year === d.getFullYear() && r.month === d.getMonth() + 1);
    return { label: MONTH_NAMES[d.getMonth()], count: found?.count ?? 0 };
  });
}

function niceMax(max: number): number {
  if (max <= 5) return 5;
  if (max <= 10) return 10;
  if (max <= 20) return 20;
  if (max <= 50) return 50;
  return Math.ceil(max / 10) * 10;
}

function coverInitials(title: string): string {
  const words = title.trim().split(/\s+/);
  if (words.length === 1) return title.slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// ── Status bar ────────────────────────────────────────────────────────────────

function StatusBar({ backlog, playing, completed, total }: {
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

  const backlogPct   = (backlog   / total) * 100;
  const playingPct   = (playing   / total) * 100;
  const completedPct = (completed / total) * 100;

  return (
    <div ref={ref} className="dash-statuswrap">
      <div className="dash-statusbar">
        <span className="dash-seg dash-seg-backlog"   style={{ width: animated ? `${backlogPct}%`   : '0%' }} />
        <span className="dash-seg dash-seg-playing"   style={{ width: animated ? `${playingPct}%`   : '0%' }} />
        <span className="dash-seg dash-seg-completed" style={{ width: animated ? `${completedPct}%` : '0%' }} />
      </div>
      <div className="dash-sleg">
        <span className="dash-sleg-item"><span className="dash-sleg-dot dash-sleg-dot-backlog"   />{backlog} backlog</span>
        <span className="dash-sleg-item"><span className="dash-sleg-dot dash-sleg-dot-playing"   />{playing} playing</span>
        <span className="dash-sleg-item"><span className="dash-sleg-dot dash-sleg-dot-completed" />{completed} completed</span>
      </div>
    </div>
  );
}

// ── Completions chart — Option A: gradient area (SVG) ────────────────────────

function CompletionsChart({ data }: { data: CompletionByMonth[] }) {
  const [active, setActive] = useState(false);
  const series = buildMonthSeries(data);
  const isEmpty = series.every(d => d.count === 0);

  useEffect(() => {
    if (isEmpty) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setActive(true)));
    return () => cancelAnimationFrame(id);
  }, [isEmpty]);

  if (isEmpty) {
    return (
      <div className="dash-card" style={{ padding: '24px 26px' }}>
        <p className="dash-empty">// no completions in the last 12 months</p>
      </div>
    );
  }

  const maxVal  = Math.max(...series.map(d => d.count), 1);
  const nMax    = niceMax(maxVal);
  const peakIdx = series.reduce((best, d, i) => d.count > series[best].count ? i : best, 0);

  const W = 760, H = 280;
  const pL = 46, pR = 16, pT = 18, pB = 30;
  const plotW = W - pL - pR, plotH = H - pT - pB;
  const base  = pT + plotH;
  const n = series.length;
  const X = (i: number) => pL + i * (plotW / (n - 1));
  const Y = (v: number) => pT + (1 - v / nMax) * plotH;

  const ticks   = [0, nMax / 4, nMax / 2, (3 * nMax) / 4, nMax];
  const linePts = series.map((d, i) => `${X(i).toFixed(1)},${Y(d.count).toFixed(1)}`).join(' ');
  const areaPts = `${pL},${base} ${linePts} ${W - pR},${base}`;
  const peakX   = X(peakIdx);
  const peakY   = Y(series[peakIdx].count);

  return (
    <div className="dash-card" style={{ padding: '4px 0 8px' }}>
      <svg className="dash-area-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Completions area chart">
        <defs>
          <linearGradient id="dashAreaStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--vp-ok)" />
            <stop offset="1" stopColor="var(--vp-violet)" />
          </linearGradient>
          <linearGradient id="dashAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--vp-ok)" stopOpacity="0.42" />
            <stop offset="1" stopColor="var(--vp-ok)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines + y-axis labels */}
        {ticks.map(t => (
          <Fragment key={t}>
            <line className="dash-area-gl" x1={pL} y1={Y(t).toFixed(1)} x2={W - pR} y2={Y(t).toFixed(1)} />
            <text className="dash-area-ax" x={pL - 8} y={(Y(t) + 4).toFixed(1)} textAnchor="end">{t}</text>
          </Fragment>
        ))}

        {/* X-axis month labels */}
        {series.map((d, i) => (
          <text key={i} className="dash-area-ax" x={X(i).toFixed(1)} y={(H - 10).toFixed(1)} textAnchor="middle">
            {d.label}
          </text>
        ))}

        {/* Area fill */}
        <polygon
          points={areaPts}
          fill="url(#dashAreaFill)"
          style={{ opacity: active ? 1 : 0, transition: 'opacity 0.9s ease 0.3s' }}
        />

        {/* Gradient line — pathLength normalises dasharray to 0–1 */}
        <polyline
          className={`dash-area-line${active ? ' in' : ''}`}
          points={linePts}
          pathLength="1"
          stroke="url(#dashAreaStroke)"
        />

        {/* Data dots — staggered appearance */}
        {series.map((d, i) => (
          <circle
            key={i}
            className={`dash-area-dot${i === peakIdx ? ' peak' : ''}`}
            cx={X(i).toFixed(1)}
            cy={Y(d.count).toFixed(1)}
            r={i === peakIdx ? 5.5 : 3.5}
            style={{ opacity: active ? 1 : 0, transition: `opacity 0.4s ease ${700 + i * 55}ms` }}
          />
        ))}

        {/* Peak value label */}
        <text
          className="dash-peak-tag"
          x={peakX.toFixed(1)}
          y={Math.max(peakY - 12, 16).toFixed(1)}
          textAnchor="middle"
          style={{ opacity: active ? 1 : 0, transition: 'opacity 0.5s ease 900ms' }}
        >
          {series[peakIdx].count}
        </text>
      </svg>
    </div>
  );
}

// ── Genre breakdown chart — Option C: ranked gradient bars ───────────────────

function GenreBreakdownChart({ data }: { data: GenreBreakdown[] }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (data.length === 0) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setActive(true)));
    return () => cancelAnimationFrame(id);
  }, [data.length]);

  if (data.length === 0) return null;

  const maxCount = Math.max(...data.map(g => g.count), 1);
  const tickVals = [0, Math.round(maxCount / 4), Math.round(maxCount / 2), Math.round((3 * maxCount) / 4), maxCount];

  return (
    <div className="dash-card dash-hchart">
      {data.map((g, i) => (
        <div key={g.genre} className="dash-hrow">
          <span className="dash-hname">{g.genre}</span>
          <div className="dash-htrack">
            <span
              className={`dash-hfill${i === 0 ? ' dash-hfill-crown' : ''}`}
              style={{ width: active ? `${(g.count / maxCount) * 100}%` : '0%' }}
            />
          </div>
          <span className="dash-hval">{g.count}</span>
        </div>
      ))}
      <div className="dash-haxis">
        <div className="dash-hticks">
          {tickVals.map(t => <span key={t}>{t}</span>)}
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const [summary,     setSummary]     = useState<StatsSummary | null>(null);
  const [playing,     setPlaying]     = useState<CurrentlyPlayingGame[] | null>(null);
  const [recent,      setRecent]      = useState<RecentlyAddedGame[] | null>(null);
  const [completions, setCompletions] = useState<CompletionByMonth[] | null>(null);
  const [genres,      setGenres]      = useState<GenreBreakdown[] | null>(null);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [summaryRes, playingRes, recentRes, completionsRes, genresRes] = await Promise.allSettled([
        getStatsSummary(),
        getCurrentlyPlaying(),
        getRecentlyAdded(),
        getCompletionsByMonth(),
        getGenreBreakdown(),
      ]);
      if (cancelled) return;

      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value);
      else setError(summaryRes.reason instanceof Error ? summaryRes.reason.message : 'Failed to load dashboard');

      if (playingRes.status === 'fulfilled') setPlaying(playingRes.value);
      if (recentRes.status === 'fulfilled') setRecent(recentRes.value);
      if (completionsRes.status === 'fulfilled') setCompletions(completionsRes.value);
      if (genresRes.status === 'fulfilled') setGenres(genresRes.value);
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  const isLoading = !summary && !error;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="dash-empty">// loading vault data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="dash-empty" style={{ color: 'var(--destructive)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">

        {/* Page header */}
        <header style={{ paddingTop: 50, paddingBottom: 4 }}>
          <div className="dash-eyebrow">// dashboard</div>
          <h1 className="dash-title">Your <span className="vp-gradient-text">Vault</span></h1>
          {summary && (
            <p className="dash-last-act">
              Last activity: <b>{formatLastActivity(summary.lastActivityAt)}</b>
            </p>
          )}
        </header>

        {/* KPI grid + status bar */}
        {summary && (
          <>
            <div className="dash-kpis">
              <div className="dash-kpi" style={{ '--c': 'var(--vp-blue)' } as React.CSSProperties}>
                <div className="dash-k-label">Total games</div>
                <div className="dash-k-num">{summary.total}</div>
                <div className="dash-k-sub">in your vault</div>
              </div>
              <div className="dash-kpi" style={{ '--c': 'var(--vp-gold)' } as React.CSSProperties}>
                <div className="dash-k-label">Playing</div>
                <div className="dash-k-num">{summary.playing}</div>
                <div className="dash-k-sub">in progress</div>
              </div>
              <div className="dash-kpi" style={{ '--c': 'var(--vp-ok)' } as React.CSSProperties}>
                <div className="dash-k-label">Completed</div>
                <div className="dash-k-num">{summary.completed}</div>
                <div className="dash-k-sub">
                  {summary.total > 0
                    ? `${Math.round((summary.completed / summary.total) * 100)}% of vault`
                    : 'of vault'}
                </div>
              </div>
              <div className="dash-kpi" style={{ '--c': 'var(--vp-violet)' } as React.CSSProperties}>
                <div className="dash-k-label">Avg rating</div>
                <div className="dash-k-num">
                  {summary.averageRating !== null ? summary.averageRating.toFixed(1) : '—'}
                </div>
                <div className="dash-k-sub">out of 10</div>
              </div>
            </div>

            <StatusBar
              backlog={summary.backlog}
              playing={summary.playing}
              completed={summary.completed}
              total={summary.total}
            />
          </>
        )}

        {/* Currently playing */}
        {playing && (
          <section className="dash-section">
            <h2 className="dash-s-title">Currently <span className="vp-gradient-text">playing</span></h2>

            {playing.length === 0 ? (
              <p className="dash-empty">// nothing in progress — pick something from your backlog</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
                {playing.map((game) => (
                  <div key={game.vaultEntryId} className="dash-card dash-now">
                    <div
                      className="dash-now-thumb"
                      style={!game.coverUrl ? { background: 'linear-gradient(150deg, var(--vp-violet), #2B2F7A)' } : undefined}
                    >
                      {game.coverUrl
                        ? <img src={game.coverUrl} alt={game.title} loading="lazy" />
                        : <div className="dash-now-mono">{coverInitials(game.title)}</div>
                      }
                    </div>
                    <div className="dash-now-body">
                      <div className="dash-now-title">{game.title}</div>
                      <div className="dash-now-plat">{game.platforms.slice(0, 3).join(' · ')}</div>
                      <span className="dash-now-since">{formatDaysPlaying(game.daysSincePlaying)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Recently added */}
        {recent && recent.length > 0 && (
          <section className="dash-section">
            <h2 className="dash-s-title">Most recently <span className="vp-gradient-text">added</span></h2>

            <div className="dash-added-grid">
              {recent.map((game) => (
                <article key={game.vaultEntryId} className="dash-added">
                  <div
                    className="dash-added-cover"
                    style={!game.coverUrl ? { background: 'linear-gradient(150deg, #3A2B5A, #0E0A1A)' } : undefined}
                  >
                    {game.coverUrl
                      ? <img src={game.coverUrl} alt={game.title} loading="lazy" />
                      : <div className="dash-added-mono">{coverInitials(game.title)}</div>
                    }
                  </div>
                  <div className="dash-added-title">{game.title}</div>
                  <div className="dash-added-when">{formatAddedAt(game.addedAt)}</div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Completions chart */}
        {completions && (
          <section className="dash-section">
            <h2 className="dash-s-title">Completions — last <span className="vp-gradient-text">12 months</span></h2>
            <p className="dash-s-sub">Games you marked as completed each month.</p>
            <CompletionsChart data={completions} />
          </section>
        )}

        {/* Genre breakdown */}
        {genres && genres.length > 0 && (
          <section className="dash-section">
            <h2 className="dash-s-title">Genre <span className="vp-gradient-text">breakdown</span></h2>
            <p className="dash-s-sub">How your vault is split across genres.</p>
            <GenreBreakdownChart data={genres} />
          </section>
        )}

      </div>
    </div>
  );
}
