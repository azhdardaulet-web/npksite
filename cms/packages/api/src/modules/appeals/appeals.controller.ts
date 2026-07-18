import { Router, Request, Response } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';
import { verifyHCaptcha } from '../../lib/hcaptcha';
import { sendMail } from '../../lib/mailer';
import { getSetting } from '../../lib/settings';
import { minioClient, MINIO_BUCKET, objectUrl } from '../../lib/minio';
import { kzPhoneSchema } from '@dar-rail/shared';
import { Prisma } from '@prisma/client';

const APPEAL_STATUS_LABEL: Record<string, string> = {
  NEW: 'Новое',
  IN_PROGRESS: 'В обработке',
  RESOLVED: 'Решено',
  REJECTED: 'Отклонено',
};

export const appealsRouter = Router();
export const appealTopicsRouter = Router();
export const cmsAppealsRouter = Router();

function handleError(err: unknown, res: Response): void {
  const e = err as { message?: string; status?: number };
  res.status(e.status ?? 500).json({ error: e.message ?? 'Внутренняя ошибка' });
}

const AttachmentSchema = z.object({
  url: z.string().url(),
  fileName: z.string().min(1),
  fileSize: z.number().int().min(0),
  kind: z.enum(['statement', 'additional']),
});

const AppealInputSchema = z.object({
  fullName: z.string().min(1),
  phone: kzPhoneSchema,
  email: z.string().email().optional(),
  topicId: z.string().uuid(),
  message: z.string().min(10),
  fileUrl: z.string().url().optional(),
  attachments: z.array(AttachmentSchema).max(4).optional(),
  hCaptchaToken: z.string().min(1, 'Пройдите проверку hCaptcha'),
});

// Генерирует номер обращения в формате NPK-2026-00001 — считаем количество
// обращений за текущий год и берём следующий порядковый номер.
async function generateAppealNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.appeal.count({
    where: { appealNumber: { startsWith: `NPK-${year}-` } },
  });
  const next = String(count + 1).padStart(5, '0');
  return `NPK-${year}-${next}`;
}

// ─── Public: POST /api/v1/appeals ──────────────────────────────────────────────

appealsRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const parsed = AppealInputSchema.safeParse(req.body);
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
    const appealNumber = await generateAppealNumber();

    const appeal = await prisma.appeal.create({ data: { ...data, appealNumber } });

    const notifyEmail = await getSetting('notify_email');
    if (notifyEmail) {
      await sendMail({
        to: notifyEmail,
        subject: `Новое обращение ${appeal.appealNumber}`,
        html: `
          <p>Поступило новое обращение в общественную приёмную.</p>
          <p><b>Номер:</b> ${appeal.appealNumber}</p>
          <p><b>ФИО:</b> ${appeal.fullName}</p>
          <p><b>Телефон:</b> ${appeal.phone}</p>
          <p><b>Текст:</b> ${appeal.message}</p>
        `,
      });
    }

    res.status(201).json({ message: 'Обращение принято', appealNumber: appeal.appealNumber, id: appeal.id });
  } catch (err) {
    handleError(err, res);
  }
});

// ─── Public: POST /api/v1/appeals/attachments ──────────────────────────────────
// Загрузка заявления/доп. документов к письменному обращению ДО отправки формы.
// Без авторизации (гражданин на сайте не залогинен) — поэтому строгий белый
// список MIME-типов и лимит размера вместо auth.

const ATTACHMENT_MIME = new Set(['application/pdf', 'image/jpeg', 'image/png']);

const attachmentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ATTACHMENT_MIME.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Недопустимый тип файла: ${file.mimetype}. Разрешены PDF, JPG, PNG`));
    }
  },
});

appealsRouter.post(
  '/attachments',
  (req: Request, res: Response, next) => {
    attachmentUpload.single('file')(req, res, (err) => {
      if (err) { res.status(400).json({ error: err.message ?? 'Ошибка загрузки файла' }); return; }
      next();
    });
  },
  async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: 'Файл не передан' });
      return;
    }
    try {
      const ext = path.extname(req.file.originalname).toLowerCase() || `.${req.file.mimetype.split('/')[1]}`;
      const objectName = `appeals/attachments/${uuidv4()}${ext}`;
      await minioClient.putObject(MINIO_BUCKET, objectName, req.file.buffer, req.file.size, {
        'Content-Type': req.file.mimetype,
      });
      res.status(201).json({ url: objectUrl(objectName), fileName: req.file.originalname, fileSize: req.file.size });
    } catch (err) {
      handleError(err, res);
    }
  }
);

// ─── Public: GET /api/v1/appeals/resolved-count ────────────────────────────────
// «Обращений решено» на /priemnaya — статусы «Принята» (IN_PROGRESS) и «Решено»
// (RESOLVED). Считать на каждый запрос дорого при росте таблицы, поэтому
// кэшируем результат на 1 час в памяти процесса.

const RESOLVED_COUNT_TTL_MS = 60 * 60 * 1000;
let resolvedCountCache: { value: number; expiresAt: number } | null = null;

appealsRouter.get('/resolved-count', async (_req: Request, res: Response): Promise<void> => {
  try {
    if (!resolvedCountCache || resolvedCountCache.expiresAt < Date.now()) {
      const count = await prisma.appeal.count({ where: { status: { in: ['IN_PROGRESS', 'RESOLVED'] } } });
      resolvedCountCache = { value: count, expiresAt: Date.now() + RESOLVED_COUNT_TTL_MS };
    }
    res.json({ count: resolvedCountCache.value });
  } catch (err) {
    handleError(err, res);
  }
});

// ─── Public: GET /api/v1/appeal-topics ─────────────────────────────────────────

appealTopicsRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const topics = await prisma.appealTopic.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(topics);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: GET /cms/api/v1/appeals ──────────────────────────────────────────────

const requireCms = [authenticateToken, requireRole('RECEPTION_MANAGER', 'ADMIN')];

const ListQuerySchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']).optional(),
  q: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

cmsAppealsRouter.get('/', ...requireCms, async (req: Request, res: Response): Promise<void> => {
  const parsed = ListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Некорректные параметры', details: parsed.error.flatten() });
    return;
  }

  try {
    const { status, q, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Prisma.AppealWhereInput = {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: 'insensitive' as const } },
              { appealNumber: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.appeal.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { topic: true } }),
      prisma.appeal.count({ where }),
    ]);

    res.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    handleError(err, res);
  }
});

cmsAppealsRouter.get('/:id', ...requireCms, async (req: Request, res: Response): Promise<void> => {
  try {
    const appeal = await prisma.appeal.findUnique({
      where: { id: String(req.params['id']) },
      include: { topic: true },
    });
    if (!appeal) {
      res.status(404).json({ error: 'Обращение не найдено' });
      return;
    }
    res.json(appeal);
  } catch (err) {
    handleError(err, res);
  }
});

const UpdateAppealSchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']).optional(),
  internalNotes: z.string().optional(),
});

cmsAppealsRouter.put('/:id', ...requireCms, async (req: Request, res: Response): Promise<void> => {
  const parsed = UpdateAppealSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const appeal = await prisma.appeal.update({
      where: { id: String(req.params['id']) },
      data: parsed.data,
    });

    if (parsed.data.status && appeal.email) {
      await sendMail({
        to: appeal.email,
        subject: `Ваше обращение ${appeal.appealNumber}: статус изменён`,
        html: `
          <p>Здравствуйте, ${appeal.fullName}!</p>
          <p>Статус вашего обращения <b>${appeal.appealNumber}</b> изменён на:
             <b>${APPEAL_STATUS_LABEL[appeal.status] ?? appeal.status}</b>.</p>
        `,
      });
    }

    res.json(appeal);
  } catch (err) {
    handleError(err, res);
  }
});
