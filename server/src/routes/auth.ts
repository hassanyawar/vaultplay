import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db/client';
import { requireAuth } from '../middleware/auth';

const router = Router();
const SALT_ROUNDS = 12;
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

router.post('/register', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Invalid email address' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query<{ id: number; email: string }>(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email`,
      [email.toLowerCase().trim(), passwordHash]
    );
    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );
    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(201).json({ user: { id: user.id, email: user.email } });
  } catch (err: unknown) {
    const pg = err as { code?: string };
    if (pg.code === '23505') {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const result = await pool.query<{ id: number; email: string; password_hash: string }>(
      `SELECT id, email, password_hash FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );
    const user = result.rows[0];

    // Use constant-time comparison even on missing user to prevent timing attacks
    const validPassword = user
      ? await bcrypt.compare(password, user.password_hash)
      : await bcrypt.compare(password, '$2b$12$invalidhashpadding000000000000000000000000000000000000');

    if (!user || !validPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );
    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ message: 'Logged out' });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.patch('/password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current password and new password are required' });
    return;
  }
  if (newPassword.length < 8) {
    res.status(400).json({ error: 'New password must be at least 8 characters' });
    return;
  }

  try {
    const result = await pool.query<{ password_hash: string }>(
      `SELECT password_hash FROM users WHERE id = $1`,
      [req.user!.userId]
    );
    const user = result.rows[0];
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await pool.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [
      newHash,
      req.user!.userId,
    ]);
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
