import { Router } from 'express';
import { pool } from '../db/client';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { serverError } from '../lib/errors';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/users', async (_req, res) => {
  try {
    const result = await pool.query<{
      id: number;
      email: string;
      username: string;
      is_admin: boolean;
      created_at: string;
      vault_count: string;
    }>(`
      SELECT u.id, u.email, u.username, u.is_admin, u.created_at,
             COUNT(ve.id) AS vault_count
      FROM users u
      LEFT JOIN vault_entries ve ON ve.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at ASC
    `);
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: serverError(err) });
  }
});

router.get('/users/:id/vault', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) { res.status(400).json({ error: 'Invalid user id' }); return; }
  try {
    const result = await pool.query(`
      SELECT ve.id, ve.status, ve.rating, ve.notes, ve.created_at, ve.updated_at,
             g.title, g.cover_url, g.platforms
      FROM vault_entries ve
      JOIN games g ON g.id = ve.game_id
      WHERE ve.user_id = $1
      ORDER BY ve.created_at DESC
    `, [userId]);
    res.json({ entries: result.rows });
  } catch (err) {
    res.status(500).json({ error: serverError(err) });
  }
});

router.patch('/users/:id/vault/:entryId', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const entryId = parseInt(req.params.entryId, 10);
  if (isNaN(userId) || isNaN(entryId)) { res.status(400).json({ error: 'Invalid id' }); return; }

  const { status, rating, notes } = req.body as {
    status?: string;
    rating?: number | null;
    notes?: string;
  };

  try {
    const result = await pool.query(`
      UPDATE vault_entries
      SET status     = COALESCE($1, status),
          rating     = COALESCE($2, rating),
          notes      = COALESCE($3, notes),
          updated_at = NOW()
      WHERE id = $4 AND user_id = $5
      RETURNING *
    `, [status ?? null, rating ?? null, notes ?? null, entryId, userId]);

    if (result.rowCount === 0) { res.status(404).json({ error: 'Entry not found' }); return; }
    res.json({ entry: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: serverError(err) });
  }
});

router.delete('/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) { res.status(400).json({ error: 'Invalid user id' }); return; }
  if (userId === req.user!.userId) {
    res.status(400).json({ error: 'Cannot delete your own account' });
    return;
  }
  try {
    await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: serverError(err) });
  }
});

export default router;
