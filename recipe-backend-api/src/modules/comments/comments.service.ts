import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TaoBinhLuanDto } from './dto/comment.dto';

@Injectable()
export class CommentsService {
    constructor(private readonly prisma: PrismaService) {}

    async layDanhSach(recipeId: string, trang: number, kichThuoc: number) {
        const where = { recipeId, parentId: null };
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
            select: { id: true },
        });
        if (!recipe) {
            throw new NotFoundException({
                code: 'REC-04',
                message: '[REC-04] Không tìm thấy công thức',
            });
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
