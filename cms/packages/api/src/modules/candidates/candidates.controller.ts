import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';
import { LangSchema } from '@dar-rail/shared';

export const publicCandidatesRouter = Router();
export const cmsCandidatesRouter = Router();

const TranslationSchema = z.object({
  lang: LangSchema,
  promise: z.string().min(1),
});

const CandidateInputSchema = z.object({
  name: z.string().min(1),
  region: z.string().min(1),
  district: z.string().optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  translations: z.array(TranslationSchema).min(1),
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

// ─── Public: GET /api/v1/candidates ───────────────────────────────────────────

publicCandidatesRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const lang = (typeof req.query.lang === 'string' ? req.query.lang : undefined) ?? 'ru';
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { translations: true },
    });
    const result = candidates.map((c) => {
      const t = c.translations.find((tr) => tr.lang === lang) ?? c.translations.find((tr) => tr.lang === 'ru') ?? null;
      return {
        id: c.id,
        name: c.name,
        region: c.region,
        district: c.district,
        photoUrl: c.photoUrl,
        sortOrder: c.sortOrder,
        promise: t?.promise ?? '',
      };
    });
    res.json(result);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: GET /cms/api/v1/candidates ──────────────────────────────────────────

cmsCandidatesRouter.get('/', ...requireContent, async (_req: Request, res: Response): Promise<void> => {
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { translations: true },
    });
    res.json(candidates);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: POST /cms/api/v1/candidates ─────────────────────────────────────────

cmsCandidatesRouter.post('/', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const parsed = CandidateInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const maxOrder = await prisma.candidate.aggregate({ _max: { sortOrder: true } });
    const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const candidate = await prisma.candidate.create({
      data: {
        name: parsed.data.name,
        region: parsed.data.region,
        district: parsed.data.district ?? null,
        photoUrl: parsed.data.photoUrl ?? null,
        sortOrder: parsed.data.sortOrder ?? nextOrder,
        translations: { create: parsed.data.translations },
      },
      include: { translations: true },
    });
    res.status(201).json(candidate);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: PUT /cms/api/v1/candidates/:id ──────────────────────────────────────

cmsCandidatesRouter.put('/:id', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  const parsed = CandidateInputSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const { translations, ...data } = parsed.data;

    const candidate = await prisma.$transaction(async (tx) => {
      await tx.candidate.update({ where: { id }, data });

      if (translations && translations.length > 0) {
        for (const t of translations) {
          await tx.candidateTranslation.upsert({
            where: { candidateId_lang: { candidateId: id, lang: t.lang } },
            create: { candidateId: id, lang: t.lang, promise: t.promise },
            update: { promise: t.promise },
          });
        }
      }

      return tx.candidate.findUnique({ where: { id }, include: { translations: true } });
    });

    res.json(candidate);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: DELETE /cms/api/v1/candidates/:id ───────────────────────────────────

cmsCandidatesRouter.delete('/:id', ...requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  try {
    await prisma.candidate.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
});
