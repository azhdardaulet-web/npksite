import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';

export const contactFormsRouter = Router();

const contactFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(1),
  captchaToken: z.string().optional(),
});

// POST /api/v1/contact-form (Public)
contactFormsRouter.post('/', async (req, res, next) => {
  try {
    const data = contactFormSchema.parse(req.body);

    // Validate hCaptcha if secret is configured
    const HCAPTCHA_SECRET = process.env.HCAPTCHA_SECRET;
    if (HCAPTCHA_SECRET && data.captchaToken) {
      const verifyRes = await fetch('https://hcaptcha.com/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `response=${data.captchaToken}&secret=${HCAPTCHA_SECRET}`,
      });
      const verifyData = await verifyRes.json() as { success: boolean };
      if (!verifyData.success) {
        return res.status(400).json({ error: 'Неверная капча' });
      }
    }

    const { captchaToken, ...dbData } = data;

    const form = await prisma.contactFormSubmission.create({
      data: dbData,
    });

    res.status(201).json({ message: 'Сообщение успешно отправлено', form });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Ошибка валидации', details: err.errors });
    }
    next(err);
  }
});

export const cmsContactFormsRouter = Router();

// GET /cms/api/v1/contact-forms
cmsContactFormsRouter.get('/', authenticateToken, requireRole('ADMIN', 'CONTENT_MANAGER'), async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const skip = page ? (parseInt(page as string) - 1) * (limit ? parseInt(limit as string) : 20) : 0;
    const take = limit ? parseInt(limit as string) : 20;

    const [data, total] = await Promise.all([
      prisma.contactFormSubmission.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contactFormSubmission.count(),
    ]);

    res.json({
      data,
      total,
      page: page ? parseInt(page as string) : 1,
      limit: take,
      totalPages: Math.ceil(total / take),
    });
  } catch (err) {
    next(err);
  }
});
