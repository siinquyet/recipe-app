import { Injectable, Logger } from '@nestjs/common';
import { Prisma, UserActivityType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface ActivityLogData {
  userId: string;
  type: UserActivityType | string;
  entityType: string;
  entityId: string;
  metadata?: any;
}

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(data: ActivityLogData): Promise<void> {
    try {
      await this.prisma.userActivity.create({
        data: {
          userId: data.userId,
          type: data.type as UserActivityType,
          entityType: data.entityType,
          entityId: data.entityId,
          metadata: data.metadata ? (data.metadata as unknown as Prisma.InputJsonValue) : undefined,
        },
      });
    } catch (err) {
      // NFR: không làm crash request, chỉ log lỗi
      this.logger.warn('[LOG-01] Ghi UserActivity thất bại', err as any);
    }
  }
}