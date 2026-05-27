import { Router, Request, Response } from 'express';
import { pool } from '../db/client';
import { searchGames } from '../services/rawg';
import type { GameSearchResult } from '../types/rawg';

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
  const q = req.query.q as string | undefined;

  if (!q || q.trim().length === 0) {
    res.status(400).json({ error: 'Query parameter "q" is required' });
    return;
  }

  try {
    const results = await searchGames(q.trim());
    res.json({ results });
  } catch (err) {
    res.status(502).json({ error: (err as Error).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const { rawgId, title, coverUrl, platforms, genres, releaseYear } =
    req.body as GameSearchResult;

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
      res.status(200).json({ message: 'Game already in vault', alreadyExists: true });
      return;
    }

    res.status(201).json({ game: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
