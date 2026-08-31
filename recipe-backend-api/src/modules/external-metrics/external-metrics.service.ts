import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExternalMetricsService {
  constructor(private prisma: PrismaService) {}

  async findByRecipeReference(recipeReferenceId: string) {
    const metrics = await this.prisma.externalRecipeMetrics.findUnique({
      where: { recipeReferenceId },
    });
    if (!metrics) {
      throw new NotFoundException('[MET-01] Chưa có metrics cho recipe reference này');
    }
    return metrics;
  }

  async upsert(recipeReferenceId: string, data: {
    spoonacularScore?: number;
    healthScore?: number;
    aggregateLikes?: number;
  }) {
    return this.prisma.externalRecipeMetrics.upsert({
      where: { recipeReferenceId },
      create: { recipeReferenceId, ...data },
      update: { ...data, lastSyncedAt: new Date() },
    });
  }

  async remove(recipeReferenceId: string) {
    return this.prisma.externalRecipeMetrics.delete({
      where: { recipeReferenceId },
    });
  }
}
