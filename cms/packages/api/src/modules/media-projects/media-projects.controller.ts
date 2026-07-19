import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';
import { LangSchema } from '@dar-rail/shared';
import { localizedValue } from '../../lib/localized';

export const publicMediaProjectsRouter = Router();
export const cmsMediaProjectsRouter = Router();

const TranslationSchema = z.object({
  lang: LangSchema,
  title: z.string().min(1),
  description: z.string().min(1),
});

const MediaProjectInputSchema = z.object({
  tag: z.string().min(1),
  url: z.string().url().optional().nullable(),
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

// ─── Public: GET /api/v1/media-projects ───────────────────────────────────────

publicMediaProjectsRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const lang = (typeof req.query.lang === 'string' ? req.query.lang : undefined) ?? 'ru';
  try {
    const projects = await prisma.mediaProject.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { translations: true },
    });
    const result = projects.map((p) => {
      const ru = p.translations.find((tr) => tr.lang === 'ru') ?? null;
      const t = p.translations.find((tr) => tr.lang === lang) ?? ru;
      const tagKz: Record<number, string> = {
        0: 'Ақпараттық бағдарлама',
        1: 'Парламент өмірі',
        2: 'Жергілікті репортаждар',
      };
      return {
        id: p.id,
        tag: lang === 'kz' ? tagKz[p.sortOrder] ?? p.tag : p.tag,
        url: p.url,
        imageUrl: p.imageUrl,
        sortOrder: p.sortOrder,
        title: localizedValue(t?.title, ru?.title) ?? '',
        description: localizedValue(t?.description, ru?.description) ?? '',
      };
    });
    res.json(result);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: GET /cms/api/v1/media-projects ──────────────────────────────────────

cmsMediaProjectsRouter.get('/', ...requireContent, async (_req: Request, res: Response): Promise<void> => {
  try {
    const projects = await prisma.mediaProject.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { translations: true },
    });
    res.json(projects);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: POST /cms/api/v1/media-projects ─────────────────────────────────────

cmsMediaProjectsRouter.post('/', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const parsed = MediaProjectInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const maxOrder = await prisma.mediaProject.aggregate({ _max: { sortOrder: true } });
    const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const project = await prisma.mediaProject.create({
      data: {
        tag: parsed.data.tag,
        url: parsed.data.url ?? null,
        imageUrl: parsed.data.imageUrl ?? null,
        sortOrder: parsed.data.sortOrder ?? nextOrder,
        translations: { create: parsed.data.translations },
      },
      include: { translations: true },
    });
    res.status(201).json(project);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: PUT /cms/api/v1/media-projects/:id ──────────────────────────────────

cmsMediaProjectsRouter.put('/:id', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  const parsed = MediaProjectInputSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const { translations, ...data } = parsed.data;

    const project = await prisma.$transaction(async (tx) => {
      await tx.mediaProject.update({ where: { id }, data });

      if (translations && translations.length > 0) {
        for (const t of translations) {
          await tx.mediaProjectTranslation.upsert({
            where: { mediaProjectId_lang: { mediaProjectId: id, lang: t.lang } },
            create: { mediaProjectId: id, lang: t.lang, title: t.title, description: t.description },
            update: { title: t.title, description: t.description },
          });
        }
      }

      return tx.mediaProject.findUnique({ where: { id }, include: { translations: true } });
    });

    res.json(project);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: DELETE /cms/api/v1/media-projects/:id ───────────────────────────────

cmsMediaProjectsRouter.delete('/:id', ...requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  try {
    await prisma.mediaProject.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
});
