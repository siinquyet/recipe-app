import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TaoBinhLuanDto } from './dto/comment.dto';

@Injectable()
export class CommentsService {
    constructor(private readonly prisma: PrismaService) {}

    async layDanhSach(recipeId: string, trang: number, kichThuoc: number, nguoiXemId?: string) {
        // BR-UREC: Ẩn luôn bình luận của bài chưa duyệt với người ngoài
        await this.kiemTraDuocXem(recipeId, nguoiXemId);
        const where = { recipeId, parentId: null, deletedAt: null };
        const [items, tongSoPhanTu] = await Promise.all([
            this.prisma.comment.findMany({
                where,
                skip: trang * kichThuoc,
                take: kichThuoc,
                orderBy: { createdAt: 'desc' },
                include: { user: true, replies: true },
            }),
            this.prisma.comment.count({ where }),
        ]);

        const tongSoTrang = Math.ceil(tongSoPhanTu / kichThuoc);

        return {
            noiDung: items.map((c) => this.toBinhLuan(c)),
            tongSoPhanTu,
            tongSoTrang,
        };
    }

    async taoMoi(userId: string, recipeId: string, dto: TaoBinhLuanDto) {
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
        // BR-UREC: Chỉ bình luận được bài công khai
        if (recipe.status !== 'APPROVED' && recipe.authorId !== userId) {
            throw new NotFoundException({
                code: 'REC-04',
                message: '[REC-04] Không tìm thấy công thức',
            });
        }

        // BR-SOC: chaId phải là bình luận gốc cùng công thức, chống reply nhầm bài
        if (dto.chaId) {
            const cha = await this.prisma.comment.findFirst({
                where: { id: dto.chaId, recipeId, parentId: null, deletedAt: null },
                select: { id: true },
            });
            if (!cha) {
                throw new NotFoundException({
                    code: 'CMT-04',
                    message: '[CMT-04] Không tìm thấy bình luận gốc trong công thức này',
                });
            }
        }

        const comment = await this.prisma.comment.create({
            data: {
                userId,
                recipeId,
                content: dto.noiDung,
                parentId: dto.chaId,
            },
            include: { user: true, replies: true },
        });

        return this.toBinhLuan(comment);
    }

    async layPhanHoi(recipeId: string, id: string, nguoiXemId?: string) {
        // BR-SOC: Danh sách reply chi tiết của một bình luận gốc
        await this.kiemTraDuocXem(recipeId, nguoiXemId);
        const goc = await this.prisma.comment.findFirst({
            where: { id, recipeId, parentId: null, deletedAt: null },
            select: { id: true },
        });
        if (!goc) {
            throw new NotFoundException({
                code: 'CMT-04',
                message: '[CMT-04] Không tìm thấy bình luận',
            });
        }
        const items = await this.prisma.comment.findMany({
            where: { parentId: id, deletedAt: null },
            orderBy: { createdAt: 'asc' },
            include: { user: true, replies: true },
        });
        return {
            noiDung: items.map((c) => this.toBinhLuan(c)),
            tongSoPhanTu: items.length,
            tongSoTrang: 1,
        };
    }

    async capNhat(userId: string, recipeId: string, id: string, dto: TaoBinhLuanDto) {
        // BR-SOC: Món đã xóa thì đóng băng toàn bộ — đọc đã 404 nên ghi cũng chặn
        const mon = await this.prisma.recipe.findFirst({
            where: { id: recipeId, deletedAt: null },
            select: { id: true },
        });
        if (!mon) {
            throw new NotFoundException({
                code: 'REC-04',
                message: '[REC-04] Không tìm thấy công thức',
            });
        }
        const cu = await this.prisma.comment.findFirst({
            where: { id, recipeId, deletedAt: null },
            select: { id: true, userId: true },
        });
        if (!cu) {
            throw new NotFoundException({
                code: 'CMT-04',
                message: '[CMT-04] Không tìm thấy bình luận',
            });
        }
        if (cu.userId !== userId) {
            throw new NotFoundException({
                code: 'CMT-05',
                message: '[CMT-05] Chỉ tác giả được sửa bình luận',
            });
        }
        const comment = await this.prisma.comment.update({
            where: { id },
            data: { content: dto.noiDung },
            include: { user: true, replies: true },
        });
        return this.toBinhLuan(comment);
    }

    async xoa(userId: string, recipeId: string, id: string) {
        // BR-SOC: Món đã xóa thì đóng băng toàn bộ — đọc đã 404 nên ghi cũng chặn
        const mon = await this.prisma.recipe.findFirst({
            where: { id: recipeId, deletedAt: null },
            select: { id: true },
        });
        if (!mon) {
            throw new NotFoundException({
                code: 'REC-04',
                message: '[REC-04] Không tìm thấy công thức',
            });
        }
        const cu = await this.prisma.comment.findFirst({
            where: { id, recipeId, deletedAt: null },
            select: { id: true, userId: true },
        });
        if (!cu) {
            throw new NotFoundException({
                code: 'CMT-04',
                message: '[CMT-04] Không tìm thấy bình luận',
            });
        }
        if (cu.userId !== userId) {
            throw new NotFoundException({
                code: 'CMT-05',
                message: '[CMT-05] Chỉ tác giả được xóa bình luận',
            });
        }
        // BR-SOC: Xóa mềm để giữ mạch hội thoại (reply vẫn còn cha)
        await this.prisma.comment.update({ where: { id }, data: { deletedAt: new Date() } });
        return { thanhCong: true };
    }

    private async kiemTraDuocXem(recipeId: string, nguoiXemId?: string) {
        const recipe = await this.prisma.recipe.findFirst({
            where: { id: recipeId, deletedAt: null },
            select: { authorId: true, status: true },
        });
        if (!recipe) {
            throw new NotFoundException({
                code: 'REC-04',
                message: '[REC-04] Không tìm thấy công thức',
            });
        }
        if (recipe.status === 'APPROVED' || recipe.authorId === nguoiXemId) return;
        const admin = nguoiXemId
            ? await this.prisma.user.findFirst({
                  where: { id: nguoiXemId, role: 'ADMIN', status: 'ACTIVE' },
                  select: { id: true },
              })
            : null;
        if (!admin) {
            throw new NotFoundException({
                code: 'REC-04',
                message: '[REC-04] Không tìm thấy công thức',
            });
        }
    }

    private toBinhLuan(c: {
        id: string;
        content: string;
        createdAt: Date;
        user: {
            id: string;
            email: string;
            displayName: string;
            avatarUrl: string | null;
            role: string;
            status: string;
        };
        replies: Array<{ id: string }>;
    }) {
        return {
            id: c.id,
            noiDung: c.content,
            tacGia: {
                id: c.user.id,
                email: c.user.email,
                tenHienThi: c.user.displayName,
                anhDaiDien: c.user.avatarUrl,
                vaiTro: c.user.role,
                trangThai: c.user.status,
            },
            thoiGianTao: c.createdAt.toISOString(),
            soLuongPhanHoi: c.replies.length,
        };
    }
}
