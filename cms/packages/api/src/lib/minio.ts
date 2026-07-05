import { Client } from 'minio';
import { logger } from './logger';

export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT ?? 'localhost',
  port: parseInt(process.env.MINIO_PORT ?? '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY ?? '',
  secretKey: process.env.MINIO_SECRET_KEY ?? '',
});

export const MINIO_BUCKET = process.env.MINIO_BUCKET ?? 'darrail-media';
export const MINIO_PUBLIC_URL = (process.env.MINIO_PUBLIC_URL ?? '').replace(/\/$/, '');

export async function ensureBucketExists(): Promise<void> {
  try {
    const exists = await minioClient.bucketExists(MINIO_BUCKET);
    if (!exists) {
      await minioClient.makeBucket(MINIO_BUCKET, 'us-east-1');
      // Make bucket public-read via policy
      const policy = JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${MINIO_BUCKET}/*`],
          },
        ],
      });
      await minioClient.setBucketPolicy(MINIO_BUCKET, policy);
      logger.info(`MinIO bucket "${MINIO_BUCKET}" created with public-read policy`);
    }
  } catch (err) {
    logger.error('Failed to ensure MinIO bucket', { err });
    throw err;
  }
}

export async function deleteObject(objectName: string): Promise<void> {
  await minioClient.removeObject(MINIO_BUCKET, objectName);
}

export function objectUrl(objectName: string): string {
  return `${MINIO_PUBLIC_URL}/${objectName}`;
}
