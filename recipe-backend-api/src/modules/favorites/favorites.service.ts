import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class FavoritesService {
    constructor(private readonly prisma: PrismaService) {}

    async themYeuThich(userId: string, recipeId: string) {
        // BR-SOC: Chỉ thích được bài đã duyệt công khai
        const recipe = await this.prisma.recipe.findFirst({
            where: { id: recipeId, deletedAt: null, status: 'APPROVED' },
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

        try {
            await this.prisma.favorite.create({
                data: { userId, recipeId },
            });
        } catch (e) {
            // BR-SOC: Bấm thích 2 lần cùng lúc — unique DB thắng, coi như đã thích
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                return { daThem: true };
            }
            throw e;
        }

        return { daThem: true };
    }

    async xoaYeuThich(userId: string, recipeId: string) {
        const xoa = await this.prisma.favorite.deleteMany({
            where: { userId, recipeId },
        });
        // BR-SOC-01: Báo đúng khi chưa từng thích thay vì luôn daXoa:true
        if (xoa.count === 0) {
            throw new NotFoundException({
                code: 'FAV-02',
                message: '[FAV-02] Chưa yêu thích công thức này',
            });
        }
        return { daXoa: true };
    }

    // BR-SOC: Danh sách công thức đã yêu thích của người dùng, mới nhất trước
    async layDanhSachYeuThich(userId: string, trang: number, kichThuoc: number) {
        // BR-UREC: Bài bị ẩn/từ chối rớt khỏi danh sách yêu thích công khai
        const locBai = { deletedAt: null, status: 'APPROVED' } as const;
        const [items, tongSoPhanTu] = await Promise.all([
            this.prisma.favorite.findMany({
                where: { user: { id: userId }, recipe: { ...locBai } },
                skip: trang * kichThuoc,
                take: kichThuoc,
                orderBy: { createdAt: 'desc' },
                include: { recipe: { include: { author: true } } },
            }),
            this.prisma.favorite.count({
                where: { user: { id: userId }, recipe: { ...locBai } },
            }),
        ]);

        const noiDung = [];
        for (const f of items) {
            if (f.recipe) noiDung.push(this.toCongThuc(f.recipe, f.recipe.author));
        }

        return {
            noiDung,
            tongSoPhanTu,
            tongSoTrang: Math.ceil(tongSoPhanTu / kichThuoc),
        };
    }

    // BR-SOC: Map công thức về đúng shape mobile (khớp RecipesService.toCongThuc)
    private toCongThuc(
        recipe: {
            id: string;
            title: string;
            description: string | null;
            thumbnailUrl: string | null;
            cookTimeMinutes: number;
            prepTimeMinutes: number | null;
            servings: number;
            status: string;
            createdAt: Date;
            updatedAt: Date;
        },
        author: {
            id: string;
            email: string;
            displayName: string;
            avatarUrl: string | null;
            role: string;
            status: string;
        },
    ) {
        return {
            id: recipe.id,
            ten: recipe.title,
            moTa: recipe.description,
            anhThumbnail: recipe.thumbnailUrl,
            thoiGianNauPhut: recipe.cookTimeMinutes,
            thoiGianChuanBiPhut: recipe.prepTimeMinutes,
            khauPhan: recipe.servings,
            trangThai: recipe.status,
            tacGia: {
                id: author.id,
                email: author.email,
                tenHienThi: author.displayName,
                anhDaiDien: author.avatarUrl,
                vaiTro: author.role,
                trangThai: author.status,
            },
            nguyenLieu: [],
            cacBuoc: [],
            dinhDuong: null,
            ngayTao: recipe.createdAt.toISOString(),
            ngayCapNhat: recipe.updatedAt.toISOString(),
        };
    }
}
