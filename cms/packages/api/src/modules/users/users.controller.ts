import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { hashPassword } from '../auth/auth.service';
import { requireAdmin } from '../../middleware/auth';
import { CreateUserSchema } from '@dar-rail/shared';

export const usersRouter = Router();

// All users routes require ADMIN
usersRouter.use(requireAdmin);

// GET /cms/api/v1/users
usersRouter.get('/', async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      branchId: true,
      section: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

// POST /cms/api/v1/users
usersRouter.post('/', async (req: Request, res: Response) => {
  const parsed = CreateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    return;
  }

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash: await hashPassword(parsed.data.password),
      role: parsed.data.role,
      branchId: parsed.data.branchId ?? null,
      section: parsed.data.section ?? null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      branchId: true,
      section: true,
      createdAt: true,
    },
  });

  res.status(201).json(user);
});

const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z
    .enum(['ADMIN', 'CHIEF_EDITOR', 'SECTION_EDITOR', 'RECEPTION_MANAGER', 'DEPUTY'])
    .optional(),
  status: z.enum(['ACTIVE', 'BLOCKED']).optional(),
  branchId: z.string().uuid().optional().nullable(),
  section: z.string().max(200).optional().nullable(),
});

// PUT /cms/api/v1/users/:id
usersRouter.put('/:id', async (req: Request, res: Response) => {
  const parsed = UpdateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  // Prevent self-demotion
  if (req.user?.id === req.params.id && parsed.data.status === 'BLOCKED') {
    res.status(400).json({ error: 'Нельзя заблокировать свой собственный аккаунт' });
    return;
  }

  const user = await prisma.user.update({
    where: { id: req.params.id as string },
    data: parsed.data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      branchId: true,
      section: true,
      updatedAt: true,
    },
  }).catch(() => null);

  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' });
    return;
  }

  res.json(user);
});

// DELETE /cms/api/v1/users/:id — soft delete (block)
usersRouter.delete('/:id', async (req: Request, res: Response) => {
  if (req.user?.id === req.params.id) {
    res.status(400).json({ error: 'Нельзя удалить свой собственный аккаунт' });
    return;
  }

  const user = await prisma.user.update({
    where: { id: req.params.id as string },
    data: { status: 'BLOCKED' },
    select: { id: true, status: true },
  }).catch(() => null);

  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' });
    return;
  }

  res.json({ message: 'Пользователь заблокирован' });
});
