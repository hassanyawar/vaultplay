import { Router, Request, Response } from 'express';
import { pool } from '../db/client';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { status, platform, rating, sort } = req.query as Record<string, string | undefined>;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status) {
    params.push(status);
    conditions.push(`ve.status = $${params.length}::vault_status`);
  }

  if (platform) {
    params.push(platform);
    conditions.push(`$${params.length} = ANY(g.platforms)`);
  }

  if (rating) {
    const r = parseInt(rating, 10);
    if (!isNaN(r) && r >= 1 && r <= 10) {
      params.push(r);
      conditions.push(`ve.rating = $${params.length}`);
    }
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSorts: Record<string, string> = {
    rating_desc: 've.rating DESC NULLS LAST',
    rating_asc: 've.rating ASC NULLS LAST',
    title_asc: 'g.title ASC',
    title_desc: 'g.title DESC',
    added_desc: 've.created_at DESC',
    added_asc: 've.created_at ASC',
  };
  const orderBy = allowedSorts[sort ?? ''] ?? 've.created_at DESC';

  try {
    const result = await pool.query(
      `SELECT
         ve.id, ve.status, ve.rating, ve.notes, ve.review,
         ve.created_at, ve.updated_at,
         g.id AS game_id, g.rawg_id, g.title, g.cover_url,
         g.platforms, g.genres, g.release_year
       FROM vault_entries ve
       JOIN games g ON g.id = ve.game_id
       ${where}
       ORDER BY ${orderBy}`,
      params
    );
    res.json({ entries: result.rows });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid vault entry id' });
    return;
  }

  const { status, rating, notes, review } = req.body as {
    status?: string;
    rating?: number | null;
    notes?: string | null;
    review?: string | null;
  };

  const allowedStatuses = ['backlog', 'playing', 'completed'];
  if (status !== undefined && !allowedStatuses.includes(status)) {
    res.status(400).json({ error: 'status must be backlog, playing, or completed' });
    return;
  }

  if (rating !== undefined && rating !== null && (rating < 1 || rating > 10)) {
    res.status(400).json({ error: 'rating must be between 1 and 10' });
    return;
  }

  const fields: string[] = [];
  const params: unknown[] = [];

  if (status !== undefined) {
    params.push(status);
    fields.push(`status = $${params.length}::vault_status`);
    if (status === 'completed') {
      fields.push(`completed_at = NOW()`);
    } else {
      fields.push(`completed_at = NULL`);
    }
  }
  if (rating !== undefined) {
    params.push(rating);
    fields.push(`rating = $${params.length}`);
  }
  if (notes !== undefined) {
    params.push(notes);
    fields.push(`notes = $${params.length}`);
  }
  if (review !== undefined) {
    params.push(review);
    fields.push(`review = $${params.length}`);
  }

  if (fields.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  fields.push(`updated_at = NOW()`);
  params.push(id);

  try {
    const result = await pool.query(
      `UPDATE vault_entries SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Vault entry not found' });
      return;
    }

    res.json({ entry: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/platforms', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT unnest(g.platforms) AS platform
       FROM vault_entries ve
       JOIN games g ON g.id = ve.game_id
       ORDER BY platform`
    );
    res.json({ platforms: result.rows.map((r: { platform: string }) => r.platform) });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid vault entry id' });
    return;
  }

  try {
    const result = await pool.query(
      `DELETE FROM vault_entries WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Vault entry not found' });
      return;
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
