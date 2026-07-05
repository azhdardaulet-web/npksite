import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { Lang, NewsCategory, NewsStatus, NewsType } from '@dar-rail/shared';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TranslationInput {
  lang: Lang;
  title: string;
  content: string;
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImageUrl?: string;
}

export interface CreateNewsInput {
  type: NewsType;
  category: NewsCategory;
  imageUrl?: string;
  translations: TranslationInput[];
}

export interface UpdateNewsInput {
  type: NewsType;
  category: NewsCategory;
  imageUrl?: string | null;
  translations: TranslationInput[];
}

export interface NewsFilters {
  status?: NewsStatus;
  type?: NewsType;
  category?: NewsCategory;
  q?: string;
  page?: number;
  limit?: number;
}

// ─── Slug generation ──────────────────────────────────────────────────────────

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo',
  ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
  ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  // Kazakh
  ә: 'a', ғ: 'g', қ: 'k', ң: 'n', ө: 'o', ұ: 'u', ү: 'u', һ: 'h', і: 'i',
};

function transliterate(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export async function generateSlug(title: string, excludeId?: string): Promise<string> {
  const base = transliterate(title) || 'news';
  let slug = base;
  let i = 1;
  for (;;) {
    const existing = await prisma.news.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) break;
    slug = `${base}-${i++}`;
  }
  return slug;
}

// ─── Text helpers ─────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function calcReadingTime(html: string): number {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function autoExcerpt(html: string, maxLen = 300): string {
  return stripHtml(html).slice(0, maxLen);
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function createNews(data: CreateNewsInput, authorId: string) {
  const ruTranslation = data.translations.find((t) => t.lang === 'ru') ?? data.translations[0];
  const slug = await generateSlug(ruTranslation.title);
  const readingTime = calcReadingTime(ruTranslation.content);

  return prisma.news.create({
    data: {
      slug,
      type: data.type,
      category: data.category,
      status: 'DRAFT',
      imageUrl: data.imageUrl ?? null,
      readingTime,
      authorId,
      translations: {
        create: data.translations.map((t) => ({
          lang: t.lang,
          title: t.title,
          content: t.content,
          excerpt: t.excerpt ?? autoExcerpt(t.content),
          seoTitle: t.seoTitle ?? null,
          seoDescription: t.seoDescription ?? null,
          ogImageUrl: t.ogImageUrl ?? null,
        })),
      },
    },
    include: {
      translations: true,
      author: { select: { id: true, name: true } },
    },
  });
}

export async function updateNews(id: string, data: UpdateNewsInput) {
  const news = await prisma.news.findUnique({
    where: { id },
    include: { translations: true },
  });
  if (!news) throw Object.assign(new Error('Новость не найдена'), { status: 404 });

  const ruT = data.translations.find((t) => t.lang === 'ru') ?? data.translations[0];
  const readingTime = calcReadingTime(ruT.content);

  const ruExisting = news.translations.find((t) => t.lang === 'ru');
  const titleChanged = ruExisting?.title !== ruT.title;
  const slug = titleChanged ? await generateSlug(ruT.title, id) : news.slug;

  return prisma.news.update({
    where: { id },
    data: {
      slug,
      type: data.type,
      category: data.category,
      imageUrl: data.imageUrl ?? null,
      readingTime,
      translations: {
        upsert: data.translations.map((t) => ({
          where: { newsId_lang: { newsId: id, lang: t.lang } },
          create: {
            lang: t.lang,
            title: t.title,
            content: t.content,
            excerpt: t.excerpt ?? autoExcerpt(t.content),
            seoTitle: t.seoTitle ?? null,
            seoDescription: t.seoDescription ?? null,
            ogImageUrl: t.ogImageUrl ?? null,
          },
          update: {
            title: t.title,
            content: t.content,
            excerpt: t.excerpt ?? autoExcerpt(t.content),
            seoTitle: t.seoTitle ?? null,
            seoDescription: t.seoDescription ?? null,
            ogImageUrl: t.ogImageUrl ?? null,
          },
        })),
      },
    },
    include: {
      translations: true,
      author: { select: { id: true, name: true } },
    },
  });
}

export async function publishNews(id: string, scheduledAt?: Date) {
  const news = await prisma.news.findUnique({ where: { id } });
  if (!news) throw Object.assign(new Error('Новость не найдена'), { status: 404 });

  if (scheduledAt && scheduledAt > new Date()) {
    return prisma.news.update({
      where: { id },
      data: { status: 'SCHEDULED', scheduledAt, publishedAt: null },
      include: { translations: true },
    });
  }

  return prisma.news.update({
    where: { id },
    data: { status: 'PUBLISHED', publishedAt: new Date(), scheduledAt: null },
    include: { translations: true },
  });
}

export async function archiveNews(id: string) {
  const news = await prisma.news.findUnique({ where: { id } });
  if (!news) throw Object.assign(new Error('Новость не найдена'), { status: 404 });
  return prisma.news.update({
    where: { id },
    data: { status: 'ARCHIVED' },
    include: { translations: true },
  });
}

export async function draftNews(id: string) {
  const news = await prisma.news.findUnique({ where: { id } });
  if (!news) throw Object.assign(new Error('Новость не найдена'), { status: 404 });
  return prisma.news.update({
    where: { id },
    data: { status: 'DRAFT', publishedAt: null, scheduledAt: null },
    include: { translations: true },
  });
}

export async function deleteNews(id: string) {
  const news = await prisma.news.findUnique({ where: { id } });
  if (!news) throw Object.assign(new Error('Новость не найдена'), { status: 404 });
  await prisma.news.delete({ where: { id } });
}

export async function findAll(filters: NewsFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
  const skip = (page - 1) * limit;

  const where: Prisma.NewsWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.type) where.type = filters.type;
  if (filters.category) where.category = filters.category;
  if (filters.q) {
    where.translations = {
      some: { title: { contains: filters.q, mode: 'insensitive' } },
    };
  }

  const [data, total] = await Promise.all([
    prisma.news.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      include: {
        translations: { select: { lang: true, title: true, excerpt: true } },
        author: { select: { id: true, name: true } },
      },
    }),
    prisma.news.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function findById(id: string) {
  const news = await prisma.news.findUnique({
    where: { id },
    include: {
      translations: true,
      author: { select: { id: true, name: true } },
    },
  });
  if (!news) throw Object.assign(new Error('Новость не найдена'), { status: 404 });
  return news;
}

export async function toggleFeatured(id: string) {
  const news = await prisma.news.findUnique({ where: { id } });
  if (!news) throw Object.assign(new Error('Новость не найдена'), { status: 404 });
  return prisma.news.update({
    where: { id },
    data: { isFeatured: !news.isFeatured },
    include: { translations: true, author: { select: { id: true, name: true } } },
  });
}

export async function findBySlug(slug: string, lang: Lang = 'ru') {
  const news = await prisma.news.findFirst({
    where: { slug, status: 'PUBLISHED' },
    include: {
      translations: true,
      author: { select: { id: true, name: true } },
    },
  });
  if (!news) throw Object.assign(new Error('Новость не найдена'), { status: 404 });

  const translation =
    news.translations.find((t) => t.lang === lang) ??
    news.translations.find((t) => t.lang === 'ru') ??
    news.translations[0];

  return { ...news, activeTranslation: translation };
}
