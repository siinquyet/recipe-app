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
    // MET-03: FK RecipeReference bắt buộc; thiếu reference thì trả 404 thay vì để Prisma ném P2003 -> 500
    const reference = await this.prisma.recipeReference.findUnique({
      where: { id: recipeReferenceId },
      select: { id: true },
    });
    if (!reference) {
      throw new NotFoundException('[MET-03] Recipe reference không tồn tại');
    }
    return this.prisma.externalRecipeMetrics.upsert({
      where: { recipeReferenceId },
      create: { recipeReferenceId, ...data },
      update: { ...data, lastSyncedAt: new Date() },
    });
  }

  async remove(recipeReferenceId: string) {
    // MET-02: Prisma ném P2025 khi record không tồn tại -> phải trả 404 chứ không để rơi ra 500
    const existing = await this.prisma.externalRecipeMetrics.findUnique({
      where: { recipeReferenceId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('[MET-02] Chưa có metrics cho recipe reference này');
    }
    return this.prisma.externalRecipeMetrics.delete({
      where: { recipeReferenceId },
    });
  }
}
