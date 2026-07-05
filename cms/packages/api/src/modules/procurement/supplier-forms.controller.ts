import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';
import { SupplierFormStatus } from '@prisma/client';
// Using native fetch available in Node 20+

export const supplierFormsRouter = Router();

const supplierFormSchema = z.object({
  bin: z.string().length(12),
  companyName: z.string().min(1),
  contactPerson: z.string().min(1),
  position: z.string().optional(),
  phone: z.string().min(1),
  email: z.string().email(),
  supplyCategory: z.string().min(1),
  description: z.string().min(1),
  captchaToken: z.string().optional(), // For hCaptcha
});

// POST /api/v1/supplier-form (Public)
supplierFormsRouter.post('/', async (req, res, next) => {
  try {
    const data = supplierFormSchema.parse(req.body);

    // Validate hCaptcha if token is provided and secret is configured
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

    const form = await prisma.supplierForm.create({
      data: dbData,
    });

    // TODO: Send email notification

    res.status(201).json({ message: 'Заявка успешно отправлена', form });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Ошибка валидации', details: err.errors });
    }
    next(err);
  }
});

export const cmsSupplierFormsRouter = Router();

// Middleware for CMS routes
cmsSupplierFormsRouter.use(authenticateToken, requireRole('ADMIN', 'PROCUREMENT_MANAGER'));

// GET /cms/api/v1/supplier-forms
cmsSupplierFormsRouter.get('/', async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const skip = page ? (parseInt(page as string) - 1) * (limit ? parseInt(limit as string) : 20) : 0;
    const take = limit ? parseInt(limit as string) : 20;

    const where = status ? { status: status as SupplierFormStatus } : {};

    const [data, total] = await Promise.all([
      prisma.supplierForm.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.supplierForm.count({ where }),
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

// PUT /cms/api/v1/supplier-forms/:id
cmsSupplierFormsRouter.put('/:id', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!Object.values(SupplierFormStatus).includes(status)) {
      return res.status(400).json({ error: 'Неверный статус' });
    }

    const form = await prisma.supplierForm.update({
      where: { id: req.params.id },
      data: { status: status as SupplierFormStatus },
    });

    res.json(form);
  } catch (err) {
    next(err);
  }
});
