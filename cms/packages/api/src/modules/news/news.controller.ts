import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { requireNewsEditor } from '../../middleware/auth';
import { Role, NewsFormatSchema, NewsStatusSchema, LangSchema } from '@dar-rail/shared';
import {
  createNews,
  updateNews,
  publishNews,
  archiveNews,
  draftNews,
  deleteNews,
  findAll,
  findById,
  findBySlug,
  toggleFeatured,
} from './news.service';

export const publicNewsRouter = Router();
export const cmsNewsRouter = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function handleError(err: unknown, res: Response) {
  const e = err as { message?: string; status?: number };
  res.status(e.status ?? 500).json({ error: e.message ?? 'Внутренняя ошибка' });
}

// Optionally verifies JWT without blocking unauthenticated requests.
async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true, role: true, status: true, branchId: true, section: true },
      });
      if (user && user.status !== 'BLOCKED') {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as Role,
          branchId: user.branchId,
          section: user.section,
        };
      }
    } catch {
      // ignore invalid tokens — request proceeds as unauthenticated
    }
  }
  next();
}

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const ListQuerySchema = z.object({
  status: NewsStatusSchema.optional(),
  format: NewsFormatSchema.optional(),
  q: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const TranslationInputSchema = z.object({
  lang: LangSchema,
  title: z.string().min(1, 'Заголовок обязателен').max(500),
  content: z.string().min(1, 'Текст обязателен'),
  excerpt: z.string().max(1000).optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  ogImageUrl: z.string().url().optional().or(z.literal('')),
});

const CreateBodySchema = z.object({
  format: NewsFormatSchema,
  imageUrl: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  tgSkip: z.boolean().optional(),
  translations: z.array(TranslationInputSchema).min(1, 'Добавьте хотя бы один перевод'),
});

const UpdateBodySchema = CreateBodySchema;

const PublishBodySchema = z.object({
  scheduledAt: z.coerce.date().optional(),
});

// ─── Public: GET /api/v1/news — list published news ──────────────────────────
publicNewsRouter.get('/', async (req: Request, res: Response) => {
  const parsed = ListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Некорректные параметры', details: parsed.error.issues });
    return;
  }

  const lang = LangSchema.catch('ru').parse(req.query.lang);
  const { format, q, page, limit } = parsed.data;

  try {
    const result = await findAll({ status: 'PUBLISHED', format, q, page, limit });
    const data = result.data.map((item) => {
      const t =
        item.translations.find((tr) => tr.lang === lang) ??
        item.translations.find((tr) => tr.lang === 'ru') ??
        item.translations[0];
      const { translations: _t, ...rest } = item as typeof item & { translations: unknown };
      return { ...rest, title: t?.title ?? '', excerpt: t?.excerpt ?? null };
    });
    res.json({ ...result, data });
  } catch (err) {
    handleError(err, res);
  }
});

// ─── Public: GET /api/v1/news/:slug — single article by slug ──────────────────
publicNewsRouter.get('/:slug', async (req: Request, res: Response) => {
  const lang = LangSchema.catch('ru').parse(req.query.lang);
  try {
    const news = await findBySlug(String(req.params.slug), lang);
    res.json(news);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS router for authenticated news management ────────────────────────────
cmsNewsRouter.use(requireNewsEditor);

cmsNewsRouter.get('/', async (req: Request, res: Response) => {
  const parsed = ListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Некорректные параметры', details: parsed.error.issues });
    return;
  }

  const { status, format, q, page, limit } = parsed.data;
  try {
    const result = await findAll({ status, format, q, page, limit });
    res.json(result);
  } catch (err) {
    handleError(err, res);
  }
});

cmsNewsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const news = await findById(String(req.params.id));
    res.json(news);
  } catch (err) {
    handleError(err, res);
  }
});

cmsNewsRouter.post('/', async (req: Request, res: Response) => {
  const parsed = CreateBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.issues });
    return;
  }

  try {
    const data = parsed.data;
    const news = await createNews(
      {
        format: data.format,
        imageUrl: data.imageUrl || undefined,
        tags: data.tags,
        tgSkip: data.tgSkip,
        translations: data.translations.map((t) => ({
          lang: t.lang,
          title: t.title,
          content: t.content,
          excerpt: t.excerpt,
          seoTitle: t.seoTitle,
          seoDescription: t.seoDescription,
          ogImageUrl: t.ogImageUrl || undefined,
        })),
      },
      req.user!.id
    );
    res.status(201).json(news);
  } catch (err) {
    handleError(err, res);
  }
});

cmsNewsRouter.put('/:id', async (req: Request, res: Response) => {
  const parsed = UpdateBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.issues });
    return;
  }

  try {
    const data = parsed.data;
    const news = await updateNews(String(req.params.id), {
      format: data.format,
      imageUrl: data.imageUrl || null,
      tags: data.tags,
      tgSkip: data.tgSkip,
      translations: data.translations.map((t) => ({
        lang: t.lang,
        title: t.title,
        content: t.content,
        excerpt: t.excerpt,
        seoTitle: t.seoTitle,
        seoDescription: t.seoDescription,
        ogImageUrl: t.ogImageUrl || undefined,
      })),
    });
    res.json(news);
  } catch (err) {
    handleError(err, res);
  }
});

cmsNewsRouter.post('/:id/publish', async (req: Request, res: Response) => {
  const parsed = PublishBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Некорректная дата публикации' });
    return;
  }

  try {
    const news = await publishNews(String(req.params.id), parsed.data.scheduledAt);
    res.json(news);
  } catch (err) {
    handleError(err, res);
  }
});

cmsNewsRouter.post('/:id/archive', async (req: Request, res: Response) => {
  try {
    const news = await archiveNews(String(req.params.id));
    res.json(news);
  } catch (err) {
    handleError(err, res);
  }
});

cmsNewsRouter.post('/:id/draft', async (req: Request, res: Response) => {
  try {
    const news = await draftNews(String(req.params.id));
    res.json(news);
  } catch (err) {
    handleError(err, res);
  }
});

cmsNewsRouter.post('/:id/toggle-featured', async (req: Request, res: Response) => {
  try {
    const news = await toggleFeatured(String(req.params.id));
    res.json(news);
  } catch (err) {
    handleError(err, res);
  }
});

cmsNewsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await deleteNews(String(req.params.id));
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
});
