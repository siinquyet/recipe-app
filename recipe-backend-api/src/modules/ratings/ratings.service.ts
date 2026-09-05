import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TaoDanhGiaDto } from './dto/rating.dto';

@Injectable()
export class RatingsService {
    constructor(private readonly prisma: PrismaService) {}

    async danhGia(userId: string, recipeId: string, dto: TaoDanhGiaDto) {
        const recipe = await this.prisma.recipe.findFirst({
            where: { id: recipeId, deletedAt: null },
            select: { id: true },
        });
        if (!recipe) {
            throw new NotFoundException({
                code: 'REC-04',
                message: '[REC-04] Không tìm thấy công thức',
            });
        }

        await this.prisma.rating.upsert({
            where: { userId_recipeId: { userId, recipeId } },
            update: {
                score: dto.diem,
            },
            create: {
                userId,
                recipeId,
                score: dto.diem,
            },
        });

        const agg = await this.prisma.rating.aggregate({
            where: { recipeId },
            _avg: { score: true },
            _count: { _all: true },
        });

        return {
            diemTrungBinh: Math.round((agg._avg.score ?? 0) * 10) / 10,
            tongSoDanhGia: agg._count._all,
        };
    }
}
