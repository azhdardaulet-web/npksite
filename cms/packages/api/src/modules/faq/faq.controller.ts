import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';
import { LangSchema } from '@npk/shared';

export const publicFaqRouter = Router();
export const cmsFaqRouter = Router();

const FaqInputSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  lang: LangSchema,
  sortOrder: z.number().int().min(0).optional(),
});

function handleError(err: unknown, res: Response): void {
  const e = err as { message?: string; status?: number };
  res.status(e.status ?? 500).json({ error: e.message ?? 'Внутренняя ошибка' });
}

const requireAdmin = [authenticateToken, requireRole('ADMIN')];
const requireEditors = [authenticateToken, requireRole('ADMIN', 'CHIEF_EDITOR')];

// ─── Public: GET /api/v1/faq?lang=ru ───────────────────────────────────────────

publicFaqRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const lang = LangSchema.catch('ru').parse(req.query.lang);
  try {
    const faqs = await prisma.faq.findMany({ where: { lang }, orderBy: { sortOrder: 'asc' } });
    res.json(faqs);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: GET /cms/api/v1/faq — только ADMIN и CHIEF_EDITOR ───────────────────

cmsFaqRouter.get('/', ...requireEditors, async (_req: Request, res: Response): Promise<void> => {
  try {
    const faqs = await prisma.faq.findMany({ orderBy: [{ lang: 'asc' }, { sortOrder: 'asc' }] });
    res.json(faqs);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: POST /cms/api/v1/faq ─────────────────────────────────────────────────

cmsFaqRouter.post('/', ...requireEditors, async (req: Request, res: Response): Promise<void> => {
  const parsed = FaqInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const maxOrder = await prisma.faq.aggregate({ _max: { sortOrder: true }, where: { lang: parsed.data.lang } });
    const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const faq = await prisma.faq.create({
      data: { ...parsed.data, sortOrder: parsed.data.sortOrder ?? nextOrder },
    });
    res.status(201).json(faq);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: PUT /cms/api/v1/faq/:id ──────────────────────────────────────────────

cmsFaqRouter.put('/:id', ...requireEditors, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  const parsed = FaqInputSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const faq = await prisma.faq.update({ where: { id }, data: parsed.data });
    res.json(faq);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: DELETE /cms/api/v1/faq/:id ───────────────────────────────────────────

cmsFaqRouter.delete('/:id', ...requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  try {
    await prisma.faq.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
});
