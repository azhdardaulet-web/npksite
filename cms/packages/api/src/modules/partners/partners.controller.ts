import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';

export const partnersRouter = Router();

const PartnerInputSchema = z.object({
  name: z.string().min(1),
  logoUrl: z.string().url(),
  websiteUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

const ReorderSchema = z.object({
  ids: z.array(z.string().uuid()),
});

function handleError(err: unknown, res: Response): void {
  const e = err as { message?: string; status?: number };
  res.status(e.status ?? 500).json({ error: e.message ?? 'Внутренняя ошибка' });
}

const requireAdmin = [authenticateToken, requireRole('ADMIN')];
const requireContent = [
  authenticateToken,
  requireRole('CONTENT_MANAGER', 'NEWS_EDITOR', 'PROCUREMENT_MANAGER', 'ADMIN'),
];

// ─── Public: GET /api/v1/partners ────────────────────────────────────────────

partnersRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const partners = await prisma.partner.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(partners);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: GET /cms/api/v1/partners ───────────────────────────────────────────

partnersRouter.get('/cms', ...requireContent, async (_req: Request, res: Response): Promise<void> => {
  try {
    const partners = await prisma.partner.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(partners);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: POST /cms/api/v1/partners ──────────────────────────────────────────

partnersRouter.post('/', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const parsed = PartnerInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const maxOrder = await prisma.partner.aggregate({ _max: { sortOrder: true } });
    const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const partner = await prisma.partner.create({
      data: {
        name: parsed.data.name,
        logoUrl: parsed.data.logoUrl,
        websiteUrl: parsed.data.websiteUrl ?? null,
        sortOrder: parsed.data.sortOrder ?? nextOrder,
      },
    });
    res.status(201).json(partner);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: PUT /cms/api/v1/partners/:id ───────────────────────────────────────

partnersRouter.put('/:id', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  const parsed = PartnerInputSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const partner = await prisma.partner.update({
      where: { id },
      data: parsed.data,
    });
    res.json(partner);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: DELETE /cms/api/v1/partners/:id ────────────────────────────────────

partnersRouter.delete('/:id', ...requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  try {
    await prisma.partner.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: PATCH /cms/api/v1/partners/reorder ─────────────────────────────────

partnersRouter.patch('/reorder', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const parsed = ReorderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    await prisma.$transaction(
      parsed.data.ids.map((id, index) =>
        prisma.partner.update({ where: { id }, data: { sortOrder: index } })
      )
    );
    res.json({ ok: true });
  } catch (err) {
    handleError(err, res);
  }
});
