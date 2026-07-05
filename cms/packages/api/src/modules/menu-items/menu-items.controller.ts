import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';

export const publicMenuItemsRouter = Router();
export const cmsMenuItemsRouter = Router();

const MenuItemInputSchema = z.object({
  labelRu: z.string().min(1),
  labelKz: z.string().min(1),
  href: z.string().min(1),
  parentId: z.string().uuid().optional().nullable(),
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
  requireRole('CHIEF_EDITOR', 'SECTION_EDITOR', 'ADMIN'),
];

// ─── Public: GET /api/v1/menu-items — дерево меню ─────────────────────────────

publicMenuItemsRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await prisma.menuItem.findMany({ orderBy: { sortOrder: 'asc' } });
    const byParent = new Map<string | null, typeof items>();
    for (const item of items) {
      const key = item.parentId;
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key)!.push(item);
    }
    const build = (parentId: string | null): unknown[] =>
      (byParent.get(parentId) ?? []).map((item) => ({ ...item, children: build(item.id) }));
    res.json(build(null));
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: GET /cms/api/v1/menu-items — плоский список ─────────────────────────

cmsMenuItemsRouter.get('/', ...requireContent, async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await prisma.menuItem.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(items);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: POST /cms/api/v1/menu-items ─────────────────────────────────────────

cmsMenuItemsRouter.post('/', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const parsed = MenuItemInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const maxOrder = await prisma.menuItem.aggregate({ _max: { sortOrder: true } });
    const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const item = await prisma.menuItem.create({
      data: { ...parsed.data, parentId: parsed.data.parentId ?? null, sortOrder: parsed.data.sortOrder ?? nextOrder },
    });
    res.status(201).json(item);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: PUT /cms/api/v1/menu-items/:id ──────────────────────────────────────

cmsMenuItemsRouter.put('/:id', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  const parsed = MenuItemInputSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const item = await prisma.menuItem.update({ where: { id }, data: parsed.data });
    res.json(item);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: DELETE /cms/api/v1/menu-items/:id ───────────────────────────────────

cmsMenuItemsRouter.delete('/:id', ...requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  try {
    await prisma.menuItem.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: PATCH /cms/api/v1/menu-items/reorder ────────────────────────────────

cmsMenuItemsRouter.patch('/reorder', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const parsed = ReorderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    await prisma.$transaction(
      parsed.data.ids.map((id, index) => prisma.menuItem.update({ where: { id }, data: { sortOrder: index } }))
    );
    res.json({ ok: true });
  } catch (err) {
    handleError(err, res);
  }
});
