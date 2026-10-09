import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TaoBaoCaoDto, XuLyBaoCaoDto } from './bao-cao.dto';

// BR-SOC: Tố cáo bài viết/bình luận vi phạm, admin xử lý tập trung
@Injectable()
export class BaoCaoService {
    constructor(private readonly prisma: PrismaService) {}

    async taoMoi(userId: string, dto: TaoBaoCaoDto) {
        const mucTieu = [dto.recipeId, dto.recipeReferenceId, dto.commentId].filter(Boolean);
        if (mucTieu.length === 0) {
            throw new BadRequestException({
                code: 'REP-00',
                message: '[REP-00] Phải chỉ rõ bài viết hoặc bình luận bị tố cáo',
            });
        }
        // BR-SOC: Một tố cáo đúng một mục tiêu để admin biết xử lý cái nào
        if (mucTieu.length > 1) {
            throw new BadRequestException({
                code: 'REP-00',
                message: '[REP-00] Mỗi tố cáo chỉ nhắm một bài viết hoặc bình luận',
            });
        }
        // BR-SOC-10: Chặn FK rò 500, trả 404 khi id mục tiêu không tồn tại
        if (dto.recipeId) {
            const tonTai = await this.prisma.recipe.findFirst({
                where: { id: dto.recipeId, deletedAt: null },
                select: { id: true },
            });
            if (!tonTai) {
                throw new NotFoundException({ code: 'REC-04', message: '[REC-04] Không tìm thấy công thức' });
            }
        }
        if (dto.recipeReferenceId) {
            const tonTai = await this.prisma.recipeReference.findUnique({
                where: { id: dto.recipeReferenceId },
                select: { id: true },
            });
            if (!tonTai) {
                throw new NotFoundException({ code: 'REC-04', message: '[REC-04] Không tìm thấy món tham chiếu' });
            }
        }
        if (dto.commentId) {
            const tonTai = await this.prisma.comment.findFirst({
                where: { id: dto.commentId, deletedAt: null },
                select: { id: true },
            });
            if (!tonTai) {
                throw new NotFoundException({ code: 'CMT-04', message: '[CMT-04] Không tìm thấy bình luận' });
            }
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
        const TRANG_THAI_BAO_CAO = ['PENDING', 'RESOLVED', 'REJECTED'];
        if (trangThai && !TRANG_THAI_BAO_CAO.includes(trangThai)) {
            throw new BadRequestException({ code: 'ADM-00', message: '[ADM-00] Trạng thái lọc không hợp lệ' });
        }
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
        const cu = await this.prisma.report.findUnique({
            where: { id },
            select: { id: true, status: true, recipeId: true, commentId: true },
        });
        if (!cu) {
            throw new NotFoundException({ code: 'REP-04', message: '[REP-04] Không tìm thấy báo cáo' });
        }
        // BR-SOC: Xác nhận vi phạm thì xử luôn nội dung (ẩn bài/xóa mềm bình luận),
        // bác báo cáo thì chỉ đóng, không động vào nội dung, không set resolvedAt
        const hanhDong = dto.trangThai === 'RESOLVED' ? (dto.hanhDong ?? 'KHONG') : 'KHONG';
        if (hanhDong === 'AN_BAI' && !cu.recipeId) {
            throw new BadRequestException({ code: 'REP-00', message: '[REP-00] Tố cáo này không nhắm bài viết' });
        }
        if (hanhDong === 'XOA_BINH_LUAN' && !cu.commentId) {
            throw new BadRequestException({ code: 'REP-00', message: '[REP-00] Tố cáo này không nhắm bình luận' });
        }
        // BR-SOC-10: Gộp đổi trạng thái + ghi audit vào transaction để rollback khi lỗi
        await this.prisma.$transaction([
            this.prisma.report.update({
                where: { id },
                data: {
                    status: dto.trangThai,
                    adminNote: dto.ghiChu,
                    resolvedAt: dto.trangThai === 'RESOLVED' ? new Date() : null,
                },
            }),
            ...(hanhDong === 'AN_BAI' && cu.recipeId
                ? [this.prisma.recipe.update({ where: { id: cu.recipeId }, data: { status: 'HIDDEN' } })]
                : []),
            ...(hanhDong === 'XOA_BINH_LUAN' && cu.commentId
                ? [this.prisma.comment.update({ where: { id: cu.commentId }, data: { deletedAt: new Date() } })]
                : []),
            this.prisma.auditLog.create({
                data: {
                    userId: adminId,
                    action: 'RESOLVE_REPORT',
                    entityType: 'Report',
                    entityId: id,
                    oldData: { status: cu.status },
                    newData: { status: dto.trangThai, hanhDong },
                },
            }),
        ]);
        return { thanhCong: true };
    }
}
