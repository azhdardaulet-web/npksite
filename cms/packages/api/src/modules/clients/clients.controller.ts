import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';

export const clientsRouter = Router();

const ClientInputSchema = z.object({
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

// ─── Public: GET /api/v1/clients ─────────────────────────────────────────────

clientsRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const clients = await prisma.client.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(clients);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: POST /cms/api/v1/clients ───────────────────────────────────────────

clientsRouter.post('/', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const parsed = ClientInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const maxOrder = await prisma.client.aggregate({ _max: { sortOrder: true } });
    const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const client = await prisma.client.create({
      data: {
        name: parsed.data.name,
        logoUrl: parsed.data.logoUrl,
        websiteUrl: parsed.data.websiteUrl ?? null,
        sortOrder: parsed.data.sortOrder ?? nextOrder,
      },
    });
    res.status(201).json(client);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: PATCH /cms/api/v1/clients/reorder ──────────────────────────────────

clientsRouter.patch('/reorder', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const parsed = ReorderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    await prisma.$transaction(
      parsed.data.ids.map((id, index) =>
        prisma.client.update({ where: { id }, data: { sortOrder: index } })
      )
    );
    res.json({ ok: true });
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: PUT /cms/api/v1/clients/:id ────────────────────────────────────────

clientsRouter.put('/:id', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  const parsed = ClientInputSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const client = await prisma.client.update({
      where: { id },
      data: parsed.data,
    });
    res.json(client);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: DELETE /cms/api/v1/clients/:id ─────────────────────────────────────

clientsRouter.delete('/:id', ...requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  try {
    await prisma.client.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
});
