import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';

export const publicTestimonialsRouter = Router();
export const cmsTestimonialsRouter = Router();

const TestimonialInputSchema = z.object({
  quote: z.string().min(1),
  author: z.string().min(1),
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

// ─── Public: GET /api/v1/testimonials ─────────────────────────────────────────

publicTestimonialsRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(testimonials);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: GET /cms/api/v1/testimonials ────────────────────────────────────────

cmsTestimonialsRouter.get('/', ...requireContent, async (_req: Request, res: Response): Promise<void> => {
  try {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(testimonials);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: POST /cms/api/v1/testimonials ───────────────────────────────────────

cmsTestimonialsRouter.post('/', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const parsed = TestimonialInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const maxOrder = await prisma.testimonial.aggregate({ _max: { sortOrder: true } });
    const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const testimonial = await prisma.testimonial.create({
      data: { ...parsed.data, sortOrder: parsed.data.sortOrder ?? nextOrder },
    });
    res.status(201).json(testimonial);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: PUT /cms/api/v1/testimonials/:id ────────────────────────────────────

cmsTestimonialsRouter.put('/:id', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  const parsed = TestimonialInputSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const testimonial = await prisma.testimonial.update({ where: { id }, data: parsed.data });
    res.json(testimonial);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: DELETE /cms/api/v1/testimonials/:id ─────────────────────────────────

cmsTestimonialsRouter.delete('/:id', ...requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  try {
    await prisma.testimonial.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
});
