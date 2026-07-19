import type { Request } from 'express';
import { prisma } from './prisma';
import { logger } from './logger';

interface AuditInput {
  action: 'CREATE' | 'UPDATE' | 'BLOCK' | 'UNBLOCK' | 'VISIBILITY';
  entity: string;
  entityId?: string | null;
  details: string;
}

// Ошибка записи аудита не должна отменять уже выполненное действие пользователя.
export async function writeAudit(req: Request, input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id ?? null,
        userName: req.user?.name ?? 'Система',
        userRole: req.user?.role ?? 'SYSTEM',
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        details: input.details,
      },
    });
  } catch (error) {
    logger.error('Не удалось записать событие аудита', { error, input });
  }
}
