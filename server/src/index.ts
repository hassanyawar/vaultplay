import dotenv from 'dotenv';
dotenv.config();

// Fail fast if required secrets are missing
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set in server/.env');
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set in server/.env');
if (!process.env.RAWG_API_KEY) throw new Error('RAWG_API_KEY is not set in server/.env');

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import gamesRouter from './routes/games';
import vaultRouter from './routes/vault';
import discoverRouter from './routes/discover';
import statsRouter from './routes/stats';
import adminRouter from './routes/admin';
import { serverError } from './lib/errors';

const app = express();
const PORT = process.env.PORT ?? 3000;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later' },
});

app.use(cors({
  origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api', healthRouter);
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/games', gamesRouter);
app.use('/api/vault', vaultRouter);
app.use('/api/discover', discoverRouter);
app.use('/api/stats', statsRouter);
app.use('/api/admin', adminRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ error: serverError(err) });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
