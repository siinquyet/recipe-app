import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Prisma, RecipeStatus } from '@prisma/client';
import { kiemTraComboDoc, type CanhBao } from '@cook/shared';
import { CapNhatCongThucDto, TaoCongThucDto } from './dto/recipe.dto';

interface ListParams {
    trang: number;
    kichThuoc: number;
    tuKhoa?: string;
    tacGiaId?: string;
    nguoiXemId?: string;
}

@Injectable()
export class RecipesService {
    constructor(private readonly prisma: PrismaService) {}

    async layTuongTu(id: string) {
        const recipe = await this.prisma.recipe.findFirst({
            where: { id, deletedAt: null },
            select: { categoryId: true, tags: { select: { id: true } } },
        });

        if (!recipe) {
            return { noiDung: [], tongSoPhanTu: 0, tongSoTrang: 0 };
        }

        // BR-UREC: Ưu tiên cùng danh mục, mở rộng sang món chung tag khi thiếu
        const tagIds = recipe.tags.map((t) => t.id);
        const items = await this.prisma.recipe.findMany({
            where: {
                deletedAt: null,
                status: RecipeStatus.APPROVED,
                riengTu: false,
                id: { not: id },
                OR: [
                    { categoryId: recipe.categoryId },
                    ...(tagIds.length > 0 ? [{ tags: { some: { id: { in: tagIds } } } } ] : []),
                ],
            },
            take: 6,
            orderBy: { createdAt: 'desc' },
            include: { author: true },
        });

        return {
            noiDung: items.map((r) => this.toCongThuc(r, r.author)),
            tongSoPhanTu: items.length,
            tongSoTrang: 1,
        };
    }

    async layDanhSach(params: ListParams) {
        // BR-UREC: Chủ bài xem được nháp của mình; người khác chỉ thấy APPROVED
        const laChinhChu = params.tacGiaId !== undefined && params.tacGiaId === params.nguoiXemId;
        const where = {
            deletedAt: null,
            // BR-FORK: Bản riêng tư không lọt vào list của người khác
            ...(laChinhChu ? {} : { riengTu: false }),
            ...(laChinhChu ? {} : { status: RecipeStatus.APPROVED }),
            ...(params.tacGiaId ? { authorId: params.tacGiaId } : {}),
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

    async layTheoNguyenLieu(nguyenLieu: string, kichThuoc: number) {
        // BR-UREC: Tách chuỗi phẩy, món phải chứa ĐỦ mọi nguyên liệu trong văn bản gốc
        const ds = nguyenLieu
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
            .slice(0, 10);
        if (ds.length === 0) {
            return { noiDung: [], tongSoPhanTu: 0, tongSoTrang: 0 };
        }
        const where = {
            deletedAt: null,
            status: RecipeStatus.APPROVED,
            riengTu: false,
            AND: ds.map((ten) => ({ ingredients: { some: { originalText: { contains: ten } } } })),
        };
        const [items, tongSoPhanTu] = await Promise.all([
            this.prisma.recipe.findMany({
                where,
                take: kichThuoc,
                orderBy: { createdAt: 'desc' },
                include: { author: true },
            }),
            this.prisma.recipe.count({ where }),
        ]);
        return {
            noiDung: items.map((r) => this.toCongThuc(r, r.author)),
            tongSoPhanTu,
            tongSoTrang: Math.ceil(tongSoPhanTu / kichThuoc),
        };
    }

    async taoMoi(userId: string, dto: TaoCongThucDto) {
        // BR-UREC: Bài mới ở trạng thái DRAFT, chờ duyệt mới hiện công khai
        // BR-UREC: Validate danh mục tồn tại, lưu dinh dưỡng + tags gửi kèm
        if (dto.danhMucId) {
            const danhMuc = await this.prisma.category.findUnique({
                where: { id: dto.danhMucId },
                select: { id: true },
            });
            if (!danhMuc) {
                throw new BadRequestException({
                    code: 'REC-07',
                    message: '[REC-07] Danh mục không tồn tại',
                });
            }
        }
        // BR-UREC: tagIds phải tồn tại hết, tránh connect ma
        if (dto.tagIds && dto.tagIds.length > 0) {
            const dem = await this.prisma.tag.count({ where: { id: { in: dto.tagIds } } });
            if (dem !== new Set(dto.tagIds).size) {
                throw new BadRequestException({
                    code: 'REC-08',
                    message: '[REC-08] Có nhãn không tồn tại',
                });
            }
        }
        const recipe = await this.prisma.recipe.create({
            data: {
                title: dto.ten,
                description: dto.moTa,
                thumbnailUrl: dto.anhThumbnail,
                cookTimeMinutes: dto.thoiGianNauPhut,
                prepTimeMinutes: dto.thoiGianChuanBiPhut,
                servings: dto.khauPhan,
                authorId: userId,
                status: RecipeStatus.DRAFT,
                categoryId: dto.danhMucId,
                tags: dto.tagIds ? { connect: dto.tagIds.map((id) => ({ id })) } : undefined,
                nutrition: dto.dinhDuong
                    ? {
                          create: {
                              calories: dto.dinhDuong.calo,
                              protein: dto.dinhDuong.protein,
                              carbs: dto.dinhDuong.carb,
                              fat: dto.dinhDuong.chatBeo,
                          },
                      }
                    : undefined,
                ingredients: {
                    create: dto.nguyenLieu.map((nl, i) => ({
                        originalText: nl.ten,
                        quantity: nl.dinhLuong,
                        unit: nl.donVi,
                        sortOrder: i + 1,
                    })),
                },
                steps: {
                    create: dto.cacBuoc.map((b, i) => ({
                        stepOrder: i + 1,
                        content: b.noiDung,
                    })),
                },
            },
            include: {
                author: true,
                ingredients: { orderBy: { sortOrder: 'asc' } },
                steps: { orderBy: { stepOrder: 'asc' } },
                nutrition: true,
            },
        });
        return this.toCongThuc(recipe, recipe.author, {
            ingredients: recipe.ingredients,
            steps: recipe.steps,
            nutrition: recipe.nutrition,
        });
    }

    async capNhat(id: string, userId: string, dto: CapNhatCongThucDto) {
        const cu = await this.prisma.recipe.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, authorId: true, status: true },
        });
        if (!cu) {
            throw new NotFoundException({ code: 'REC-04', message: '[REC-04] Không tìm thấy công thức' });
        }
        if (cu.authorId !== userId) {
            throw new ForbiddenException({ code: 'REC-05', message: '[REC-05] Chỉ tác giả được sửa công thức' });
        }
        // BR-UREC: Thay nguyên liệu/bước bằng bộ mới khi có gửi kèm
        // BR-UREC: Sửa bài đã duyệt phải duyệt lại — rớt về PENDING
        await this.prisma.$transaction(async (tx) => {
            await tx.recipe.update({
                where: { id },
                data: {
                    ...(dto.ten !== undefined ? { title: dto.ten } : {}),
                    ...(dto.moTa !== undefined ? { description: dto.moTa } : {}),
                    ...(dto.anhThumbnail !== undefined ? { thumbnailUrl: dto.anhThumbnail } : {}),
                    ...(dto.thoiGianNauPhut !== undefined ? { cookTimeMinutes: dto.thoiGianNauPhut } : {}),
                    ...(dto.thoiGianChuanBiPhut !== undefined ? { prepTimeMinutes: dto.thoiGianChuanBiPhut } : {}),
                    ...(dto.khauPhan !== undefined ? { servings: dto.khauPhan } : {}),
                    ...(cu.status === RecipeStatus.APPROVED ? { status: RecipeStatus.PENDING, rejectionReason: null } : {}),
                },
            });
            if (dto.nguyenLieu) {
                await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
                await tx.recipeIngredient.createMany({
                    data: dto.nguyenLieu.map((nl, i) => ({
                        recipeId: id,
                        originalText: nl.ten,
                        quantity: nl.dinhLuong,
                        unit: nl.donVi,
                        sortOrder: i + 1,
                    })),
                });
            }
            if (dto.cacBuoc) {
                await tx.recipeStep.deleteMany({ where: { recipeId: id } });
                await tx.recipeStep.createMany({
                    data: dto.cacBuoc.map((b, i) => ({ recipeId: id, stepOrder: i + 1, content: b.noiDung })),
                });
            }
        });
        return this.layChiTiet(id, userId);
    }

    async xoa(id: string, userId: string) {
        const cu = await this.prisma.recipe.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, authorId: true },
        });
        if (!cu) {
            throw new NotFoundException({ code: 'REC-04', message: '[REC-04] Không tìm thấy công thức' });
        }
        if (cu.authorId !== userId) {
            throw new ForbiddenException({ code: 'REC-05', message: '[REC-05] Chỉ tác giả được xóa công thức' });
        }
        // BR-UREC: Xóa mềm để giữ bình luận, đánh giá và lịch sử liên quan
        await this.prisma.recipe.update({ where: { id }, data: { deletedAt: new Date() } });
        return { thanhCong: true };
    }

    async guiDuyet(id: string, userId: string) {
        const cu = await this.prisma.recipe.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, authorId: true, status: true },
        });
        if (!cu) {
            throw new NotFoundException({ code: 'REC-04', message: '[REC-04] Không tìm thấy công thức' });
        }
        if (cu.authorId !== userId) {
            throw new ForbiddenException({ code: 'REC-05', message: '[REC-05] Chỉ tác giả được gửi duyệt' });
        }
        if (cu.status !== 'DRAFT' && cu.status !== 'REJECTED' && cu.status !== 'APPROVED') {
            throw new BadRequestException({
                code: 'REC-06',
                message: '[REC-06] Chỉ gửi duyệt được bài nháp, bị từ chối hoặc đã duyệt',
            });
        }
        // BR-UREC: Gửi duyệt chuyển về PENDING và xóa lý do từ chối cũ
        await this.prisma.recipe.update({
            where: { id },
            data: { status: 'PENDING', rejectionReason: null },
        });
        return this.layChiTiet(id, userId);
    }

    async rutLai(id: string, userId: string) {
        // BR-UREC: Rút bài đang chờ về nháp để sửa tiếp
        const cu = await this.prisma.recipe.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, authorId: true, status: true },
        });
        if (!cu) {
            throw new NotFoundException({ code: 'REC-04', message: '[REC-04] Không tìm thấy công thức' });
        }
        if (cu.authorId !== userId) {
            throw new ForbiddenException({ code: 'REC-05', message: '[REC-05] Chỉ tác giả được rút bài' });
        }
        if (cu.status !== 'PENDING') {
            throw new BadRequestException({
                code: 'REC-06',
                message: '[REC-06] Chỉ rút được bài đang chờ duyệt',
            });
        }
        await this.prisma.recipe.update({ where: { id }, data: { status: 'DRAFT' } });
        return this.layChiTiet(id, userId);
    }

    async forkCongThuc(userId: string, gocId: string) {
        // BR-FORK: Copy món cộng đồng thành bản riêng tư — món gốc không đổi, không vào hàng chờ duyệt
        const goc = await this.prisma.recipe.findFirst({
            where: { id: gocId, deletedAt: null, status: 'APPROVED', riengTu: false },
            include: { ingredients: { orderBy: { sortOrder: 'asc' } }, steps: { orderBy: { stepOrder: 'asc' } } },
        });
        if (!goc) {
            throw new NotFoundException({ code: 'REC-04', message: '[REC-04] Chỉ fork được món cộng đồng đã duyệt' });
        }
        const daCo = await this.prisma.recipe.findFirst({
            where: { nguonGocId: gocId, authorId: userId, riengTu: true, deletedAt: null },
            include: {
                author: true,
                ingredients: { orderBy: { sortOrder: 'asc' } },
                steps: { orderBy: { stepOrder: 'asc' } },
                nutrition: true,
            },
        });
        if (daCo) {
            return this.toCongThuc(daCo, daCo.author, {
                ingredients: daCo.ingredients,
                steps: daCo.steps,
                nutrition: daCo.nutrition,
            });
        }
        const banFork = await this.prisma.recipe.create({
            data: {
                title: goc.title,
                description: goc.description,
                thumbnailUrl: goc.thumbnailUrl,
                cookTimeMinutes: goc.cookTimeMinutes,
                prepTimeMinutes: goc.prepTimeMinutes,
                servings: goc.servings,
                authorId: userId,
                status: RecipeStatus.DRAFT,
                riengTu: true,
                nguonGocId: goc.id,
                ingredients: {
                    create: goc.ingredients.map((nl) => ({
                        originalText: nl.originalText,
                        quantity: nl.quantity,
                        unit: nl.unit,
                        sortOrder: nl.sortOrder,
                    })),
                },
                steps: {
                    create: goc.steps.map((b) => ({ stepOrder: b.stepOrder, content: b.content })),
                },
            },
            include: {
                author: true,
                ingredients: { orderBy: { sortOrder: 'asc' } },
                steps: { orderBy: { stepOrder: 'asc' } },
                nutrition: true,
            },
        });
        return this.toCongThuc(banFork, banFork.author, {
            ingredients: banFork.ingredients,
            steps: banFork.steps,
            nutrition: banFork.nutrition,
        });
    }

    async layBanCaNhan(userId: string, gocId: string) {
        // BR-FORK: Bản riêng tư chỉ chủ thấy — người khác nhận null
        const banFork = await this.prisma.recipe.findFirst({
            where: { nguonGocId: gocId, authorId: userId, riengTu: true, deletedAt: null },
            include: {
                author: true,
                ingredients: { orderBy: { sortOrder: 'asc' } },
                steps: { orderBy: { stepOrder: 'asc' } },
                nutrition: true,
            },
        });
        if (!banFork) {
            return null;
        }
        return this.toCongThuc(banFork, banFork.author, {
            ingredients: banFork.ingredients,
            steps: banFork.steps,
            nutrition: banFork.nutrition,
        });
    }

    async layChiTiet(id: string, nguoiXemId?: string) {
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

        // BR-FORK: Bản riêng tư chỉ chủ mở được — kể cả admin cũng 404
        if (recipe.riengTu && recipe.authorId !== nguoiXemId) {
            throw new NotFoundException({
                code: 'REC-04',
                message: '[REC-04] Không tìm thấy công thức',
            });
        }

        // BR-UREC: Bài chưa duyệt chỉ chủ bài và admin được xem
        if (recipe.status !== 'APPROVED' && recipe.authorId !== nguoiXemId) {
            const coQuyen = nguoiXemId
                ? await this.prisma.user.findFirst({
                      where: { id: nguoiXemId, role: 'ADMIN', status: 'ACTIVE' },
                      select: { id: true },
                  })
                : null;
            if (!coQuyen) {
                throw new NotFoundException({
                    code: 'REC-04',
                    message: '[REC-04] Không tìm thấy công thức',
                });
            }
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
        extra?: {
            ingredients?: Array<{ originalText: string; quantity: Prisma.Decimal; unit: string }>;
            steps?: Array<{ stepOrder: number; content: string; imageUrl: string | null }>;
            nutrition?: { calories: number; protein: Prisma.Decimal; carbs: Prisma.Decimal; fat: Prisma.Decimal } | null;
        },
    ) {
        // BR-ANTOAN: Gắn cảnh báo combo độc theo nguyên liệu — client hiện banner, không chặn đăng
        const canhBao: CanhBao[] = extra?.ingredients
            ? kiemTraComboDoc(extra.ingredients.map((i) => i.originalText))
            : [];
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
            canhBao,
            ngayTao: recipe.createdAt.toISOString(),
            ngayCapNhat: recipe.updatedAt.toISOString(),
        };
    }
}
