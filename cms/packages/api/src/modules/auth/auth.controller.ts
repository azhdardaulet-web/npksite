import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { LoginSchema } from '@dar-rail/shared';
import { login, refreshAccessToken, logout, saveRefreshToken } from './auth.service';
import { authenticateToken } from '../../middleware/auth';

export const authRouter = Router();

const COOKIE_NAME = 'refreshToken';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

// POST /api/v1/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const { accessToken, user } = await login(
      parsed.data.email,
      parsed.data.password,
      req.ip ?? 'unknown'
    );

    // Issue refresh token as httpOnly cookie
    const rawRefresh = await saveRefreshToken(user.id);
    res.cookie(COOKIE_NAME, rawRefresh, COOKIE_OPTIONS);

    res.json({ accessToken, user });
  } catch (err) {
    console.error('Login Error:', err);
    if ((err as Error).message === 'INVALID_CREDENTIALS') {
      res.status(401).json({ error: 'Неверный email или пароль' });
    } else {
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }
});

// POST /api/v1/auth/refresh
authRouter.post('/refresh', async (req: Request, res: Response) => {
  const rawToken: string | undefined = req.cookies[COOKIE_NAME];

  if (!rawToken) {
    res.status(401).json({ error: 'Refresh token отсутствует' });
    return;
  }

  try {
    const accessToken = await refreshAccessToken(rawToken);
    res.json({ accessToken });
  } catch (err) {
    const msg = (err as Error).message;
    res.clearCookie(COOKIE_NAME);
    if (msg === 'USER_BLOCKED') {
      res.status(403).json({ error: 'Пользователь заблокирован' });
    } else {
      res.status(401).json({ error: 'Сессия истекла, войдите снова' });
    }
  }
});

// POST /api/v1/auth/logout
authRouter.post('/logout', async (req: Request, res: Response) => {
  const rawToken: string | undefined = req.cookies[COOKIE_NAME];

  if (rawToken) {
    await logout(rawToken).catch(() => {
      // Ignore — token may already be gone
    });
  }

  res.clearCookie(COOKIE_NAME);
  res.json({ message: 'Выход выполнен' });
});

// GET /api/v1/auth/me
authRouter.get('/me', authenticateToken, (req: Request, res: Response) => {
  res.json({ user: req.user });
});
