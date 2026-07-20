import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { Role } from '@npk/shared';

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: Role;
        branchId: string | null;
        section: string | null;
      };
    }
  }
}

interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
  iat?: number;
  exp?: number;
}

/**
 * Verifies JWT from Authorization: Bearer <token> header.
 * Attaches decoded user to req.user on success.
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Требуется авторизация' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true, status: true, branchId: true, section: true },
    });

    if (!user || user.status === 'BLOCKED') {
      res.status(401).json({ error: 'Пользователь не найден или заблокирован' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      branchId: user.branchId,
      section: user.section,
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Токен истёк', code: 'TOKEN_EXPIRED' });
    } else {
      res.status(401).json({ error: 'Недействительный токен' });
    }
  }
}

/**
 * Role-based access control middleware.
 * Must be called AFTER authenticateToken.
 * Роли НПК не образуют строгую иерархию (у каждой свой участок доступа) —
 * проверяем принадлежность к списку разрешённых ролей. ADMIN разрешён всегда.
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Требуется авторизация' });
      return;
    }

    const hasAccess = req.user.role === 'ADMIN' || allowedRoles.includes(req.user.role);

    if (!hasAccess) {
      logger.warn(`Access denied: user ${req.user.email} (${req.user.role}) tried to access restricted resource`, {
        path: req.path,
        required: allowedRoles,
      });
      res.status(403).json({ error: 'Недостаточно прав доступа' });
      return;
    }

    next();
  };
}

// Shorthand middleware combinations
export const requireAdmin = [authenticateToken, requireRole('ADMIN')];
export const requireNewsEditor = [
  authenticateToken,
  requireRole('CHIEF_EDITOR', 'SECTION_EDITOR', 'ADMIN'),
];
export const requireContentManager = [
  authenticateToken,
  requireRole('CHIEF_EDITOR', 'SECTION_EDITOR', 'DEPUTY', 'ADMIN'),
];
export const requireReceptionManager = [
  authenticateToken,
  requireRole('RECEPTION_MANAGER', 'ADMIN'),
];
