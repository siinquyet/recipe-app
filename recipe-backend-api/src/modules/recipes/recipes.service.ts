import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { RecipeStatus } from '@prisma/client';

interface ListParams {
    trang: number;
    kichThuoc: number;
    tuKhoa?: string;
}

@Injectable()
export class RecipesService {
    constructor(private readonly prisma: PrismaService) {}

    async layDanhSach(params: ListParams) {
        const where = {
            deletedAt: null,
            status: RecipeStatus.APPROVED,
            ...(params.tuKhoa
                ? {
                      title: {
                          contains: params.tuKhoa,
                      },
                  }
                : {}),
        };

        const [items, tongSoPhanTu] = await Promise.all([
            this.prisma.recipe.findMany({
                where,
                skip: params.trang * params.kichThuoc,
                take: params.kichThuoc,
                orderBy: { createdAt: 'desc' },
                include: { author: true },
            }),
            this.prisma.recipe.count({ where }),
        ]);

        const tongSoTrang = Math.ceil(tongSoPhanTu / params.kichThuoc);

        return {
            noiDung: items.map((r) => this.toCongThuc(r, r.author)),
            tongSoPhanTu,
            tongSoTrang,
        };
    }

    async layChiTiet(id: string) {
        const recipe = await this.prisma.recipe.findFirst({
            where: { id, deletedAt: null },
            include: {
                author: true,
                ingredients: { orderBy: { sortOrder: 'asc' } },
                steps: { orderBy: { stepOrder: 'asc' } },
                nutrition: true,
            },
        });

        if (!recipe) {
            throw new NotFoundException({
                code: 'REC-04',
                message: '[REC-04] Không tìm thấy công thức',
            });
        }

        return this.toCongThuc(recipe, recipe.author, {
            ingredients: recipe.ingredients,
            steps: recipe.steps,
            nutrition: recipe.nutrition,
        });
    }

    private toCongThuc(
        recipe: {
            id: string;
            title: string;
            description: string | null;
            thumbnailUrl: string | null;
            cookTimeMinutes: number;
            prepTimeMinutes: number | null;
            servings: number;
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
        extra?: {
            ingredients?: Array<{ originalText: string; quantity: any; unit: string }>;
            steps?: Array<{ stepOrder: number; content: string; imageUrl: string | null }>;
            nutrition?: { calories: number; protein: any; carbs: any; fat: any } | null;
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
            tacGia: {
                id: author.id,
                email: author.email,
                tenHienThi: author.displayName,
                anhDaiDien: author.avatarUrl,
                vaiTro: author.role,
                trangThai: author.status,
            },
            nguyenLieu:
                extra?.ingredients?.map((i) => ({
                    ten: i.originalText,
                    dinhLuong: i.quantity.toString(),
                    donVi: i.unit,
                })) ?? [],
            cacBuoc:
                extra?.steps?.map((s) => ({
                    thuTu: s.stepOrder,
                    noiDung: s.content,
                    anhBuoc: s.imageUrl,
                })) ?? [],
            dinhDuong: extra?.nutrition
                ? {
                      calo: extra.nutrition.calories,
                      protein: extra.nutrition.protein.toString(),
                      carb: extra.nutrition.carbs.toString(),
                      chatBeo: extra.nutrition.fat.toString(),
                  }
                : null,
            ngayTao: recipe.createdAt.toISOString(),
            ngayCapNhat: recipe.updatedAt.toISOString(),
        };
    }
}
