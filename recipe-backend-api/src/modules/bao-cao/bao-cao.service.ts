import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TaoBaoCaoDto, XuLyBaoCaoDto } from './bao-cao.dto';

// BR-SOC: Tố cáo bài viết/bình luận vi phạm, admin xử lý tập trung
@Injectable()
export class BaoCaoService {
    constructor(private readonly prisma: PrismaService) {}

    async taoMoi(userId: string, dto: TaoBaoCaoDto) {
        if (!dto.recipeId && !dto.recipeReferenceId && !dto.commentId) {
            throw new BadRequestException({
                code: 'REP-00',
                message: '[REP-00] Phải chỉ rõ bài viết hoặc bình luận bị tố cáo',
            });
        }
        const baoCao = await this.prisma.report.create({
            data: {
                userId,
                recipeId: dto.recipeId,
                recipeReferenceId: dto.recipeReferenceId,
                commentId: dto.commentId,
                reason: dto.reason,
            },
        });
        return { id: baoCao.id, thanhCong: true };
    }

    async layDanhSach(trang: number, kichThuoc: number, trangThai?: string) {
        const where = trangThai ? { status: trangThai } : {};
        const [items, tongSoPhanTu] = await Promise.all([
            this.prisma.report.findMany({
                where,
                skip: trang * kichThuoc,
                take: kichThuoc,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, email: true, displayName: true } },
                    recipe: { select: { id: true, title: true } },
                    comment: { select: { id: true, content: true } },
                },
            }),
            this.prisma.report.count({ where }),
        ]);
        return {
            noiDung: items.map((r) => ({
                id: r.id,
                lyDo: r.reason,
                trangThai: r.status,
                ghiChuAdmin: r.adminNote,
                nguoiBaoCao: { id: r.user.id, email: r.user.email, tenHienThi: r.user.displayName },
                congThuc: r.recipe ? { id: r.recipe.id, ten: r.recipe.title } : null,
                binhLuan: r.comment ? { id: r.comment.id, noiDung: r.comment.content } : null,
                ngayTao: r.createdAt.toISOString(),
            })),
            tongSoPhanTu,
            tongSoTrang: Math.ceil(tongSoPhanTu / kichThuoc),
        };
    }

    async xuLy(adminId: string, id: string, dto: XuLyBaoCaoDto) {
        const cu = await this.prisma.report.findUnique({ where: { id }, select: { id: true, status: true } });
        if (!cu) {
            throw new NotFoundException({ code: 'REP-04', message: '[REP-04] Không tìm thấy báo cáo' });
        }
        await this.prisma.report.update({
            where: { id },
            data: { status: dto.trangThai, adminNote: dto.ghiChu, resolvedAt: new Date() },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: adminId,
                action: 'RESOLVE_REPORT',
                entityType: 'Report',
                entityId: id,
                oldData: { status: cu.status },
                newData: { status: dto.trangThai },
            },
        });
        return { thanhCong: true };
    }
}
