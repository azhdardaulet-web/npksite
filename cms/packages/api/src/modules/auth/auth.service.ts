import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';
import { Role } from '@dar-rail/shared';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRES = process.env.JWT_EXPIRES_IN ?? '15m';
const REFRESH_TOKEN_EXPIRES_DAYS = 7;

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  branchId: string | null;
  section: string | null;
}

interface LoginResult {
  accessToken: string;
  user: AuthUser;
}

/**
 * Attempt login with email + password.
 * Logs failed attempts with IP for security auditing.
 */
export async function login(
  email: string,
  password: string,
  ip: string
): Promise<LoginResult> {
  const user = await prisma.user.findUnique({ where: { email } });

  // Constant-time compare to prevent timing attacks
  const dummyHash = '$2b$12$invalidhashforcomparisonpurposes000000000000000000';
  const isValid = user
    ? await bcrypt.compare(password, user.passwordHash)
    : await bcrypt.compare(password, dummyHash); // run compare anyway

  if (!user || !isValid || user.status === 'BLOCKED') {
    logger.warn('Failed login attempt', { email, ip });
    throw new Error('INVALID_CREDENTIALS');
  }

  const accessToken = generateAccessToken(user);
  await saveRefreshToken(user.id);

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      branchId: user.branchId,
      section: user.section,
    },
  };
}

/**
 * Verify refresh token from httpOnly cookie, issue new access token.
 */
export async function refreshAccessToken(rawToken: string): Promise<string> {
  const tokenHash = hashToken(rawToken);

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!stored || stored.expiresAt < new Date()) {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  if (stored.user.status === 'BLOCKED') {
    throw new Error('USER_BLOCKED');
  }

  return generateAccessToken(stored.user);
}

/**
 * Invalidate refresh token on logout.
 */
export async function logout(rawToken: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  await prisma.refreshToken.deleteMany({ where: { tokenHash } });
}

/**
 * Create and persist a refresh token for userId.
 * Returns the raw token to be set as httpOnly cookie.
 */
export async function saveRefreshToken(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(64).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000
  );

  // Clean up old tokens for this user (keep last 3 sessions)
  const oldTokens = await prisma.refreshToken.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip: 2,
    select: { id: true },
  });
  if (oldTokens.length > 0) {
    await prisma.refreshToken.deleteMany({
      where: { id: { in: oldTokens.map((t) => t.id) } },
    });
  }

  await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return rawToken;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateAccessToken(user: { id: string; email: string; name: string; role: string }): string {
  return jwt.sign(
    { userId: user.id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: ACCESS_TOKEN_EXPIRES } as jwt.SignOptions
  );
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}
