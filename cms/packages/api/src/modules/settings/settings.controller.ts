import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';

export const cmsSettingsRouter = Router();
export const publicSettingsRouter = Router();

// Ключи, безопасные для публичного показа на сайте (счётчики, соцсети).
// notify_email и tg_delay_minutes — служебные, наружу не отдаются.
const PUBLIC_SETTING_KEYS = [
  'social_youtube',
  'social_instagram',
  'social_tiktok',
  'social_facebook',
  'social_telegram',
  'homepage_members_count',
  'homepage_branches_count',
  'homepage_appeals_resolved',
  'reception_avg_response_time',
  'reception_branches_accepting',
  'video_preview_image',
];

// GET /api/v1/settings — только публично разрешённые ключи
publicSettingsRouter.get('/', async (_req, res, next) => {
  try {
    const settings = await prisma.setting.findMany({ where: { key: { in: PUBLIC_SETTING_KEYS } } });
    const result = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

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
