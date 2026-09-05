import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class FavoritesService {
    constructor(private readonly prisma: PrismaService) {}

    async themYeuThich(userId: string, recipeId: string) {
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

        const existing = await this.prisma.favorite.findUnique({
            where: { userId_recipeId: { userId, recipeId } },
        });
        if (existing) {
            return { daThem: true };
        }

        await this.prisma.favorite.create({
            data: { userId, recipeId },
        });

        return { daThem: true };
    }

    async xoaYeuThich(userId: string, recipeId: string) {
        await this.prisma.favorite.deleteMany({
            where: { userId, recipeId },
        });
        return { daXoa: true };
    }
}
