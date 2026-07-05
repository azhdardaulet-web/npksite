import { Router, Request, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { authenticateToken } from '../../middleware/auth';
import {
  uploadFile,
  listFiles,
  deleteFile,
  renameFile,
  listFolders,
  createFolder,
  deleteFolder,
} from './media.service';
import { prisma } from '../../lib/prisma';

export const mediaRouter = Router();

// ─── Multer — memory storage, max 500 MB, MIME pre-filter ────────────────────

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'video/mp4',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Недопустимый тип файла: ${file.mimetype}`));
    }
  },
});

// ─── Helper ───────────────────────────────────────────────────────────────────

function handleError(err: unknown, res: Response) {
  const e = err as { message?: string; status?: number };
  res.status(e.status ?? 500).json({ error: e.message ?? 'Внутренняя ошибка' });
}

// ─── CMS: Upload ──────────────────────────────────────────────────────────────

// POST /cms/api/v1/media/upload
mediaRouter.post(
  '/upload',
  authenticateToken,
  upload.single('file'),
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: 'Файл не передан' });
      return;
    }
    try {
      const media = await uploadFile(req.file, req.body.folderId, req.user!.id);
      res.status(201).json(media);
    } catch (err) {
      handleError(err, res);
    }
  }
);

// ─── CMS: List files ──────────────────────────────────────────────────────────

const ListSchema = z.object({
  folderId: z.string().uuid().optional(),
  type:     z.enum(['image', 'video', 'pdf', 'document']).optional(),
  q:        z.string().max(100).optional(),
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(100).default(50),
});

// GET /cms/api/v1/media
mediaRouter.get('/', authenticateToken, async (req: Request, res: Response) => {
  const parsed = ListSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка параметров', details: parsed.error.flatten() });
    return;
  }
  try {
    const result = await listFiles(parsed.data);
    res.json(result);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: Rename file ─────────────────────────────────────────────────────────

// PATCH /cms/api/v1/media/:id
mediaRouter.patch('/:id', authenticateToken, async (req: Request, res: Response) => {
  const { originalName } = req.body as { originalName?: string };
  if (!originalName || typeof originalName !== 'string') {
    res.status(400).json({ error: 'Поле originalName обязательно' });
    return;
  }
  try {
    const media = await renameFile(req.params.id as string, originalName.trim());
    res.json(media);
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: Delete file ─────────────────────────────────────────────────────────

// DELETE /cms/api/v1/media/:id
mediaRouter.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === 'ADMIN';
  try {
    await deleteFile(req.params.id as string, req.user!.id, isAdmin);
    res.json({ ok: true });
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: Folders ─────────────────────────────────────────────────────────────

// GET /cms/api/v1/media/folders
mediaRouter.get('/folders', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const folders = await listFolders();
    res.json(folders);
  } catch (err) {
    handleError(err, res);
  }
});

// POST /cms/api/v1/media/folders
mediaRouter.post('/folders', authenticateToken, async (req: Request, res: Response) => {
  const schema = z.object({
    name:     z.string().min(1).max(100),
    parentId: z.string().uuid().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }
  try {
    const folder = await createFolder(parsed.data.name, parsed.data.parentId);
    res.status(201).json(folder);
  } catch (err) {
    handleError(err, res);
  }
});

// DELETE /cms/api/v1/media/folders/:id
mediaRouter.delete('/folders/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    await deleteFolder(req.params.id as string);
    res.json({ ok: true });
  } catch (err) {
    handleError(err, res);
  }
});

// ─── Public: Get file by id (redirect to MinIO URL) ──────────────────────────

// GET /api/v1/media/:id
mediaRouter.get('/:id/public', async (req: Request, res: Response) => {
  try {
    const media = await prisma.media.findUnique({
      where: { id: req.params.id as string },
      select: { url: true },
    });
    if (!media) {
      res.status(404).json({ error: 'Файл не найден' });
      return;
    }
    res.redirect(302, media.url);
  } catch (err) {
    handleError(err, res);
  }
});
