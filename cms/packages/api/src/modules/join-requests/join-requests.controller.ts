import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';
import { verifyHCaptcha } from '../../lib/hcaptcha';
import { JoinRequestRoleSchema, GenderSchema, kzPhoneSchema } from '@dar-rail/shared';
import { Prisma } from '@prisma/client';

export const joinRequestsRouter = Router();
export const cmsJoinRequestsRouter = Router();

function handleError(err: unknown, res: Response): void {
  const e = err as { message?: string; status?: number };
  res.status(e.status ?? 500).json({ error: e.message ?? 'Внутренняя ошибка' });
}

const JoinRequestInputSchema = z.object({
  role: JoinRequestRoleSchema.default('member'),
  fullName: z.string().min(1),
  birthDate: z.coerce.date().optional(),
  gender: GenderSchema.optional(),
  phone: kzPhoneSchema,
  email: z.string().email().optional(),
  city: z.string().min(1).optional(),
  branchId: z.string().uuid().optional(),
  merchAddress: z.string().max(500).optional(),
  hCaptchaToken: z.string().min(1, 'Пройдите проверку hCaptcha'),
});

// ─── Public: POST /api/v1/join-requests ───────────────────────────────────────
// Верификация телефона по SMS реализуется в Этапе 5 — пока принимаем как есть
// (phoneVerified=false).

joinRequestsRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const parsed = JoinRequestInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const captchaOk = await verifyHCaptcha(parsed.data.hCaptchaToken);
    if (!captchaOk) {
      res.status(400).json({ error: 'Неверная капча' });
      return;
    }

    const { hCaptchaToken: _t, ...data } = parsed.data;
    const joinRequest = await prisma.joinRequest.create({ data });
    res.status(201).json({ message: 'Заявка успешно отправлена', id: joinRequest.id });
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: GET /cms/api/v1/join-requests ───────────────────────────────────────

const requireCms = [
  authenticateToken,
  requireRole('RECEPTION_MANAGER', 'CHIEF_EDITOR', 'ADMIN'),
];

const ListQuerySchema = z.object({
  status: z.enum(['NEW', 'PROCESSING', 'ACCEPTED', 'REJECTED']).optional(),
  role: JoinRequestRoleSchema.optional(),
  q: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

cmsJoinRequestsRouter.get('/', ...requireCms, async (req: Request, res: Response): Promise<void> => {
  const parsed = ListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Некорректные параметры', details: parsed.error.flatten() });
    return;
  }

  try {
    const { status, role, q, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Prisma.JoinRequestWhereInput = {
      ...(status ? { status } : {}),
      ...(role ? { role } : {}),
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: 'insensitive' as const } },
              { phone: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.joinRequest.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.joinRequest.count({ where }),
    ]);

    res.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    handleError(err, res);
  }
});

cmsJoinRequestsRouter.get('/:id', ...requireCms, async (req: Request, res: Response): Promise<void> => {
  try {
    const joinRequest = await prisma.joinRequest.findUnique({ where: { id: String(req.params['id']) } });
    if (!joinRequest) {
      res.status(404).json({ error: 'Заявка не найдена' });
      return;
    }
    res.json(joinRequest);
  } catch (err) {
    handleError(err, res);
  }
});

const UpdateStatusSchema = z.object({
  status: z.enum(['NEW', 'PROCESSING', 'ACCEPTED', 'REJECTED']),
});

cmsJoinRequestsRouter.put('/:id/status', ...requireCms, async (req: Request, res: Response): Promise<void> => {
  const parsed = UpdateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const joinRequest = await prisma.joinRequest.update({
      where: { id: String(req.params['id']) },
      data: { status: parsed.data.status },
    });
    res.json(joinRequest);
  } catch (err) {
    handleError(err, res);
  }
});
