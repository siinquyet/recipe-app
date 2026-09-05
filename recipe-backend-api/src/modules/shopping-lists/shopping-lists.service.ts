import { Injectable, NotFoundException } from '@nestjs/common';
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
            quantity: any;
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
