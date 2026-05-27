import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health';
import gamesRouter from './routes/games';
import vaultRouter from './routes/vault';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());

app.use('/api', healthRouter);
app.use('/api/games', gamesRouter);
app.use('/api/vault', vaultRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
