import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';

export const cmsSettingsRouter = Router();

// GET /cms/api/v1/settings
cmsSettingsRouter.get('/', authenticateToken, requireRole('ADMIN'), async (_req, res, next) => {
  try {
    const settings = await prisma.setting.findMany();
    const result = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// PUT /cms/api/v1/settings/:key
cmsSettingsRouter.put('/:key', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const key = req.params.key as string;
    const { value } = req.body as { value: string };
    if (typeof value !== 'string') return res.status(400).json({ error: 'value обязателен' });

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    res.json(setting);
  } catch (err) {
    next(err);
  }
});
