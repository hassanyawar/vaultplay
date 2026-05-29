import { Router } from 'express';
import { pool } from '../db/client';

const router = Router();

router.get('/summary', async (_req, res) => {
  const result = await pool.query<{
    total: number;
    backlog: number;
    playing: number;
    completed: number;
    average_rating: number | null;
    last_activity_at: string | null;
  }>(`
    SELECT
      COUNT(*)::int                                                         AS total,
      COUNT(*) FILTER (WHERE status = 'backlog')::int                      AS backlog,
      COUNT(*) FILTER (WHERE status = 'playing')::int                      AS playing,
      COUNT(*) FILTER (WHERE status = 'completed')::int                    AS completed,
      ROUND(AVG(rating) FILTER (WHERE rating IS NOT NULL), 1)              AS average_rating,
      MAX(created_at)                                                       AS last_activity_at
    FROM vault_entries
  `);

  const row = result.rows[0];
  res.json({
    summary: {
      total: row.total,
      backlog: row.backlog,
      playing: row.playing,
      completed: row.completed,
      averageRating: row.average_rating !== null ? Number(row.average_rating) : null,
      lastActivityAt: row.last_activity_at ?? null,
    },
  });
});

router.get('/currently-playing', async (_req, res) => {
  const result = await pool.query<{
    id: number;
    game_id: number;
    title: string;
    cover_url: string | null;
    platforms: string[];
    days_since_playing: number;
  }>(`
    SELECT
      ve.id,
      g.id          AS game_id,
      g.title,
      g.cover_url,
      g.platforms,
      EXTRACT(DAY FROM NOW() - ve.updated_at)::int AS days_since_playing
    FROM vault_entries ve
    JOIN games g ON g.id = ve.game_id
    WHERE ve.status = 'playing'
    ORDER BY ve.updated_at DESC
    LIMIT 3
  `);

  res.json({
    games: result.rows.map((row) => ({
      vaultEntryId: row.id,
      gameId: row.game_id,
      title: row.title,
      coverUrl: row.cover_url,
      platforms: row.platforms,
      daysSincePlaying: row.days_since_playing,
    })),
  });
});

router.get('/recently-added', async (_req, res) => {
  const result = await pool.query<{
    id: number;
    game_id: number;
    title: string;
    cover_url: string | null;
    added_at: string;
  }>(`
    SELECT
      ve.id,
      g.id          AS game_id,
      g.title,
      g.cover_url,
      ve.created_at AS added_at
    FROM vault_entries ve
    JOIN games g ON g.id = ve.game_id
    ORDER BY ve.created_at DESC
    LIMIT 4
  `);

  res.json({
    games: result.rows.map((row) => ({
      vaultEntryId: row.id,
      gameId: row.game_id,
      title: row.title,
      coverUrl: row.cover_url,
      addedAt: row.added_at,
    })),
  });
});

router.get('/completions-by-month', async (_req, res) => {
  const result = await pool.query<{
    year: number;
    month: number;
    count: number;
  }>(`
    SELECT
      EXTRACT(YEAR  FROM updated_at)::int AS year,
      EXTRACT(MONTH FROM updated_at)::int AS month,
      COUNT(*)::int                       AS count
    FROM vault_entries
    WHERE status = 'completed'
    GROUP BY year, month
    ORDER BY year ASC, month ASC
  `);

  res.json({
    completions: result.rows.map((row) => ({
      year: row.year,
      month: row.month,
      count: row.count,
    })),
  });
});

router.get('/genre-breakdown', async (_req, res) => {
  const result = await pool.query<{
    genre: string;
    count: number;
  }>(`
    SELECT
      unnest(g.genres) AS genre,
      COUNT(*)::int    AS count
    FROM vault_entries ve
    JOIN games g ON g.id = ve.game_id
    GROUP BY genre
    ORDER BY count DESC
    LIMIT 10
  `);

  res.json({
    breakdown: result.rows.map((row) => ({
      genre: row.genre,
      count: row.count,
    })),
  });
});

export default router;
