import { Injectable, Logger } from '@nestjs/common';
import { Prisma, AuditAction } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditLogData {
  userId: string;
  action: AuditAction | string;
  entityType: string;
  entityId: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(data: AuditLogData): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action as AuditAction,
          entityType: data.entityType,
          entityId: data.entityId,
          oldData: data.oldData ? (data.oldData as unknown as Prisma.InputJsonValue) : undefined,
          newData: data.newData ? (data.newData as unknown as Prisma.InputJsonValue) : undefined,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (err) {
      // NFR: không làm crash request, chỉ log lỗi
      this.logger.warn('[LOG-02] Ghi AuditLog thất bại', err as any);
    }
  }
}