import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { verifyHCaptcha } from '../../lib/hcaptcha';

export const shopSubscribersRouter = Router();

function handleError(err: unknown, res: Response): void {
  const e = err as { message?: string; status?: number };
  res.status(e.status ?? 500).json({ error: e.message ?? 'Внутренняя ошибка' });
}

const ShopSubscriberInputSchema = z.object({
  email: z.string().email(),
  hCaptchaToken: z.string().min(1, 'Пройдите проверку hCaptcha'),
});

// ─── Public: POST /api/v1/shop-subscribers ─────────────────────────────────────

shopSubscribersRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const parsed = ShopSubscriberInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const captchaOk = await verifyHCaptcha(parsed.data.hCaptchaToken);
    if (!captchaOk) {
      res.status(400).json({ error: 'Неверная капча' });
      return;
    }

    const subscriber = await prisma.shopSubscriber.upsert({
      where: { email: parsed.data.email },
      create: { email: parsed.data.email },
      update: {},
    });
    res.status(201).json({ message: 'Вы подписаны на уведомление об открытии магазина', id: subscriber.id });
  } catch (err) {
    handleError(err, res);
  }
});
