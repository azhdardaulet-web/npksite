import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';
import { LangSchema } from '@dar-rail/shared';

export const teamRouter = Router();

const TranslationSchema = z.object({
  lang: LangSchema,
  name: z.string().min(1),
  position: z.string().min(1),
  bio: z.string().optional().nullable(),
});

const TeamMemberInputSchema = z.object({
  photoUrl: z.string().url().optional().nullable(),
  // Нужен депутатам (group=FACTION) — приглашение на Google Meet при видеоприёме.
  email: z.string().email().optional().nullable(),
  group: z.enum(['LEADERSHIP', 'MEDIA_TEAM', 'FACTION']).optional(),
  sortOrder: z.number().int().min(0).optional(),
  translations: z.array(TranslationSchema).min(1),
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
  requireRole('CHIEF_EDITOR', 'SECTION_EDITOR', 'FACTION', 'ADMIN'),
];

// ─── Public: GET /api/v1/team ─────────────────────────────────────────────────

teamRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const lang = (typeof req.query.lang === 'string' ? req.query.lang : undefined) ?? 'ru';
  const group = typeof req.query.group === 'string' ? req.query.group : undefined;

  try {
    const members = await prisma.teamMember.findMany({
      where: group ? { group: group as 'LEADERSHIP' | 'MEDIA_TEAM' } : undefined,
      orderBy: { sortOrder: 'asc' },
      include: { translations: true },
    });

    const result = members.map((m) => {
      const t =
        m.translations.find((tr) => tr.lang === lang) ??
        m.translations.find((tr) => tr.lang === 'ru') ??
        null;
      return {
        id: m.id,
        photoUrl: m.photoUrl,
        group: m.group,
        sortOrder: m.sortOrder,
        name: t?.name ?? '',
        position: t?.position ?? '',
        bio: t?.bio ?? null,
      };
    });

    res.json(result);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: GET /cms/api/v1/team ───────────────────────────────────────────────

teamRouter.get('/cms', ...requireContent, async (_req: Request, res: Response): Promise<void> => {
  try {
    const members = await prisma.teamMember.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { translations: true },
    });
    res.json(members);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: POST /cms/api/v1/team ──────────────────────────────────────────────

teamRouter.post('/', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const parsed = TeamMemberInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const maxOrder = await prisma.teamMember.aggregate({ _max: { sortOrder: true } });
    const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const member = await prisma.teamMember.create({
      data: {
        photoUrl: parsed.data.photoUrl ?? null,
        email: parsed.data.email ?? null,
        group: parsed.data.group ?? 'LEADERSHIP',
        sortOrder: parsed.data.sortOrder ?? nextOrder,
        translations: {
          create: parsed.data.translations.map((t) => ({
            lang: t.lang,
            name: t.name,
            position: t.position,
            bio: t.bio ?? null,
          })),
        },
      },
      include: { translations: true },
    });
    res.status(201).json(member);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: PUT /cms/api/v1/team/:id ───────────────────────────────────────────

teamRouter.put('/:id', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  const parsed = TeamMemberInputSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    const { translations, ...memberData } = parsed.data;

    const member = await prisma.$transaction(async (tx) => {
      const updated = await tx.teamMember.update({
        where: { id },
        data: memberData,
      });

      if (translations && translations.length > 0) {
        for (const t of translations) {
          await tx.teamMemberTranslation.upsert({
            where: { memberId_lang: { memberId: id, lang: t.lang } },
            create: {
              memberId: id,
              lang: t.lang,
              name: t.name,
              position: t.position,
              bio: t.bio ?? null,
            },
            update: {
              name: t.name,
              position: t.position,
              bio: t.bio ?? null,
            },
          });
        }
      }

      return tx.teamMember.findUnique({
        where: { id: updated.id },
        include: { translations: true },
      });
    });

    res.json(member);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: DELETE /cms/api/v1/team/:id ────────────────────────────────────────

teamRouter.delete('/:id', ...requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  try {
    await prisma.teamMember.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    // P2003 — на депутата ссылается AppealMeeting (история видеозвонков).
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
      res.status(400).json({ error: 'Нельзя удалить — у депутата есть история видеозвонков в приёмной' });
      return;
    }
    handleError(err, res);
  }
});

// ─── CMS: PATCH /cms/api/v1/team/reorder ─────────────────────────────────────

teamRouter.patch('/reorder', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const parsed = ReorderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }

  try {
    await prisma.$transaction(
      parsed.data.ids.map((id, index) =>
        prisma.teamMember.update({ where: { id }, data: { sortOrder: index } })
      )
    );
    res.json({ ok: true });
  } catch (err) {
    handleError(err, res);
  }
});
