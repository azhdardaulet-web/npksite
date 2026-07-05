import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';

export const officesRouter = Router();

const OfficeInputSchema = z.object({
  cityRu: z.string().min(1),
  cityKz: z.string().min(1),
  addressRu: z.string().min(1),
  addressKz: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  department: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
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

// ─── Public: GET /api/v1/contacts ─────────────────────────────────────────────

officesRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const offices = await prisma.office.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(offices);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: GET /cms/api/v1/offices ─────────────────────────────────────────────

officesRouter.get('/cms', ...requireContent, async (_req: Request, res: Response): Promise<void> => {
  try {
    const offices = await prisma.office.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(offices);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: POST /cms/api/v1/offices ────────────────────────────────────────────

officesRouter.post('/', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const parsed = OfficeInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const maxOrder = await prisma.office.aggregate({ _max: { sortOrder: true } });
    const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const office = await prisma.office.create({
      data: {
        ...parsed.data,
        department: parsed.data.department ?? null,
        sortOrder: parsed.data.sortOrder ?? nextOrder,
      },
    });
    res.status(201).json(office);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: PUT /cms/api/v1/offices/:id ─────────────────────────────────────────

officesRouter.put('/:id', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  const parsed = OfficeInputSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const office = await prisma.office.update({ where: { id }, data: parsed.data });
    res.json(office);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: DELETE /cms/api/v1/offices/:id ──────────────────────────────────────

officesRouter.delete('/:id', ...requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  try {
    await prisma.office.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
});
