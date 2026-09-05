import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TaoKeHoachAnDto } from './dto/meal-plan.dto';

@Injectable()
export class MealPlansService {
    constructor(private readonly prisma: PrismaService) {}

    async layDanhSach(trang: number, kichThuoc: number) {
        const [items, tongSoPhanTu] = await Promise.all([
            this.prisma.mealPlan.findMany({
                skip: trang * kichThuoc,
                take: kichThuoc,
                orderBy: { createdAt: 'desc' },
                include: { items: true },
            }),
            this.prisma.mealPlan.count(),
        ]);

        const tongSoTrang = Math.ceil(tongSoPhanTu / kichThuoc);

        return {
            noiDung: items.map((m) => this.toKeHoachAn(m)),
            tongSoPhanTu,
            tongSoTrang,
        };
    }

    async taoMoi(userId: string, dto: TaoKeHoachAnDto) {
        if (new Date(dto.ngayBatDau) > new Date(dto.ngayKetThuc)) {
            throw new BadRequestException({
                code: 'MEAL-00',
                message: '[MEAL-00] Ngày bắt đầu phải trước ngày kết thúc',
            });
        }

        const mealPlan = await this.prisma.mealPlan.create({
            data: {
                userId,
                name: dto.ten,
                startDate: new Date(dto.ngayBatDau),
                endDate: new Date(dto.ngayKetThuc),
                isActive: true,
            },
            include: { items: true },
        });

        return this.toKeHoachAn(mealPlan);
    }

    async layChiTiet(id: string) {
        const mealPlan = await this.prisma.mealPlan.findUnique({
            where: { id },
            include: { items: true },
        });

        if (!mealPlan) {
            throw new NotFoundException({
                code: 'MEAL-04',
                message: '[MEAL-04] Không tìm thấy kế hoạch ăn',
            });
        }

        return this.toKeHoachAn(mealPlan);
    }

    private toKeHoachAn(mealPlan: {
        id: string;
        name: string;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        items: Array<{
            id: string;
            date: Date;
            mealType: string;
            servings: number;
            sortOrder: number;
            recipeId: string | null;
        }>;
    }) {
        return {
            id: mealPlan.id,
            ten: mealPlan.name,
            ngayBatDau: mealPlan.startDate.toISOString().split('T')[0],
            ngayKetThuc: mealPlan.endDate.toISOString().split('T')[0],
            kichHoat: mealPlan.isActive,
            cacMon: mealPlan.items.map((item) => ({
                id: item.id,
                ngay: item.date.toISOString().split('T')[0],
                loaiBuoiAn: item.mealType,
                khauPhan: item.servings,
                thuTu: item.sortOrder,
                congThuc: item.recipeId ? { id: item.recipeId } : null,
            })),
        };
    }
}
