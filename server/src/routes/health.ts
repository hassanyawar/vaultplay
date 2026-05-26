import { Router, Request, Response } from 'express';
import { pool } from '../db/client';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

router.get('/db-health', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT 1 AS connected');
    res.json({ status: 'ok', db: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: (err as Error).message });
  }
});

export default router;
