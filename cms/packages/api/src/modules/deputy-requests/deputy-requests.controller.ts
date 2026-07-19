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

const DeputyTranslationSchema = z.object({
  lang: z.enum(['ru', 'kz']),
  title: z.string().min(1),
  content: z.string().optional(),
});

const DeputyRequestInputSchema = z.object({
  translations: z.array(DeputyTranslationSchema).min(1),
  fileUrl: z.string().url(),
  publishedAt: z.coerce.date().optional(),
});

function withTranslations<
  T extends {
    title: string;
    description: string | null;
    titleKz: string | null;
    descriptionKz: string | null;
  },
>(item: T) {
  return {
    ...item,
    translations: [
      { lang: 'ru' as const, title: item.title, content: item.description ?? '' },
      ...(item.titleKz ? [{ lang: 'kz' as const, title: item.titleKz, content: item.descriptionKz ?? '' }] : []),
    ],
  };
}

function handleError(err: unknown, res: Response): void {
  const e = err as { message?: string; status?: number };
  res.status(e.status ?? 500).json({ error: e.message ?? 'Внутренняя ошибка' });
}

const requireFaction = [
  authenticateToken,
  requireRole('DEPUTY', 'CHIEF_EDITOR', 'ADMIN'),
];

// GET /cms/api/v1/deputy-requests
cmsDeputyRequestsRouter.get('/', ...requireFaction, async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await prisma.document.findMany({
      where: { type: 'deputy_request' },
      orderBy: [{ publishedAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
    });
    res.json(items.map(withTranslations));
  } catch (err) {
    handleError(err, res);
  }
});

// GET /cms/api/v1/deputy-requests/:id — отдельный редактор записи.
cmsDeputyRequestsRouter.get('/:id', ...requireFaction, async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await prisma.document.findFirst({
      where: { id: String(req.params['id']), type: 'deputy_request' },
    });
    if (!item) {
      res.status(404).json({ error: 'Депутатский запрос не найден' });
      return;
    }
    res.json(withTranslations(item));
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
    const ru = parsed.data.translations.find((translation) => translation.lang === 'ru');
    const kz = parsed.data.translations.find((translation) => translation.lang === 'kz');
    const primary = ru ?? kz!;
    const item = await prisma.document.create({
      data: {
        title: primary.title,
        description: primary.content ?? null,
        titleKz: kz?.title ?? null,
        descriptionKz: kz?.content ?? null,
        type: 'deputy_request',
        fileUrl: parsed.data.fileUrl,
        fileName: `${primary.title.slice(0, 60)}.html`,
        fileSize: 0,
        year: publishedAt.getFullYear(),
        publishedAt,
      },
    });
    res.status(201).json(withTranslations(item));
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
    const { publishedAt, translations, ...rest } = parsed.data;
    const ru = translations?.find((translation) => translation.lang === 'ru');
    const kz = translations?.find((translation) => translation.lang === 'kz');
    const item = await prisma.document.update({
      where: { id: String(req.params['id']) },
      data: {
        ...rest,
        ...(ru ? { title: ru.title, description: ru.content ?? null } : {}),
        ...(translations ? (kz
          ? { titleKz: kz.title, descriptionKz: kz.content ?? null }
          : { titleKz: null, descriptionKz: null }) : {}),
        ...(publishedAt ? { publishedAt, year: publishedAt.getFullYear() } : {}),
      },
    });
    res.json(withTranslations(item));
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
