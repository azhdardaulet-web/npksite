import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';
import { LangSchema } from '@dar-rail/shared';

export const publicPagesRouter = Router();
export const cmsPagesRouter = Router();

const VALID_SLUGS = ['home', 'about', 'faction', 'contacts', 'footer'] as const;

const PageBlockInputSchema = z.object({
  type: z.enum(['hero', 'text_image', 'kpi', 'quote', 'pdf_list', 'contacts_block']),
  sortOrder: z.number().int().min(0),
  content: z.record(z.unknown()),
});

const PageTranslationInputSchema = z.object({
  lang: LangSchema,
  title: z.string().min(1),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogImageUrl: z.string().url().optional().nullable(),
});

const UpdatePageSchema = z.object({
  blocks: z.array(PageBlockInputSchema).optional(),
  translations: z.array(PageTranslationInputSchema).optional(),
  isPublished: z.boolean().optional(),
});

function handleError(err: unknown, res: Response): void {
  const e = err as { message?: string; status?: number };
  res.status(e.status ?? 500).json({ error: e.message ?? 'Внутренняя ошибка' });
}

async function ensurePage(slug: string) {
  let page = await prisma.page.findUnique({ where: { slug } });
  if (!page && VALID_SLUGS.includes(slug as (typeof VALID_SLUGS)[number])) {
    page = await prisma.page.create({ data: { slug, isPublished: true } });
  }
  return page;
}

const requireContent = [
  authenticateToken,
  requireRole('CHIEF_EDITOR', 'SECTION_EDITOR', 'FACTION', 'ADMIN'),
];

// ─── Public: GET /api/v1/pages/:slug ─────────────────────────────────────────

publicPagesRouter.get('/:slug', async (req: Request, res: Response): Promise<void> => {
  const slug = String(req.params['slug']);
  const lang = String(req.query['lang'] || 'ru');

  try {
    const page = await prisma.page.findUnique({
      where: { slug },
      include: {
        blocks: { orderBy: { sortOrder: 'asc' } },
        translations: true,
      },
    });

    if (!page) {
      res.status(404).json({ error: 'Страница не найдена' });
      return;
    }

    const translation =
      page.translations.find((t) => t.lang === lang) ??
      page.translations.find((t) => t.lang === 'ru') ??
      null;

    res.json({ ...page, currentTranslation: translation });
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: GET /cms/api/v1/pages ──────────────────────────────────────────────

cmsPagesRouter.get('/', ...requireContent, async (_req: Request, res: Response): Promise<void> => {
  try {
    const pages = await prisma.page.findMany({
      include: {
        translations: { where: { lang: 'ru' } },
        blocks: { select: { id: true } },
      },
      orderBy: { slug: 'asc' },
    });
    res.json(pages);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: GET /cms/api/v1/pages/:slug ────────────────────────────────────────

cmsPagesRouter.get('/:slug', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const slug = String(req.params['slug']);
  try {
    const page = await ensurePage(slug);
    if (!page) {
      res.status(404).json({ error: 'Страница не найдена' });
      return;
    }
    const full = await prisma.page.findUnique({
      where: { id: page.id },
      include: { blocks: { orderBy: { sortOrder: 'asc' } }, translations: true },
    });
    res.json(full);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: GET /cms/api/v1/pages/:slug/content ────────────────────────────────

cmsPagesRouter.get('/:slug/content', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const slug = String(req.params['slug']);
  try {
    const setting = await prisma.setting.findUnique({ where: { key: `page_content__${slug}` } });
    if (!setting) {
      res.json({ fields: {}, galleries: {}, documents: {} });
      return;
    }
    res.json(JSON.parse(setting.value));
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: PUT /cms/api/v1/pages/:slug/content ────────────────────────────────

cmsPagesRouter.put('/:slug/content', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const slug = String(req.params['slug']);
  try {
    const content = req.body as { fields: Record<string, unknown>; galleries: Record<string, unknown>; documents: Record<string, unknown> };
    const value = JSON.stringify(content);
    await prisma.setting.upsert({
      where: { key: `page_content__${slug}` },
      create: { key: `page_content__${slug}`, value },
      update: { value },
    });
    res.json({ ok: true });
  } catch (err) {
    handleError(err, res);
  }
});

// ─── Public: GET /api/v1/pages/:slug/content ─────────────────────────────────

publicPagesRouter.get('/:slug/content', async (req: Request, res: Response): Promise<void> => {
  const slug = String(req.params['slug']);
  try {
    const setting = await prisma.setting.findUnique({ where: { key: `page_content__${slug}` } });
    if (!setting) {
      res.json({ fields: {}, galleries: {}, documents: {} });
      return;
    }
    res.json(JSON.parse(setting.value));
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: PUT /cms/api/v1/pages/:slug ────────────────────────────────────────

cmsPagesRouter.put('/:slug', ...requireContent, async (req: Request, res: Response): Promise<void> => {
  const slug = String(req.params['slug']);

  const parsed = UpdatePageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }
  const { blocks, translations, isPublished } = parsed.data;

  try {
    const page = await ensurePage(slug);
    if (!page) {
      res.status(404).json({ error: 'Страница не найдена' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      if (isPublished !== undefined) {
        await tx.page.update({ where: { id: page.id }, data: { isPublished } });
      }

      if (blocks !== undefined) {
        await tx.pageBlock.deleteMany({ where: { pageId: page.id } });
        if (blocks.length > 0) {
          await tx.pageBlock.createMany({
            data: blocks.map((b) => ({
              pageId: page.id,
              type: b.type,
              sortOrder: b.sortOrder,
              content: b.content as Prisma.InputJsonValue,
            })),
          });
        }
      }

      if (translations !== undefined) {
        for (const t of translations) {
          await tx.pageTranslation.upsert({
            where: { pageId_lang: { pageId: page.id, lang: t.lang } },
            create: {
              pageId: page.id,
              lang: t.lang,
              title: t.title,
              seoTitle: t.seoTitle ?? null,
              seoDescription: t.seoDescription ?? null,
              ogImageUrl: t.ogImageUrl ?? null,
            },
            update: {
              title: t.title,
              seoTitle: t.seoTitle ?? null,
              seoDescription: t.seoDescription ?? null,
              ogImageUrl: t.ogImageUrl ?? null,
            },
          });
        }
      }
    });

    const updated = await prisma.page.findUnique({
      where: { slug: slug },
      include: { blocks: { orderBy: { sortOrder: 'asc' } }, translations: true },
    });
    res.json(updated);
  } catch (err) {
    handleError(err, res);
  }
});
