import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';

export const publicMediaPublicationsRouter = Router();
export const cmsMediaPublicationsRouter = Router();

const MediaPublicationInputSchema = z.object({
  date: z.coerce.date(),
  sourceType: z.string().min(1),
  mediaName: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().optional().nullable(),
  titleKz: z.string().optional().nullable(),
  excerptKz: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  url: z.string().url().optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
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

// ─── Public: GET /api/v1/media-publications ───────────────────────────────────

publicMediaPublicationsRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const lang = req.query.lang === 'kz' ? 'kz' : 'ru';
  try {
    const publications = await prisma.mediaPublication.findMany({ orderBy: [{ date: 'desc' }, { sortOrder: 'asc' }] });
    res.json(publications.map((item) => ({
      ...item,
      title: lang === 'kz' && item.titleKz?.trim() ? item.titleKz : item.title,
      excerpt: lang === 'kz' && item.excerptKz?.trim() ? item.excerptKz : item.excerpt,
    })));
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: GET /cms/api/v1/media-publications ──────────────────────────────────

cmsMediaPublicationsRouter.get('/', ...requireContent, async (_req: Request, res: Response): Promise<void> => {
  try {
    const publications = await prisma.mediaPublication.findMany({ orderBy: [{ date: 'desc' }, { sortOrder: 'asc' }] });
    res.json(publications);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: POST /cms/api/v1/media-publications ─────────────────────────────────

cmsMediaPublicationsRouter.post('/', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const parsed = MediaPublicationInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const publication = await prisma.mediaPublication.create({
      data: {
        ...parsed.data,
        excerpt: parsed.data.excerpt ?? null,
        titleKz: parsed.data.titleKz ?? null,
        excerptKz: parsed.data.excerptKz ?? null,
        imageUrl: parsed.data.imageUrl ?? null,
        url: parsed.data.url ?? null,
        sortOrder: parsed.data.sortOrder ?? 0,
      },
    });
    res.status(201).json(publication);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: PUT /cms/api/v1/media-publications/:id ──────────────────────────────

cmsMediaPublicationsRouter.put('/:id', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  const parsed = MediaPublicationInputSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const publication = await prisma.mediaPublication.update({ where: { id }, data: parsed.data });
    res.json(publication);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: DELETE /cms/api/v1/media-publications/:id ───────────────────────────

cmsMediaPublicationsRouter.delete('/:id', ...requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  try {
    await prisma.mediaPublication.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
});
