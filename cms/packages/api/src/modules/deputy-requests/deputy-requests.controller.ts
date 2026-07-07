import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';

// CMS-CRUD для депутатских запросов фракции — хранятся как Document с
// type=deputy_request (см. Часть 2 docs/PLAN.md). В отличие от Устава/
// пресс-кита, запросы не привязаны к загруженному PDF — fileUrl это ссылка
// на полный текст (внешняя или на медиабиблиотеку), поэтому CRUD тут JSON,
// без multer.

export const cmsDeputyRequestsRouter = Router();

const DeputyRequestInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  fileUrl: z.string().url(),
  publishedAt: z.coerce.date().optional(),
});

function handleError(err: unknown, res: Response): void {
  const e = err as { message?: string; status?: number };
  res.status(e.status ?? 500).json({ error: e.message ?? 'Внутренняя ошибка' });
}

const requireFaction = [
  authenticateToken,
  requireRole('FACTION', 'CHIEF_EDITOR', 'ADMIN'),
];

// GET /cms/api/v1/deputy-requests
cmsDeputyRequestsRouter.get('/', ...requireFaction, async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await prisma.document.findMany({
      where: { type: 'deputy_request' },
      orderBy: [{ publishedAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
    });
    res.json(items);
  } catch (err) {
    handleError(err, res);
  }
});

// POST /cms/api/v1/deputy-requests
cmsDeputyRequestsRouter.post('/', ...requireFaction, async (req: Request, res: Response): Promise<void> => {
  const parsed = DeputyRequestInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const publishedAt = parsed.data.publishedAt ?? new Date();
    const item = await prisma.document.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        type: 'deputy_request',
        fileUrl: parsed.data.fileUrl,
        fileName: `${parsed.data.title.slice(0, 60)}.html`,
        fileSize: 0,
        year: publishedAt.getFullYear(),
        publishedAt,
      },
    });
    res.status(201).json(item);
  } catch (err) {
    handleError(err, res);
  }
});

// PUT /cms/api/v1/deputy-requests/:id
cmsDeputyRequestsRouter.put('/:id', ...requireFaction, async (req: Request, res: Response): Promise<void> => {
  const parsed = DeputyRequestInputSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const { publishedAt, ...rest } = parsed.data;
    const item = await prisma.document.update({
      where: { id: String(req.params['id']) },
      data: {
        ...rest,
        ...(publishedAt ? { publishedAt, year: publishedAt.getFullYear() } : {}),
      },
    });
    res.json(item);
  } catch (err) {
    handleError(err, res);
  }
});

// DELETE /cms/api/v1/deputy-requests/:id
cmsDeputyRequestsRouter.delete('/:id', ...requireFaction, async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.document.delete({ where: { id: String(req.params['id']) } });
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
});
