import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import gamesRouter from './routes/games';
import vaultRouter from './routes/vault';
import discoverRouter from './routes/discover';
import statsRouter from './routes/stats';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors({
  origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/games', gamesRouter);
app.use('/api/vault', vaultRouter);
app.use('/api/discover', discoverRouter);
app.use('/api/stats', statsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
