import { useEffect, useRef, useState } from 'react';
import { getNextToPlay, getStalledGames, getGenreAffinity } from '@/lib/api';
import type { Recommendation, StalledGame, GenreAffinity } from '@/types/game';

// ── Radar chart ──────────────────────────────────────────────────────────────

interface RadarProps {
  genres: GenreAffinity[];
}

function GenreRadar({ genres }: RadarProps) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setActive(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  const cx = 200, cy = 195, R = 115;
  const scoreR = (score: number) => R * score / 10;

  const n = genres.length;
  const ang = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const pt = (i: number, r: number): [number, number] => [
    cx + r * Math.cos(ang(i)),
    cy + r * Math.sin(ang(i)),
  ];

  // 5 rings at 20% intervals (scores 2, 4, 6, 8, 10)
  const rings = [1, 2, 3, 4, 5].map((lv) => {
    const r = (R * lv) / 5;
    const pts = genres.map((_, i) => pt(i, r).map((v) => v.toFixed(1)).join(',')).join(' ');
    return <polygon key={lv} className="disc-radar-ring" points={pts} />;
  });

  // Spokes
  const spokes = genres.map((_, i) => {
    const [ox, oy] = pt(i, R);
    return <line key={i} className="disc-radar-spoke" x1={cx} y1={cy} x2={ox.toFixed(1)} y2={oy.toFixed(1)} />;
  });

  // Labels: genre name at R+20, score stacked vertically (above for upper
  // half, below for lower half) — keeps them apart regardless of spoke angle.
  const labels = genres.map((g, i) => {
    const angle = ang(i);
    const [lx, ly] = pt(i, R + 20);
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const anchor = Math.abs(c) < 0.25 ? 'middle' : c > 0 ? 'start' : 'end';
    const scoreDy = s < -0.05 ? -16 : 16; // upper half → score above; lower → below
    return (
      <g key={i}>
        <text className="disc-radar-label" x={lx.toFixed(1)} y={ly.toFixed(1)} textAnchor={anchor} dominantBaseline="middle">
          {g.genre}
        </text>
        <text className="disc-radar-val" x={lx.toFixed(1)} y={(ly + scoreDy).toFixed(1)} textAnchor={anchor} dominantBaseline="middle">
          {g.averageRating.toFixed(1)}
        </text>
      </g>
    );
  });

  // Data polygon + dots
  const dataPts = genres.map((g, i) => pt(i, scoreR(g.averageRating)).map((v) => v.toFixed(1)).join(',')).join(' ');
  const dots = genres.map((g, i) => {
    const [x, y] = pt(i, scoreR(g.averageRating));
    return <circle key={i} className="disc-radar-dot" cx={x.toFixed(1)} cy={y.toFixed(1)} r="4" />;
  });

  const groupStyle: React.CSSProperties = {
    transformBox: 'fill-box',
    transformOrigin: 'center',
    transform: active ? 'scale(1)' : 'scale(0.04)',
    transition: 'transform 0.9s cubic-bezier(0.22, 0.9, 0.32, 1)',
  };

  return (
    <div className="disc-radar-wrap">
      <svg
        className="disc-radar-svg"
        viewBox="0 0 400 400"
        role="img"
        aria-label="Genre affinity radar"
      >
        <defs>
          <linearGradient id="discRadarFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8B6CFF" stopOpacity="0.48" />
            <stop offset="1" stopColor="#FFC15E" stopOpacity="0.38" />
          </linearGradient>
        </defs>
        {rings}
        {spokes}
        {labels}
        <g style={groupStyle}>
          <polygon className="disc-radar-poly" points={dataPts} />
          {dots}
        </g>
      </svg>

      {/* Coverage legend — shows rated/total, not scores (those are on the chart) */}
      <div className="disc-radar-legend">
        <p className="disc-radar-legend-head">// games rated</p>
        {genres.map((g, i) => (
          <div key={g.genre} className="disc-leg">
            <span className="disc-leg-rank">{i + 1}</span>
            <span className="disc-leg-name">{g.genre}</span>
            <span className="disc-leg-coverage">
              {g.totalRated}
              <span className="disc-leg-total"> / {g.totalInVault}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function coverInitials(title: string): string {
  const words = title.trim().split(/\s+/);
  if (words.length === 1) return title.slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function idleLabel(days: number): string {
  if (days === 0) return 'Last played today';
  if (days === 1) return 'Last played yesterday';
  if (days < 7) return `Last played ${days} days ago`;
  if (days < 30) return `Last played ${Math.round(days / 7)} week${Math.round(days / 7) !== 1 ? 's' : ''} ago`;
  const months = Math.round(days / 30);
  return `Last played ${months} month${months !== 1 ? 's' : ''} ago`;
}

// ── Rec card ─────────────────────────────────────────────────────────────────

const GRAD_PALETTES = [
  ['#FFC15E', '#B8401A'],
  ['#46E0A8', '#1E5A6B'],
  ['#E89A2B', '#6B3A12'],
  ['#C45CFF', '#5A1E6B'],
  ['#FF5C72', '#3A1E6B'],
  ['#6C8BFF', '#2B2F7A'],
];

interface RecCardProps {
  rec: Recommendation;
  rank: number;
  visible: boolean;
  delay: number;
}

function rankClass(rank: number): string {
  if (rank === 0) return 'disc-rec-rank disc-rec-rank-1';
  if (rank === 1) return 'disc-rec-rank disc-rec-rank-2';
  if (rank === 2) return 'disc-rec-rank disc-rec-rank-3';
  return 'disc-rec-rank';
}

function RecCard({ rec, rank, visible, delay }: RecCardProps) {
  const palette = GRAD_PALETTES[rank % GRAD_PALETTES.length];

  return (
    <article
      className="disc-rec"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(18px) scale(0.97)',
        transition: `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms`,
      }}
    >
      <div
        className="disc-rec-cover"
        style={!rec.coverUrl ? { background: `linear-gradient(150deg, ${palette[0]}, ${palette[1]})` } : undefined}
      >
        {rec.coverUrl ? (
          <img src={rec.coverUrl} alt={rec.title} loading="lazy" />
        ) : (
          <div className="disc-rec-cover-fallback">{coverInitials(rec.title)}</div>
        )}

        <span className={rankClass(rank)}>#{rank + 1}</span>

        <span className="disc-rec-corner disc-corner-tl" aria-hidden />
        <span className="disc-rec-corner disc-corner-tr" aria-hidden />
        <span className="disc-rec-corner disc-corner-bl" aria-hidden />
        <span className="disc-rec-corner disc-corner-br" aria-hidden />
      </div>

      <div className="disc-rec-body">
        <h3 className="disc-rec-title">{rec.title}</h3>
        {rec.genres.length > 0 && (
          <div className="disc-rec-tags">
            {rec.genres.slice(0, 2).map((g) => (
              <span key={g} className="disc-rec-tag">{g}</span>
            ))}
          </div>
        )}
        {rec.reason && <p className="disc-rec-reason">{rec.reason}</p>}
      </div>
    </article>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function DiscoverPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [stalled, setStalled] = useState<StalledGame[]>([]);
  const [affinity, setAffinity] = useState<GenreAffinity[]>([]);
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [error, setError] = useState('');
  const [recsVisible, setRecsVisible] = useState(false);
  const [stalledVisible, setStalledVisible] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [recs, stalledGames, genreAffinity] = await Promise.all([
          getNextToPlay(),
          getStalledGames(),
          getGenreAffinity(),
        ]);
        if (!isMounted.current) return;
        setRecommendations(recs);
        setStalled(stalledGames);
        setAffinity(genreAffinity);
        setStatus('done');
        setTimeout(() => { if (isMounted.current) setRecsVisible(true); }, 60);
        setTimeout(() => { if (isMounted.current) setStalledVisible(true); }, 180);
      } catch (err) {
        if (!isMounted.current) return;
        setError((err as Error).message);
        setStatus('error');
      }
    }
    void load();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="disc-empty">// loading discoveries…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="disc-empty" style={{ color: 'var(--destructive)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">

        {/* What to play next */}
        <section style={{ paddingTop: 54 }}>
          <h2 className="disc-s-title">What to play <span className="vp-gradient-text">next</span></h2>
          <p className="disc-s-sub">Based on your ratings and genres you enjoy.</p>

          {recommendations.length === 0 ? (
            <p className="disc-empty">// rate some completed games to get personalised suggestions</p>
          ) : (
            <div className="disc-rec-grid">
              {recommendations.map((rec, i) => (
                <RecCard
                  key={rec.gameId}
                  rec={rec}
                  rank={i}
                  visible={recsVisible}
                  delay={i * 70}
                />
              ))}
            </div>
          )}
        </section>

        {/* Left on the shelf */}
        {stalled.length > 0 && (
          <section style={{ marginTop: 64 }}>
            <h2 className="disc-s-title">Left on the <span className="vp-gradient-text">shelf</span></h2>
            <p className="disc-s-sub">Games you started but haven't touched in a while.</p>

            <div className="disc-shelf-list">
              {stalled.map((game, i) => (
                <article
                  key={game.vaultEntryId}
                  className="disc-shelf"
                  style={{
                    opacity: stalledVisible ? 1 : 0,
                    transform: stalledVisible ? 'translateY(0)' : 'translateY(14px)',
                    transition: `opacity 0.45s ease ${i * 70}ms, transform 0.45s ease ${i * 70}ms`,
                  }}
                >
                  <div
                    className="disc-shelf-thumb"
                    style={!game.coverUrl ? { background: 'linear-gradient(150deg, var(--vp-violet), #2B2F7A)' } : undefined}
                  >
                    {game.coverUrl ? (
                      <img src={game.coverUrl} alt={game.title} loading="lazy" />
                    ) : (
                      <div className="disc-shelf-thumb-fallback">{coverInitials(game.title)}</div>
                    )}
                  </div>

                  <div className="disc-shelf-body">
                    <div className="disc-shelf-title">{game.title}</div>
                    <div className="disc-shelf-last">{idleLabel(game.daysSinceUpdate)}</div>
                  </div>

                  <span className="disc-shelf-badge">Playing</span>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Genre affinity */}
        <section style={{ marginTop: 64 }}>
          <h2 className="disc-s-title">Genre <span className="vp-gradient-text">affinity</span></h2>
          <p className="disc-s-sub">Genres ranked by your average rating.</p>

          {affinity.length === 0 ? (
            <p className="disc-empty">// rate some games to see your genre preferences</p>
          ) : (
            <GenreRadar genres={affinity} />
          )}
        </section>

      </div>
    </div>
  );
}
