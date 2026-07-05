import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { minioClient, MINIO_BUCKET, objectUrl, deleteObject } from '../../lib/minio';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';
import { DocumentType } from '@prisma/client';

export const documentsRouter = Router();

// Set up multer for memory storage (max 50MB for PDF)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error(`Недопустимый тип файла: ${file.mimetype}. Разрешен только PDF.`));
    }
  },
});

// Middleware to restrict access to CMS endpoints
documentsRouter.use(authenticateToken, requireRole('ADMIN', 'CHIEF_EDITOR', 'SECTION_EDITOR'));

// GET /cms/api/v1/documents
documentsRouter.get('/', async (req, res, next) => {
  try {
    const { type, year } = req.query;
    const documents = await prisma.document.findMany({
      where: {
        ...(type ? { type: type as DocumentType } : {}),
        ...(year ? { year: parseInt(year as string) } : {}),
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(documents);
  } catch (err) {
    next(err);
  }
});

// POST /cms/api/v1/documents
documentsRouter.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл обязателен' });
    }

    const { title, description, type, year } = req.body;

    if (!title || !type) {
      return res.status(400).json({ error: 'Поля title и type обязательны' });
    }

    const ext = 'pdf';
    const objectName = `documents/${uuidv4()}.${ext}`;

    // Upload to MinIO
    await minioClient.putObject(MINIO_BUCKET, objectName, req.file.buffer, req.file.size, {
      'Content-Type': req.file.mimetype,
    });

    const fileUrl = objectUrl(objectName);

    // Save to DB
    const document = await prisma.document.create({
      data: {
        title,
        description,
        type: type as DocumentType,
        year: year ? parseInt(year) : null,
        fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
      },
    });

    res.status(201).json(document);
  } catch (err) {
    next(err);
  }
});

// DELETE /cms/api/v1/documents/:id
documentsRouter.delete('/:id', async (req, res, next) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Документ не найден' });
    }

    // Extract object name from URL
    const urlParts = document.fileUrl.split('/');
    const objectName = urlParts.slice(urlParts.findIndex(p => p === MINIO_BUCKET) + 1).join('/');

    // Ignore MinIO delete errors (e.g. if file doesn't exist)
    try {
      if (objectName) {
        await deleteObject(objectName);
      }
    } catch (e) {
      console.warn('Failed to delete object from MinIO', e);
    }

    await prisma.document.delete({
      where: { id: req.params.id },
    });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export const publicDocumentsRouter = Router();

publicDocumentsRouter.get('/', async (req, res, next) => {
  try {
    const { type, year } = req.query;
    const documents = await prisma.document.findMany({
      where: {
        ...(type ? { type: type as DocumentType } : {}),
        ...(year ? { year: parseInt(year as string) } : {}),
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(documents);
  } catch (err) {
    next(err);
  }
});
