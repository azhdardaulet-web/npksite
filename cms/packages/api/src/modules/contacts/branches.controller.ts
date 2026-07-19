import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';

export const branchesRouter = Router();

const BranchInputSchema = z.object({
  cityRu: z.string().min(1),
  cityKz: z.string().min(1),
  addressRu: z.string().min(1),
  addressKz: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  department: z.string().optional().nullable(),
  chairman: z.string().optional().nullable(),
  lng: z.number().optional().nullable(),
  lat: z.number().optional().nullable(),
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

// ─── Public: GET /api/v1/branches ─────────────────────────────────────────────

branchesRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const branches = await prisma.branch.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(branches);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: GET /cms/api/v1/branches ────────────────────────────────────────────

branchesRouter.get('/cms', ...requireContent, async (_req: Request, res: Response): Promise<void> => {
  try {
    const branches = await prisma.branch.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(branches);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: POST /cms/api/v1/branches ───────────────────────────────────────────

branchesRouter.post('/', ...requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const parsed = BranchInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const maxOrder = await prisma.branch.aggregate({ _max: { sortOrder: true } });
    const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const branch = await prisma.branch.create({
      data: {
        ...parsed.data,
        department: parsed.data.department ?? null,
        chairman: parsed.data.chairman ?? null,
        lng: parsed.data.lng ?? null,
        lat: parsed.data.lat ?? null,
        sortOrder: parsed.data.sortOrder ?? nextOrder,
      },
    });
    res.status(201).json(branch);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: PUT /cms/api/v1/branches/:id ────────────────────────────────────────

branchesRouter.put(
  '/:branchId',
  ...requireContent,
  async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params['branchId']);
    const parsed = BranchInputSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
      return;
    }

    try {
      const branch = await prisma.branch.update({ where: { id }, data: parsed.data });
      res.json(branch);
    } catch (err) {
      handleError(err, res);
    }
  }
);

// ─── CMS: DELETE /cms/api/v1/branches/:id ─────────────────────────────────────

branchesRouter.delete('/:id', ...requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  try {
    await prisma.branch.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
});
