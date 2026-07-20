import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';
import { LangSchema } from '@npk/shared';
import { localizedValue } from '../../lib/localized';

export const publicProgramRouter = Router();
export const cmsProgramRouter = Router();

const TranslationSchema = z.object({
  lang: LangSchema,
  title: z.string().min(1),
  lead1: z.string().optional().nullable(),
  lead2: z.string().optional().nullable(),
  points: z.array(z.string()),
});

const ProgramBlockInputSchema = z.object({
  n: z.number().int(),
  keyword: z.string().min(1),
  imageUrl: z.string().url().optional().nullable(),
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

// ─── Public: GET /api/v1/program-blocks ───────────────────────────────────────

publicProgramRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const lang = (typeof req.query.lang === 'string' ? req.query.lang : undefined) ?? 'ru';
  try {
    const blocks = await prisma.programBlock.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { translations: true },
    });
    const result = blocks.map((b) => {
      const ru = b.translations.find((tr) => tr.lang === 'ru') ?? null;
      const t = b.translations.find((tr) => tr.lang === lang) ?? ru;
      const keywordKz: Record<number, string> = {
        1: 'ЕҢБЕК',
        2: 'СӨЗ',
        3: 'ЗАҢ',
        4: 'АДАМ',
        5: 'БАСПАНА',
        6: 'БІЛІМ',
        7: 'ӨҢІРЛЕР',
        8: 'БОЛАШАҚ',
        9: 'ДЕНСАУЛЫҚ',
        10: 'ОТБАСЫ',
      };
      return {
        id: b.id,
        n: b.n,
        keyword: lang === 'kz' ? keywordKz[b.n] ?? b.keyword : b.keyword,
        imageUrl: b.imageUrl,
        sortOrder: b.sortOrder,
        title: localizedValue(t?.title, ru?.title) ?? '',
        lead1: localizedValue(t?.lead1, ru?.lead1),
        // Для первых четырёх KZ-блоков утверждённый слоган целиком хранится в lead1.
        lead2: lang === 'kz' && b.n >= 1 && b.n <= 4 ? t?.lead2 ?? null : localizedValue(t?.lead2, ru?.lead2),
        points: localizedValue(t?.points as string[] | undefined, ru?.points as string[] | undefined) ?? [],
      };
    });
    res.json(result);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: GET /cms/api/v1/program-blocks ──────────────────────────────────────

cmsProgramRouter.get('/', ...requireContent, async (_req: Request, res: Response): Promise<void> => {
  try {
    const blocks = await prisma.programBlock.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { translations: true },
    });
    res.json(blocks);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: POST /cms/api/v1/program-blocks ─────────────────────────────────────

cmsProgramRouter.post('/', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const parsed = ProgramBlockInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const maxOrder = await prisma.programBlock.aggregate({ _max: { sortOrder: true } });
    const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const block = await prisma.programBlock.create({
      data: {
        n: parsed.data.n,
        keyword: parsed.data.keyword,
        imageUrl: parsed.data.imageUrl ?? null,
        sortOrder: parsed.data.sortOrder ?? nextOrder,
        translations: {
          create: parsed.data.translations.map((t) => ({
            lang: t.lang,
            title: t.title,
            lead1: t.lead1 ?? null,
            lead2: t.lead2 ?? null,
            points: t.points as Prisma.InputJsonValue,
          })),
        },
      },
      include: { translations: true },
    });
    res.status(201).json(block);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: PUT /cms/api/v1/program-blocks/:id ──────────────────────────────────

cmsProgramRouter.put('/:id', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  const parsed = ProgramBlockInputSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const { translations, ...data } = parsed.data;

    const block = await prisma.$transaction(async (tx) => {
      await tx.programBlock.update({ where: { id }, data });

      if (translations && translations.length > 0) {
        for (const t of translations) {
          await tx.programBlockTranslation.upsert({
            where: { programBlockId_lang: { programBlockId: id, lang: t.lang } },
            create: {
              programBlockId: id,
              lang: t.lang,
              title: t.title,
              lead1: t.lead1 ?? null,
              lead2: t.lead2 ?? null,
              points: t.points as Prisma.InputJsonValue,
            },
            update: {
              title: t.title,
              lead1: t.lead1 ?? null,
              lead2: t.lead2 ?? null,
              points: t.points as Prisma.InputJsonValue,
            },
          });
        }
      }

      return tx.programBlock.findUnique({ where: { id }, include: { translations: true } });
    });

    res.json(block);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: DELETE /cms/api/v1/program-blocks/:id ───────────────────────────────

cmsProgramRouter.delete('/:id', ...requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  try {
    await prisma.programBlock.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
});
