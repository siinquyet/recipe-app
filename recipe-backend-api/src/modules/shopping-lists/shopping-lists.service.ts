import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { TaoDanhSachDiChoDto } from './dto/shopping-list.dto';

@Injectable()
export class ShoppingListsService {
    constructor(private readonly prisma: PrismaService) {}

    async layDanhSachCuaNguoiDung(userId: string, trang: number, kichThuoc: number) {
        const [items, tongSoPhanTu] = await Promise.all([
            this.prisma.shoppingList.findMany({
                where: { userId },
                skip: trang * kichThuoc,
                take: kichThuoc,
                orderBy: { createdAt: 'desc' },
                include: { items: { orderBy: { sortOrder: 'asc' } } },
            }),
            this.prisma.shoppingList.count({ where: { userId } }),
        ]);

        const tongSoTrang = Math.ceil(tongSoPhanTu / kichThuoc);

        return {
            noiDung: items.map((s) => this.toDanhSach(s)),
            tongSoPhanTu,
            tongSoTrang,
        };
    }

    async taoMoi(userId: string, dto: TaoDanhSachDiChoDto) {
        const list = await this.prisma.shoppingList.create({
            data: {
                userId,
                name: dto.ten,
                sourceType: dto.loaiNguon,
                sourceId: dto.nguonId,
            },
            include: { items: true },
        });

        return this.toDanhSach(list);
    }

    async layChiTiet(id: string, userId: string) {
        const list = await this.prisma.shoppingList.findFirst({
            where: { id, userId },
            include: { items: { orderBy: { sortOrder: 'asc' } } },
        });

        if (!list) {
            throw new NotFoundException({
                code: 'SHOP-04',
                message: '[SHOP-04] Không tìm thấy danh sách đi chợ',
            });
        }

        return this.toDanhSach(list);
    }

    // BR-SHOP: Đánh dấu đã mua/bỏ chọn — chỉ chủ sở hữu được đổi
    async capNhatTrangThaiMon(listId: string, itemId: string, userId: string, daChon: boolean) {
        const list = await this.prisma.shoppingList.findFirst({
            where: { id: listId, userId },
            select: { id: true },
        });
        if (!list) {
            throw new NotFoundException({
                code: 'SHOP-04',
                message: '[SHOP-04] Không tìm thấy danh sách đi chợ',
            });
        }
        const item = await this.prisma.shoppingListItem.updateMany({
            where: { id: itemId, shoppingListId: listId },
            data: { isChecked: daChon },
        });
        if (item.count === 0) {
            throw new NotFoundException({
                code: 'SHOP-05',
                message: '[SHOP-05] Không tìm thấy món trong danh sách',
            });
        }
        return this.layChiTiet(listId, userId);
    }

    // BR-SHOP + BR-03/BR-04 (cơ bản): Sinh món từ nguyên liệu các công thức trong kế hoạch.
    // Scale tuyến tính theo khẩu phần, gộp khi cùng nguyên liệu và cùng đơn vị.
    async taoTuKeHoachAn(userId: string, mealPlanId: string) {
        const plan = await this.prisma.mealPlan.findFirst({
            where: { id: mealPlanId, userId },
            include: {
                items: {
                    orderBy: { sortOrder: 'asc' },
                    include: { recipe: { include: { ingredients: { orderBy: { sortOrder: 'asc' } } } } },
                },
            },
        });
        if (!plan) {
            throw new NotFoundException({
                code: 'MEAL-04',
                message: '[MEAL-04] Không tìm thấy kế hoạch ăn',
            });
        }

        const gop = new Map<string, { internalIngredientId: string | null; originalText: string; quantity: number; unit: string }>();
        for (const item of plan.items) {
            if (!item.recipe) continue;
            const tyLe = item.recipe.servings > 0 ? item.servings / item.recipe.servings : 1;
            for (const nl of item.recipe.ingredients) {
                const dinhLuong = Number(nl.quantity) * tyLe;
                const khoa = `${nl.internalIngredientId ?? `text:${nl.originalText}`}|${nl.unit}`;
                const co = gop.get(khoa);
                if (co) co.quantity += dinhLuong;
                else gop.set(khoa, { internalIngredientId: nl.internalIngredientId, originalText: nl.originalText, quantity: dinhLuong, unit: nl.unit });
            }
        }

        const cacMon = [...gop.values()].map((g, i) => ({
            internalIngredientId: g.internalIngredientId,
            originalText: g.originalText,
            quantity: Math.round(g.quantity * 1000) / 1000,
            unit: g.unit,
            sortOrder: i,
        }));

        const list = await this.prisma.shoppingList.create({
            data: {
                userId,
                name: `Đi chợ - ${plan.name}`,
                sourceType: 'MEAL_PLAN',
                sourceId: plan.id,
                items: { create: cacMon },
            },
            include: { items: { orderBy: { sortOrder: 'asc' } } },
        });

        return this.toDanhSach(list);
    }

    private toDanhSach(s: {
        id: string;
        name: string;
        sourceType: string;
        sourceId: string | null;
        status: string;
        items: Array<{
            id: string;
            internalIngredientId: string | null;
            originalText: string;
            quantity: Prisma.Decimal;
            unit: string;
            isChecked: boolean;
            sortOrder: number;
        }>;
    }) {
        return {
            id: s.id,
            ten: s.name,
            loaiNguon: s.sourceType,
            nguonId: s.sourceId,
            trangThai: s.status,
            cacMon: s.items.map((i) => ({
                id: i.id,
                nguyenLieuId: i.internalIngredientId,
                tenGoc: i.originalText,
                dinhLuong: i.quantity.toString(),
                donVi: i.unit,
                daChon: i.isChecked,
                thuTu: i.sortOrder,
            })),
        };
    }
}
