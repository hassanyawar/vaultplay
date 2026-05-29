import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  userId: number;
  email: string;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
declare global { namespace Express { interface Request { user?: AuthPayload } } }

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.token as string | undefined;
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
