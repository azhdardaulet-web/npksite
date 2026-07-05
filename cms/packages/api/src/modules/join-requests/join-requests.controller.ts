import { Router, Request, Response } from 'express';
import { z } from 'zod';
import * as XLSX from 'xlsx';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';
import { verifyHCaptcha } from '../../lib/hcaptcha';
import { sendMail } from '../../lib/mailer';
import { getSetting } from '../../lib/settings';
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

    const notifyEmail = await getSetting('notify_email');
    if (notifyEmail) {
      await sendMail({
        to: notifyEmail,
        subject: 'Новая заявка на вступление в партию',
        html: `
          <p>Поступила новая заявка на вступление (роль: ${joinRequest.role}).</p>
          <p><b>ФИО:</b> ${joinRequest.fullName}</p>
          <p><b>Телефон:</b> ${joinRequest.phone}</p>
          <p><b>Город:</b> ${joinRequest.city ?? '—'}</p>
        `,
      });
    }

    res.status(201).json({ message: 'Заявка успешно отправлена', id: joinRequest.id });
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: GET /cms/api/v1/join-requests ───────────────────────────────────────
// По ТЗ (п. 6.1) заявки на вступление видит только Администратор — остальные
// роли отвечают за новости/контент/обращения, но не за приём в партию.

const requireCms = [authenticateToken, requireRole('ADMIN')];

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

const ROLE_LABEL: Record<string, string> = {
  member: 'Член партии',
  volunteer: 'Волонтёр',
  observer: 'Наблюдатель',
};

const STATUS_LABEL: Record<string, string> = {
  NEW: 'Новая',
  PROCESSING: 'В обработке',
  ACCEPTED: 'Принята',
  REJECTED: 'Отклонена',
};

cmsJoinRequestsRouter.get('/export', ...requireCms, async (req: Request, res: Response): Promise<void> => {
  const parsed = ListQuerySchema.omit({ page: true, limit: true }).safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Некорректные параметры', details: parsed.error.flatten() });
    return;
  }

  try {
    const { status, role, q } = parsed.data;
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

    const requests = await prisma.joinRequest.findMany({ where, orderBy: { createdAt: 'desc' } });

    const rows = requests.map((r) => ({
      'Дата': r.createdAt.toLocaleString('ru-RU'),
      'ФИО': r.fullName,
      'Роль': ROLE_LABEL[r.role] ?? r.role,
      'Телефон': r.phone,
      'Email': r.email ?? '',
      'Город': r.city ?? '',
      'Статус': STATUS_LABEL[r.status] ?? r.status,
      'Телефон подтверждён': r.phoneVerified ? 'Да' : 'Нет',
    }));

    const sheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Заявки');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="zayavki.xlsx"');
    res.send(buffer);
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
