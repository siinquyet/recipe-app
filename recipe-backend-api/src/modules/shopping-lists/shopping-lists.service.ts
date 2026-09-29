import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ShoppingListStatus } from '@prisma/client';
import { aggregateQuantities, generateShoppingItems, scaleQuantity, type ScaledItem } from '@cook/shared';
import { PrismaService } from '../../common/prisma.service';
import { MonMoiDto, SuaMonDiChoDto, TaoDanhSachDiChoDto } from './dto/shopping-list.dto';

@Injectable()
export class ShoppingListsService {
    constructor(private readonly prisma: PrismaService) {}

    async layDanhSachCuaNguoiDung(userId: string, trang: number, kichThuoc: number) {
        // BR-SHOP: Mỗi tài khoản chỉ thấy danh sách của mình, ẩn mục đã archive
        const where = { userId, status: { not: ShoppingListStatus.ARCHIVED } };
        const [items, tongSoPhanTu] = await Promise.all([
            this.prisma.shoppingList.findMany({
                where,
                skip: trang * kichThuoc,
                take: kichThuoc,
                orderBy: { createdAt: 'desc' },
                include: { items: { orderBy: { sortOrder: 'asc' } } },
            }),
            this.prisma.shoppingList.count({ where }),
        ]);

        const tongSoTrang = Math.ceil(tongSoPhanTu / kichThuoc);

        return {
            noiDung: items.map((s) => this.toDanhSach(s)),
            tongSoPhanTu,
            tongSoTrang,
        };
    }

    async taoMoi(userId: string, dto: TaoDanhSachDiChoDto) {
        // BR-SHOP: Cho tạo kèm món để mobile đỡ tốn thêm request
        const list = await this.prisma.shoppingList.create({
            data: {
                userId,
                name: dto.ten,
                sourceType: dto.loaiNguon,
                sourceId: dto.nguonId,
                items: dto.cacMon
                    ? {
                          create: dto.cacMon.map((mon, i) => ({
                              internalIngredientId: mon.nguyenLieuId,
                              originalText: mon.tenGoc,
                              quantity: mon.dinhLuong,
                              unit: mon.donVi,
                              sortOrder: i,
                          })),
                      }
                    : undefined,
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

    async xoa(id: string, userId: string) {
        // BR-SHOP: Xóa mềm (ARCHIVED) để giữ lịch sử đi chợ
        const list = await this.prisma.shoppingList.findFirst({
            where: { id, userId },
            select: { id: true },
        });
        if (!list) {
            throw new NotFoundException({
                code: 'SHOP-04',
                message: '[SHOP-04] Không tìm thấy danh sách đi chợ',
            });
        }
        await this.prisma.shoppingList.update({
            where: { id },
            data: { status: 'ARCHIVED' },
        });
        return { thanhCong: true };
    }

    // BR-SHOP: Đánh dấu đã mua/bỏ chọn — chỉ chủ sở hữu được đổi
    async capNhatTrangThaiMon(listId: string, itemId: string, userId: string, daChon: boolean) {
        return this.suaMon(listId, itemId, userId, { daChon });
    }

    async themMon(listId: string, userId: string, dto: MonMoiDto) {
        await this.layCuaNguoiDung(listId, userId);
        const soThuTu = await this.prisma.shoppingListItem.count({ where: { shoppingListId: listId } });
        await this.prisma.shoppingListItem.create({
            data: {
                shoppingListId: listId,
                internalIngredientId: dto.nguyenLieuId,
                originalText: dto.tenGoc,
                quantity: dto.dinhLuong,
                unit: dto.donVi,
                sortOrder: soThuTu,
            },
        });
        return this.layChiTiet(listId, userId);
    }

    async suaMon(listId: string, itemId: string, userId: string, dto: SuaMonDiChoDto) {
        await this.layCuaNguoiDung(listId, userId);
        const item = await this.prisma.shoppingListItem.updateMany({
            where: { id: itemId, shoppingListId: listId },
            data: {
                ...(dto.tenGoc !== undefined ? { originalText: dto.tenGoc } : {}),
                ...(dto.dinhLuong !== undefined ? { quantity: dto.dinhLuong } : {}),
                ...(dto.donVi !== undefined ? { unit: dto.donVi } : {}),
                ...(dto.daChon !== undefined ? { isChecked: dto.daChon } : {}),
            },
        });
        if (item.count === 0) {
            throw new NotFoundException({
                code: 'SHOP-05',
                message: '[SHOP-05] Không tìm thấy món trong danh sách',
            });
        }
        return this.layChiTiet(listId, userId);
    }

    async xoaMon(listId: string, itemId: string, userId: string) {
        await this.layCuaNguoiDung(listId, userId);
        const xoa = await this.prisma.shoppingListItem.deleteMany({
            where: { id: itemId, shoppingListId: listId },
        });
        if (xoa.count === 0) {
            throw new NotFoundException({
                code: 'SHOP-05',
                message: '[SHOP-05] Không tìm thấy món trong danh sách',
            });
        }
        return this.layChiTiet(listId, userId);
    }

    private async layCuaNguoiDung(listId: string, userId: string) {
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
        return list;
    }

    // BR-SHOP + BR-03/BR-04: Sinh món từ kế hoạch — scale từng món rồi gộp qua @cook/shared.
    // 500g + 1kg cùng nguyên liệu gộp thành 1500g thay vì 2 dòng.
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

        const daScale: ScaledItem[] = [];
        for (const item of plan.items) {
            if (!item.recipe) continue;
            for (const nl of item.recipe.ingredients) {
                const kq = scaleQuantity(Number(nl.quantity), item.recipe.servings, item.servings);
                daScale.push({
                    internalIngredientId: nl.internalIngredientId ?? undefined,
                    originalText: nl.originalText,
                    quantity: kq.quantity,
                    unit: nl.unit,
                });
            }
        }
        const cacMon = this.thanhMonLuu(aggregateQuantities(daScale));

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

    // BR-SHOP: Sinh danh sách đi chợ từ 1 công thức (mobile nút "Thêm hết vào giỏ")
    async taoTuCongThuc(userId: string, congThucId: string, khauPhan?: number) {
        const recipe = await this.prisma.recipe.findFirst({
            where: { id: congThucId, deletedAt: null, status: 'APPROVED' },
            include: { ingredients: { orderBy: { sortOrder: 'asc' } } },
        });
        if (!recipe) {
            throw new NotFoundException({
                code: 'REC-04',
                message: '[REC-04] Chỉ tạo được từ món đã duyệt',
            });
        }
        const gop = generateShoppingItems(
            recipe.ingredients.map((nl) => ({
                internalIngredientId: nl.internalIngredientId ?? undefined,
                originalText: nl.originalText,
                quantity: Number(nl.quantity),
                unit: nl.unit,
            })),
            recipe.servings,
            khauPhan ?? recipe.servings,
        );
        const cacMon = this.thanhMonLuu(gop);

        const list = await this.prisma.shoppingList.create({
            data: {
                userId,
                name: `Đi chợ - ${recipe.title}`,
                sourceType: 'RECIPE',
                sourceId: recipe.id,
                items: { create: cacMon },
            },
            include: { items: { orderBy: { sortOrder: 'asc' } } },
        });

        return this.toDanhSach(list);
    }

    private thanhMonLuu(gop: Map<string, { quantity: number; unit: string; originalTexts: string[] }>) {
        // BR-03: Key gộp là internalId (hoặc unmapped_<text>, hoặc <id>_<unit> khi khác đơn vị
        // không quy đổi được) — tách lại id để lưu DB (UUID không chứa gạch dưới)
        return [...gop.entries()].map(([khoa, nhom], i) => {
            let internalIngredientId: string | null = null;
            if (!khoa.startsWith('unmapped_')) {
                const cat = khoa.lastIndexOf('_');
                internalIngredientId = cat > 0 ? khoa.slice(0, cat) : khoa;
            }
            return {
                internalIngredientId,
                originalText: nhom.originalTexts[0],
                quantity: Math.round(nhom.quantity * 1000) / 1000,
                unit: nhom.unit,
                sortOrder: i,
            };
        });
    }

    private toDanhSach(s: {
        id: string;
        name: string;
        sourceType: string;
        sourceId: string | null;
        status: ShoppingListStatus;
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
