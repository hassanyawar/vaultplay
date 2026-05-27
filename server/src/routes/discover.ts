import { Router, Request, Response } from 'express';
import { discoveryService } from '../services/discovery';

const router = Router();

router.get('/next', async (_req: Request, res: Response) => {
  try {
    const recommendations = await discoveryService.getNextToPlay();
    res.json({ recommendations });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/stalled', async (_req: Request, res: Response) => {
  try {
    const stalled = await discoveryService.getStalledGames();
    res.json({ stalled });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/genre-affinity', async (_req: Request, res: Response) => {
  try {
    const affinity = await discoveryService.getGenreAffinity();
    res.json({ affinity });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
