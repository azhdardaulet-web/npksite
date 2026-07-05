import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';
import { VacancyStatus, ResumeStatus } from '@prisma/client';
import { minioClient, MINIO_BUCKET, objectUrl } from '../../lib/minio';

const RESUME_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/rtf',
  'text/rtf',
]);

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (RESUME_MIME.has(file.mimetype)) cb(null, true);
    else cb(new Error('Допустимые форматы: PDF, DOC, DOCX, RTF'));
  },
});

// ─── Public routes ────────────────────────────────────────────────────────────

export const publicVacanciesRouter = Router();

// GET /api/v1/vacancies
publicVacanciesRouter.get('/', async (req, res, next) => {
  try {
    const vacancies = await prisma.vacancy.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        translations: true,
        _count: { select: { applications: true } },
      },
    });
    res.json(vacancies);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/vacancies/:id
publicVacanciesRouter.get('/:id', async (req, res, next) => {
  try {
    const vacancy = await prisma.vacancy.findFirst({
      where: { id: req.params.id, status: 'PUBLISHED' },
      include: { translations: true },
    });
    if (!vacancy) return res.status(404).json({ error: 'Не найдено' });
    res.json(vacancy);
  } catch (err) {
    next(err);
  }
});

// ─── Resume application (public POST) ────────────────────────────────────────

const resumeSchema = z.object({
  vacancyId: z.string().uuid().optional(),
  fullName: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email(),
  coverLetter: z.string().optional(),
  resumeUrl: z.string().url().optional(),
});

// POST /api/v1/resume
publicVacanciesRouter.post('/resume', resumeUpload.single('resumeFile'), async (req, res, next) => {
  try {
    let resumeUrl: string | undefined;

    if (req.file) {
      const ext = path.extname(req.file.originalname) || '.pdf';
      const objectName = `resumes/${uuidv4()}${ext}`;
      await minioClient.putObject(MINIO_BUCKET, objectName, req.file.buffer, req.file.size, {
        'Content-Type': req.file.mimetype,
      });
      resumeUrl = objectUrl(objectName);
    }

    const body = {
      ...req.body,
      resumeUrl: resumeUrl ?? req.body.resumeUrl ?? undefined,
    };

    const data = resumeSchema.parse(body);
    const application = await prisma.resumeApplication.create({ data });
    res.status(201).json({ message: 'Резюме успешно отправлено', application });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Ошибка валидации', details: err.errors });
    }
    next(err);
  }
});

// ─── CMS routes ───────────────────────────────────────────────────────────────

export const cmsVacanciesRouter = Router();
cmsVacanciesRouter.use(authenticateToken, requireRole('ADMIN', 'CONTENT_MANAGER'));

const vacancySchema = z.object({
  department: z.string().min(1),
  employment: z.string().default('Полная занятость'),
  location: z.string().default('Казахстан'),
  salaryFrom: z.number().int().positive().optional().nullable(),
  salaryTo: z.number().int().positive().optional().nullable(),
  status: z.nativeEnum(VacancyStatus).default('DRAFT'),
  sortOrder: z.number().int().default(0),
  translations: z.array(
    z.object({
      lang: z.enum(['ru', 'kz', 'en', 'zh']),
      title: z.string().min(1),
      description: z.string().default(''),
      requirements: z.string().default(''),
      responsibilities: z.string().default(''),
    })
  ).default([]),
});

// GET /cms/api/v1/vacancies
cmsVacanciesRouter.get('/', async (req, res, next) => {
  try {
    const { status, page = '1', limit = '50' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const where = status ? { status: status as VacancyStatus } : {};

    const [data, total] = await Promise.all([
      prisma.vacancy.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        include: {
          translations: true,
          _count: { select: { applications: true } },
        },
      }),
      prisma.vacancy.count({ where }),
    ]);

    res.json({ data, total, page: parseInt(page as string), limit: parseInt(limit as string) });
  } catch (err) {
    next(err);
  }
});

// POST /cms/api/v1/vacancies
cmsVacanciesRouter.post('/', async (req, res, next) => {
  try {
    const { translations, ...rest } = vacancySchema.parse(req.body);
    const vacancy = await prisma.vacancy.create({
      data: {
        ...rest,
        translations: {
          create: translations.map((t) => ({
            lang: t.lang as any,
            title: t.title,
            description: t.description,
            requirements: t.requirements,
            responsibilities: t.responsibilities,
          })),
        },
      },
      include: { translations: true },
    });
    res.status(201).json(vacancy);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'Ошибка валидации', details: err.errors });
    next(err);
  }
});

// PUT /cms/api/v1/vacancies/:id
cmsVacanciesRouter.put('/:id', async (req, res, next) => {
  try {
    const { translations, ...rest } = vacancySchema.parse(req.body);

    await prisma.vacancyTranslation.deleteMany({ where: { vacancyId: req.params.id } });

    const vacancy = await prisma.vacancy.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        translations: {
          create: translations.map((t) => ({
            lang: t.lang as any,
            title: t.title,
            description: t.description,
            requirements: t.requirements,
            responsibilities: t.responsibilities,
          })),
        },
      },
      include: { translations: true },
    });
    res.json(vacancy);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'Ошибка валидации', details: err.errors });
    next(err);
  }
});

// DELETE /cms/api/v1/vacancies/:id
cmsVacanciesRouter.delete('/:id', async (req, res, next) => {
  try {
    await prisma.vacancy.delete({ where: { id: req.params.id } });
    res.json({ message: 'Вакансия удалена' });
  } catch (err) {
    next(err);
  }
});

// ─── Resume applications CMS ──────────────────────────────────────────────────

// GET /cms/api/v1/vacancies/applications
cmsVacanciesRouter.get('/applications', async (req, res, next) => {
  try {
    const { status, page = '1', limit = '50' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const where = status ? { status: status as ResumeStatus } : {};

    const [data, total] = await Promise.all([
      prisma.resumeApplication.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include: { vacancy: { include: { translations: { where: { lang: 'ru' } } } } },
      }),
      prisma.resumeApplication.count({ where }),
    ]);

    res.json({ data, total });
  } catch (err) {
    next(err);
  }
});

// PUT /cms/api/v1/vacancies/applications/:id
cmsVacanciesRouter.put('/applications/:id', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!Object.values(ResumeStatus).includes(status)) {
      return res.status(400).json({ error: 'Неверный статус' });
    }
    const app = await prisma.resumeApplication.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(app);
  } catch (err) {
    next(err);
  }
});
