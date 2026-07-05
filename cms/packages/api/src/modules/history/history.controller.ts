import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';
import { LangSchema } from '@dar-rail/shared';

export const publicHistoryRouter = Router();
export const cmsHistoryRouter = Router();

const TranslationSchema = z.object({
  lang: LangSchema,
  title: z.string().min(1),
  text: z.string().min(1),
});

const HistoryEventInputSchema = z.object({
  year: z.number().int(),
  imageUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  translations: z.array(TranslationSchema).min(1),
});

function handleError(err: unknown, res: Response): void {
  const e = err as { message?: string; status?: number };
  res.status(e.status ?? 500).json({ error: e.message ?? 'Внутренняя ошибка' });
}

const requireAdmin = [authenticateToken, requireRole('ADMIN')];
const requireContent = [
  authenticateToken,
  requireRole('CHIEF_EDITOR', 'SECTION_EDITOR', 'ADMIN'),
];

// ─── Public: GET /api/v1/history-events ───────────────────────────────────────

publicHistoryRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const lang = (typeof req.query.lang === 'string' ? req.query.lang : undefined) ?? 'ru';
  try {
    const events = await prisma.historyEvent.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { translations: true },
    });
    const result = events.map((e) => {
      const t = e.translations.find((tr) => tr.lang === lang) ?? e.translations.find((tr) => tr.lang === 'ru') ?? null;
      return { id: e.id, year: e.year, imageUrl: e.imageUrl, sortOrder: e.sortOrder, title: t?.title ?? '', text: t?.text ?? '' };
    });
    res.json(result);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: GET /cms/api/v1/history-events ──────────────────────────────────────

cmsHistoryRouter.get('/', ...requireContent, async (_req: Request, res: Response): Promise<void> => {
  try {
    const events = await prisma.historyEvent.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { translations: true },
    });
    res.json(events);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: POST /cms/api/v1/history-events ─────────────────────────────────────

cmsHistoryRouter.post('/', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const parsed = HistoryEventInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const maxOrder = await prisma.historyEvent.aggregate({ _max: { sortOrder: true } });
    const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const event = await prisma.historyEvent.create({
      data: {
        year: parsed.data.year,
        imageUrl: parsed.data.imageUrl ?? null,
        sortOrder: parsed.data.sortOrder ?? nextOrder,
        translations: { create: parsed.data.translations },
      },
      include: { translations: true },
    });
    res.status(201).json(event);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: PUT /cms/api/v1/history-events/:id ──────────────────────────────────

cmsHistoryRouter.put('/:id', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  const parsed = HistoryEventInputSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const { translations, ...data } = parsed.data;

    const event = await prisma.$transaction(async (tx) => {
      await tx.historyEvent.update({ where: { id }, data });

      if (translations && translations.length > 0) {
        for (const t of translations) {
          await tx.historyEventTranslation.upsert({
            where: { historyEventId_lang: { historyEventId: id, lang: t.lang } },
            create: { historyEventId: id, lang: t.lang, title: t.title, text: t.text },
            update: { title: t.title, text: t.text },
          });
        }
      }

      return tx.historyEvent.findUnique({ where: { id }, include: { translations: true } });
    });

    res.json(event);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: DELETE /cms/api/v1/history-events/:id ───────────────────────────────

cmsHistoryRouter.delete('/:id', ...requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  try {
    await prisma.historyEvent.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
});
