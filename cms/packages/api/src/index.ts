import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { authRouter } from './modules/auth/auth.controller';
import { usersRouter } from './modules/users/users.controller';
import { publicNewsRouter, cmsNewsRouter } from './modules/news/news.controller';
import { mediaRouter } from './modules/media/media.controller';
import { publicPagesRouter, cmsPagesRouter } from './modules/pages/pages.controller';
import { teamRouter } from './modules/team/team.controller';
import { branchesRouter } from './modules/contacts/branches.controller';
import { documentsRouter, publicDocumentsRouter } from './modules/documents/documents.controller';
import { joinRequestsRouter, cmsJoinRequestsRouter } from './modules/join-requests/join-requests.controller';
import { appealsRouter, appealTopicsRouter, cmsAppealsRouter } from './modules/appeals/appeals.controller';
import { shopSubscribersRouter, cmsShopSubscribersRouter } from './modules/shop-subscribers/shop-subscribers.controller';
import { cmsDeputyRequestsRouter } from './modules/deputy-requests/deputy-requests.controller';
import { cmsSettingsRouter, publicSettingsRouter } from './modules/settings/settings.controller';
import { publicCandidatesRouter, cmsCandidatesRouter } from './modules/candidates/candidates.controller';
import { publicHistoryRouter, cmsHistoryRouter } from './modules/history/history.controller';
import { publicProgramRouter, cmsProgramRouter } from './modules/program/program.controller';
import { publicMediaProjectsRouter, cmsMediaProjectsRouter } from './modules/media-projects/media-projects.controller';
import { publicMediaPublicationsRouter, cmsMediaPublicationsRouter } from './modules/media-publications/media-publications.controller';
import { publicTestimonialsRouter, cmsTestimonialsRouter } from './modules/testimonials/testimonials.controller';
import { publicMenuItemsRouter, cmsMenuItemsRouter } from './modules/menu-items/menu-items.controller';
import { publicFaqRouter, cmsFaqRouter } from './modules/faq/faq.controller';
import { publicYoutubeRouter } from './modules/youtube/youtube.controller';
import { logger } from './lib/logger';
import { ensureBucketExists } from './lib/minio';
import { startReminderScheduler } from './lib/reminders';

const app = express();
const PORT = process.env.PORT ?? 3001;

// ─── Security middleware ───────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = (process.env.CORS_ORIGINS ?? '').split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
  })
);

// ─── General middleware ────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
  })
);

// ─── Rate limiting ────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много запросов, попробуйте позже' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много попыток входа. Подождите 15 минут.' },
  skipSuccessfulRequests: true,
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Public API routes ────────────────────────────────────────────────────────
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1', generalLimiter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/news', publicNewsRouter);
app.use('/api/v1/media', mediaRouter);
app.use('/api/v1/team', teamRouter);
app.use('/api/v1/branches', branchesRouter);
app.use('/api/v1/pages', publicPagesRouter);
app.use('/api/v1/documents', publicDocumentsRouter);
app.use('/api/v1/join-requests', joinRequestsRouter);
app.use('/api/v1/appeals', appealsRouter);
app.use('/api/v1/appeal-topics', appealTopicsRouter);
app.use('/api/v1/shop-subscribers', shopSubscribersRouter);
app.use('/api/v1/settings', publicSettingsRouter);
app.use('/api/v1/candidates', publicCandidatesRouter);
app.use('/api/v1/history-events', publicHistoryRouter);
app.use('/api/v1/program-blocks', publicProgramRouter);
app.use('/api/v1/media-projects', publicMediaProjectsRouter);
app.use('/api/v1/media-publications', publicMediaPublicationsRouter);
app.use('/api/v1/testimonials', publicTestimonialsRouter);
app.use('/api/v1/menu-items', publicMenuItemsRouter);
app.use('/api/v1/faq', publicFaqRouter);
app.use('/api/v1/youtube', publicYoutubeRouter);

// ─── CMS API routes (require auth — enforced per-router) ──────────────────────
app.use('/cms/api/v1/users', usersRouter);
app.use('/cms/api/v1/news', cmsNewsRouter);
app.use('/cms/api/v1/media', mediaRouter);
app.use('/cms/api/v1/team', teamRouter);
app.use('/cms/api/v1/branches', branchesRouter);
app.use('/cms/api/v1/pages', cmsPagesRouter);
app.use('/cms/api/v1/documents', documentsRouter);
app.use('/cms/api/v1/join-requests', cmsJoinRequestsRouter);
app.use('/cms/api/v1/appeals', cmsAppealsRouter);
app.use('/cms/api/v1/settings', cmsSettingsRouter);
app.use('/cms/api/v1/candidates', cmsCandidatesRouter);
app.use('/cms/api/v1/history-events', cmsHistoryRouter);
app.use('/cms/api/v1/program-blocks', cmsProgramRouter);
app.use('/cms/api/v1/media-projects', cmsMediaProjectsRouter);
app.use('/cms/api/v1/media-publications', cmsMediaPublicationsRouter);
app.use('/cms/api/v1/testimonials', cmsTestimonialsRouter);
app.use('/cms/api/v1/menu-items', cmsMenuItemsRouter);
app.use('/cms/api/v1/faq', cmsFaqRouter);
app.use('/cms/api/v1/shop-subscribers', cmsShopSubscribersRouter);
app.use('/cms/api/v1/deputy-requests', cmsDeputyRequestsRouter);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    logger.error('Unhandled error', { message: err.message, stack: err.stack });
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  logger.info(`НПК CMS API listening on port ${PORT}`);
  try {
    await ensureBucketExists();
    logger.info('MinIO bucket ready');
  } catch {
    logger.warn('MinIO not available at startup — bucket check skipped');
  }
  startReminderScheduler();
});

export default app;
