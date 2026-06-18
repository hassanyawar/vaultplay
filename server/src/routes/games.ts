import { Router, Request, Response } from 'express';
import { pool } from '../db/client';
import { searchGames, getPopularGames } from '../services/rawg';
import type { GameSearchResult } from '../types/rawg';
import { requireAuth } from '../middleware/auth';
import { serverError } from '../lib/errors';

const router = Router();

let popularCache: { results: GameSearchResult[]; fetchedAt: number } | null = null;
const POPULAR_CACHE_TTL = 60 * 60 * 1000; // 1 hour

router.get('/popular', requireAuth, async (_req: Request, res: Response) => {
  if (popularCache && Date.now() - popularCache.fetchedAt < POPULAR_CACHE_TTL) {
    res.json({ results: popularCache.results });
    return;
  }
  try {
    const { results } = await getPopularGames();
    popularCache = { results, fetchedAt: Date.now() };
    res.json({ results });
  } catch (err) {
    res.status(502).json({ error: (err as Error).message });
  }
});

router.get('/search', requireAuth, async (req: Request, res: Response) => {
  const q = req.query.q as string | undefined;
  const page = Math.max(1, parseInt((req.query.page as string) ?? '1', 10) || 1);

  if (!q || q.trim().length === 0) {
    res.status(400).json({ error: 'Query parameter "q" is required' });
    return;
  }

  try {
    const { results, hasMore } = await searchGames(q.trim(), page);
    res.json({ results, hasMore });
  } catch (err) {
    res.status(502).json({ error: (err as Error).message });
  }
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  const { rawgId, title, coverUrl, platforms, genres, releaseYear } =
    req.body as GameSearchResult;
  const userId = req.user!.userId;

  if (!rawgId || !title) {
    res.status(400).json({ error: 'rawgId and title are required' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO games (rawg_id, title, cover_url, platforms, genres, release_year)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (rawg_id) DO NOTHING
       RETURNING *`,
      [rawgId, title, coverUrl ?? null, platforms ?? [], genres ?? [], releaseYear ?? null]
    );

    if (result.rowCount === 0) {
      // Game row exists — check if this user's vault entry was deleted and needs to be recreated
      const existing = await pool.query('SELECT * FROM games WHERE rawg_id = $1', [rawgId]);
      const game = existing.rows[0];
      const vaultCheck = await pool.query(
        'SELECT id FROM vault_entries WHERE game_id = $1 AND user_id = $2',
        [game.id, userId]
      );
      if (vaultCheck.rowCount === 0) {
        await pool.query(
          'INSERT INTO vault_entries (game_id, user_id) VALUES ($1, $2)',
          [game.id, userId]
        );
        res.status(201).json({ game });
        return;
      }
      res.status(200).json({ message: 'Game already in vault', alreadyExists: true });
      return;
    }

    const game = result.rows[0];
    await pool.query(
      `INSERT INTO vault_entries (game_id, user_id) VALUES ($1, $2)`,
      [game.id, userId]
    );

    res.status(201).json({ game });
  } catch (err) {
    res.status(500).json({ error: serverError(err) });
  }
});

export default router;
