import { Router, Request, Response } from 'express';
import { discoveryService } from '../services/discovery';
import { requireAuth } from '../middleware/auth';
import { serverError } from '../lib/errors';

const router = Router();

router.use(requireAuth);

router.get('/next', async (req: Request, res: Response) => {
  try {
    const recommendations = await discoveryService.getNextToPlay(req.user!.userId);
    res.json({ recommendations });
  } catch (err) {
    res.status(500).json({ error: serverError(err) });
  }
});

router.get('/stalled', async (req: Request, res: Response) => {
  try {
    const stalled = await discoveryService.getStalledGames(req.user!.userId);
    res.json({ stalled });
  } catch (err) {
    res.status(500).json({ error: serverError(err) });
  }
});

router.get('/genre-affinity', async (req: Request, res: Response) => {
  try {
    const affinity = await discoveryService.getGenreAffinity(req.user!.userId);
    res.json({ affinity });
  } catch (err) {
    res.status(500).json({ error: serverError(err) });
  }
});

export default router;
