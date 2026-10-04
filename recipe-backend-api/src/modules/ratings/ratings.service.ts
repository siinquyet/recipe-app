import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TaoDanhGiaDto } from './dto/rating.dto';

@Injectable()
export class RatingsService {
    constructor(private readonly prisma: PrismaService) {}

    async danhGia(userId: string, recipeId: string, dto: TaoDanhGiaDto) {
        const recipe = await this.prisma.recipe.findFirst({
            where: { id: recipeId, deletedAt: null },
            select: { id: true, authorId: true, status: true },
        });
        if (!recipe) {
            throw new NotFoundException({
                code: 'REC-04',
                message: '[REC-04] Không tìm thấy công thức',
            });
        }
        // BR-UREC: Chỉ chấm được bài công khai (chủ bài xem nháp không chấm)
        if (recipe.status !== 'APPROVED' && recipe.authorId !== userId) {
            throw new NotFoundException({
                code: 'REC-04',
                message: '[REC-04] Không tìm thấy công thức',
            });
        }

        await this.prisma.rating.upsert({
            where: { userId_recipeId: { userId, recipeId } },
            update: {
                score: dto.diem,
                binhLuan: dto.binhLuan,
            },
            create: {
                userId,
                recipeId,
                score: dto.diem,
                binhLuan: dto.binhLuan,
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

    async tomTat(recipeId: string) {
        // BR-SOC-05: Chặn trả 0/0 cho id ma, báo 404 đúng Docs
        const tonTai = await this.prisma.recipe.findFirst({
            where: { id: recipeId, deletedAt: null },
            select: { id: true },
        });
        if (!tonTai) {
            throw new NotFoundException({ code: 'REC-04', message: '[REC-04] Không tìm thấy công thức' });
        }
        // BR-SOC: Tổng quan điểm + phân bổ 1-5 sao cho khối đánh giá
        const nhom = await this.prisma.rating.groupBy({
            by: ['score'],
            where: { recipeId },
            _count: { score: true },
        });
        const phanBo: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
        let tongDiem = 0;
        let tongSo = 0;
        for (const n of nhom) {
            phanBo[String(n.score)] = n._count.score;
            tongDiem += n.score * n._count.score;
            tongSo += n._count.score;
        }
        return {
            diemTrungBinh: tongSo > 0 ? Math.round((tongDiem / tongSo) * 10) / 10 : 0,
            tongSoDanhGia: tongSo,
            phanBo,
        };
    }
}
