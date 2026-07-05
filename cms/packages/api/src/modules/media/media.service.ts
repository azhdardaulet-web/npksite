import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { prisma } from '../../lib/prisma';
import { minioClient, MINIO_BUCKET, MINIO_PUBLIC_URL, deleteObject, objectUrl } from '../../lib/minio';
import { logger } from '../../lib/logger';

// ─── MIME whitelist ───────────────────────────────────────────────────────────

type MediaKind = 'image' | 'video' | 'pdf' | 'document';

const ALLOWED_MIME: Record<string, MediaKind> = {
  'image/jpeg':      'image',
  'image/png':       'image',
  'image/webp':      'image',
  'image/svg+xml':   'image',
  'application/pdf': 'pdf',
  'video/mp4':       'video',
};

const SIZE_LIMIT: Record<MediaKind, number> = {
  image:    15 * 1024 * 1024,
  pdf:      50 * 1024 * 1024,
  video:   500 * 1024 * 1024,
  document: 20 * 1024 * 1024,
};

// ─── Upload ───────────────────────────────────────────────────────────────────

export async function uploadFile(
  file: Express.Multer.File,
  folderId: string | undefined,
  userId: string
) {
  const mediaKind = ALLOWED_MIME[file.mimetype];
  if (!mediaKind) {
    throw Object.assign(new Error('Недопустимый тип файла'), { status: 400 });
  }

  if (file.size > SIZE_LIMIT[mediaKind]) {
    const mb = Math.round(SIZE_LIMIT[mediaKind] / (1024 * 1024));
    throw Object.assign(new Error(`Файл слишком большой. Максимум ${mb} МБ`), { status: 400 });
  }

  const ext = path.extname(file.originalname).toLowerCase() || `.${file.mimetype.split('/')[1]}`;
  const uuid = uuidv4();
  const objectName = `${uuid}${ext}`;

  // Upload original to MinIO
  await minioClient.putObject(
    MINIO_BUCKET,
    objectName,
    file.buffer,
    file.size,
    { 'Content-Type': file.mimetype }
  );

  const url = objectUrl(objectName);
  let thumbnailUrl: string | undefined;

  // Generate thumbnail for raster images (not SVG)
  if (mediaKind === 'image' && file.mimetype !== 'image/svg+xml') {
    try {
      const thumbBuffer = await sharp(file.buffer)
        .resize(300, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      const thumbName = `thumbnails/${uuid}.webp`;
      await minioClient.putObject(
        MINIO_BUCKET,
        thumbName,
        thumbBuffer,
        thumbBuffer.length,
        { 'Content-Type': 'image/webp' }
      );
      thumbnailUrl = objectUrl(thumbName);
    } catch (err) {
      logger.warn('Thumbnail generation failed, continuing without', { err });
    }
  }

  const media = await prisma.media.create({
    data: {
      name: objectName,
      originalName: file.originalname,
      url,
      thumbnailUrl,
      type: mediaKind,
      mimeType: file.mimetype,
      size: file.size,
      folderId: folderId ?? null,
      uploadedById: userId,
    },
  });

  return media;
}

// ─── List ─────────────────────────────────────────────────────────────────────

export async function listFiles(params: {
  folderId?: string;
  type?: string;
  q?: string;
  page?: number;
  limit?: number;
}) {
  const { folderId, type, q, page = 1, limit = 50 } = params;

  const where = {
    ...(folderId ? { folderId } : {}),
    ...(type ? { type: type as MediaKind } : {}),
    ...(q
      ? { originalName: { contains: q, mode: 'insensitive' as const } }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { uploadedBy: { select: { id: true, name: true } } },
    }),
    prisma.media.count({ where }),
  ]);

  return { items, total, page, limit, hasMore: page * limit < total };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteFile(id: string, userId: string, isAdmin: boolean) {
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) {
    throw Object.assign(new Error('Файл не найден'), { status: 404 });
  }
  if (!isAdmin && media.uploadedById !== userId) {
    throw Object.assign(new Error('Недостаточно прав'), { status: 403 });
  }

  // Delete from MinIO
  await deleteObject(media.name).catch((err) =>
    logger.warn('Failed to delete object from MinIO', { err, name: media.name })
  );

  if (media.thumbnailUrl) {
    const thumbName = media.thumbnailUrl.replace(`${MINIO_PUBLIC_URL}/`, '');
    await deleteObject(thumbName).catch(() => undefined);
  }

  await prisma.media.delete({ where: { id } });
}

// ─── Rename ───────────────────────────────────────────────────────────────────

export async function renameFile(id: string, originalName: string) {
  return prisma.media.update({
    where: { id },
    data: { originalName },
  });
}

// ─── Folders ─────────────────────────────────────────────────────────────────

export async function listFolders() {
  return prisma.galleryFolder.findMany({
    orderBy: { name: 'asc' },
    include: { children: { orderBy: { name: 'asc' } } },
    where: { parentId: null },
  });
}

export async function createFolder(name: string, parentId?: string) {
  return prisma.galleryFolder.create({
    data: { name, parentId: parentId ?? null },
  });
}

export async function deleteFolder(id: string) {
  const [childCount, fileCount] = await Promise.all([
    prisma.galleryFolder.count({ where: { parentId: id } }),
    prisma.media.count({ where: { folderId: id } }),
  ]);

  if (childCount > 0 || fileCount > 0) {
    throw Object.assign(
      new Error('Нельзя удалить непустую папку'),
      { status: 400 }
    );
  }

  await prisma.galleryFolder.delete({ where: { id } });
}
