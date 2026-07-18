import { Router } from 'express';
import { prisma } from '../../lib/prisma';

export const publicYoutubeRouter = Router();

const CACHE_KEY = 'youtube_feed_cache';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 часов, чтобы не жечь квоту YouTube Data API
const MAX_RESULTS = 6;
// Канал НПК — тот же ID, что используется во всех соцссылках на сайте (Footer, DesktopHeader и т.д.)
const DEFAULT_CHANNEL_ID = 'UCYq_KOlsxp8H2r3GIq6hWtA';

export interface YoutubeFeedItem {
  id: string;
  title: string;
  publishedAt: string;
}

async function fetchFromYoutube(): Promise<YoutubeFeedItem[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY не задан в cms/.env');

  const channelId = process.env.YOUTUBE_CHANNEL_ID || DEFAULT_CHANNEL_ID;
  // Плейлист загрузок канала = его ID с заменой префикса UC → UU (гарантируется YouTube),
  // экономит отдельный запрос к channels.list за contentDetails.relatedPlaylists.uploads.
  const uploadsPlaylistId = 'UU' + channelId.slice(2);

  const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('playlistId', uploadsPlaylistId);
  url.searchParams.set('maxResults', String(MAX_RESULTS));
  url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`YouTube API вернул ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as { items?: Array<{ snippet?: { resourceId?: { videoId?: string }; title?: string; publishedAt?: string } }> };
  return (data.items ?? [])
    .filter((it) => it.snippet?.resourceId?.videoId)
    .map((it) => ({
      id: it.snippet!.resourceId!.videoId!,
      title: it.snippet!.title ?? '',
      publishedAt: it.snippet!.publishedAt ?? '',
    }));
}

// GET /api/v1/youtube/feed — последние ролики канала, кэш на 6 часов в Setting (key=youtube_feed_cache).
// Новый ролик на канале появляется на сайте автоматически при первом запросе после истечения кэша —
// без ручного обновления контента.
publicYoutubeRouter.get('/feed', async (_req, res) => {
  const cached = await prisma.setting.findUnique({ where: { key: CACHE_KEY } }).catch(() => null);
  const isFresh = !!cached && Date.now() - cached.updatedAt.getTime() < CACHE_TTL_MS;

  if (isFresh) {
    res.json({ videos: JSON.parse(cached!.value) });
    return;
  }

  try {
    const videos = await fetchFromYoutube();
    await prisma.setting.upsert({
      where: { key: CACHE_KEY },
      update: { value: JSON.stringify(videos) },
      create: { key: CACHE_KEY, value: JSON.stringify(videos) },
    });
    res.json({ videos });
  } catch (err) {
    // YouTube недоступен или ключ не задан — отдаём то, что есть в кэше (пусть устаревшее),
    // а не ошибку. Фронт при пустом videos[] сам покажет статичный фолбэк.
    console.error('[youtube] не удалось обновить ленту:', (err as Error).message);
    res.json({ videos: cached ? JSON.parse(cached.value) : [] });
  }
});
