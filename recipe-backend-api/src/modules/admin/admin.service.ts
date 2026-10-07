import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RecipeStatus } from '@prisma/client';
import { kiemTraComboDoc } from '@cook/shared';
import { PrismaService } from '../../common/prisma.service';
import { TuChoiBaiDto } from './dto/admin.dto';
import { chamDiemBai, CHE_DO_TU_DONG } from '../kiem-duyet/kiem-duyet.service';
import { KiemDuyetService } from '../kiem-duyet/kiem-duyet.service';

const TRANG_THAI_HOP_LE: RecipeStatus[] = ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'HIDDEN'];

@Injectable()
export class AdminService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly kiemDuyet: KiemDuyetService,
    ) {}

    async layNguoiDung(trang: number, kichThuoc: number, tuKhoa?: string, trangThai?: string) {
        // BR-ADM: Tìm theo email/tên, lọc ACTIVE/BANNED, kèm số bài đã đăng
        if (trangThai && !['ACTIVE', 'BANNED'].includes(trangThai)) {
            throw new BadRequestException({ code: 'ADM-00', message: '[ADM-00] Trạng thái lọc không hợp lệ' });
        }
        const where: Prisma.UserWhereInput = {
            ...(tuKhoa
                ? { OR: [{ email: { contains: tuKhoa } }, { displayName: { contains: tuKhoa } }] }
                : {}),
            ...(trangThai ? { status: trangThai } : {}),
        };
        const [items, tongSoPhanTu] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip: trang * kichThuoc,
                take: kichThuoc,
                orderBy: { createdAt: 'desc' },
                include: { _count: { select: { recipes: true } } },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            noiDung: items.map((u) => ({
                id: u.id,
                email: u.email,
                tenHienThi: u.displayName,
                anhDaiDien: u.avatarUrl,
                vaiTro: u.role,
                trangThai: u.status,
                soBaiViet: u._count.recipes,
                ngayTao: u.createdAt.toISOString(),
            })),
            tongSoPhanTu,
            tongSoTrang: Math.ceil(tongSoPhanTu / kichThuoc),
        };
    }

    async khoaNguoiDung(adminId: string, id: string) {
        await this.doiTrangThaiNguoiDung(adminId, id, 'BANNED', 'BAN_USER');
        return { thanhCong: true };
    }

    async moKhoaNguoiDung(adminId: string, id: string) {
        await this.doiTrangThaiNguoiDung(adminId, id, 'ACTIVE', 'ACTIVATE_USER');
        return { thanhCong: true };
    }

    private async doiTrangThaiNguoiDung(adminId: string, id: string, trangThai: string, hanhDong: 'BAN_USER' | 'ACTIVATE_USER') {
        const cu = await this.prisma.user.findUnique({ where: { id }, select: { id: true, status: true } });
        if (!cu) {
            throw new NotFoundException({ code: 'ADM-04', message: '[ADM-04] Không tìm thấy người dùng' });
        }
        if (adminId === id) {
            throw new BadRequestException({ code: 'ADM-05', message: '[ADM-05] Không tự khóa/mở chính mình' });
        }
        // BR-05: Gộp đổi trạng thái + audit vào transaction để rollback khi lỗi
        await this.prisma.$transaction([
            this.prisma.user.update({ where: { id }, data: { status: trangThai } }),
            this.prisma.auditLog.create({
                data: {
                    userId: adminId,
                    action: hanhDong,
                    entityType: 'User',
                    entityId: id,
                    oldData: { status: cu.status },
                    newData: { status: trangThai },
                },
            }),
        ]);
    }

    async doiRole(adminId: string, id: string, role: 'USER' | 'ADMIN') {
        const cu = await this.prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
        if (!cu) {
            throw new NotFoundException({ code: 'ADM-04', message: '[ADM-04] Không tìm thấy người dùng' });
        }
        if (adminId === id) {
            throw new BadRequestException({ code: 'ADM-05', message: '[ADM-05] Không tự đổi role chính mình' });
        }
        // BR-05: Gộp đổi role + audit vào transaction để rollback khi lỗi
        await this.prisma.$transaction([
            this.prisma.user.update({ where: { id }, data: { role } }),
            this.prisma.auditLog.create({
                data: {
                    userId: adminId,
                    action: 'CHANGE_ROLE',
                    entityType: 'User',
                    entityId: id,
                    oldData: { role: cu.role },
                    newData: { role },
                },
            }),
        ]);
        return { thanhCong: true };
    }

    async layBaiChoDuyet(trang: number, kichThuoc: number) {
        return this.layBaiTheoTrangThai('PENDING', trang, kichThuoc);
    }

    async layTatCaBai(trang: number, kichThuoc: number, trangThai?: string) {
        if (trangThai && !TRANG_THAI_HOP_LE.includes(trangThai as RecipeStatus)) {
            throw new BadRequestException({ code: 'ADM-00', message: '[ADM-00] Trạng thái lọc không hợp lệ' });
        }
        return this.layBaiTheoTrangThai(trangThai as RecipeStatus | undefined, trang, kichThuoc);
    }

    private async layBaiTheoTrangThai(trangThai: RecipeStatus | undefined, trang: number, kichThuoc: number) {
        // BR-ADM: Hàng chờ duyệt và toàn bộ bài viết — kèm tác giả để xét duyệt
        // BR-FORK: Bản riêng tư không bao giờ vào hàng chờ admin
        const where: Prisma.RecipeWhereInput = {
            deletedAt: null,
            riengTu: false,
            ...(trangThai ? { status: trangThai } : {}),
        };
        const [items, tongSoPhanTu] = await Promise.all([
            this.prisma.recipe.findMany({
                where,
                skip: trang * kichThuoc,
                take: kichThuoc,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: true,
                    ingredients: { select: { originalText: true } },
                    steps: { select: { content: true } },
                },
            }),
            this.prisma.recipe.count({ where }),
        ]);
        // BR-ADM-AUTO: Gộp 2 query tra lịch sử + trùng lặp cho cả trang (tránh N+1)
        const tacGiaIds = [...new Set(items.map((r) => r.authorId))];
        const [lichSuTuChoi, baiTrungTieuDe] = await Promise.all([
            this.prisma.recipe.groupBy({
                by: ['authorId'],
                where: { authorId: { in: tacGiaIds }, status: 'REJECTED', deletedAt: null },
                _count: { _all: true },
            }),
            this.prisma.recipe.findMany({
                where: { deletedAt: null, riengTu: false, title: { in: items.map((r) => r.title) } },
                select: { id: true, title: true },
            }),
        ]);
        const demTuChoi = new Map(lichSuTuChoi.map((x) => [x.authorId, x._count._all]));
        return {
            noiDung: items.map((r) => {
                const goiY = chamDiemBai({
                    tieuDe: r.title,
                    moTa: r.description,
                    nguyenLieu: r.ingredients.map((nl) => nl.originalText),
                    buoc: r.steps.map((b) => b.content),
                    tacGiaBiTuChoi: demTuChoi.get(r.authorId) ?? 0,
                    trungLap: baiTrungTieuDe.some((t) => t.title === r.title && t.id !== r.id),
                });
                return {
                    id: r.id,
                    ten: r.title,
                    moTa: r.description,
                    anhThumbnail: r.thumbnailUrl,
                    thoiGianNauPhut: r.cookTimeMinutes,
                    khauPhan: r.servings,
                    trangThai: r.status,
                    lyDoTuChoi: r.rejectionReason,
                    // BR-ANTOAN: Kèm cảnh báo combo độc để admin thấy ngay khi duyệt
                    canhBao: kiemTraComboDoc(r.ingredients.map((nl) => nl.originalText)),
                    // BR-ADM-AUTO: Điểm + nhãn gợi ý (chế độ gợi ý: admin vẫn bấm tay)
                    diemTuDong: goiY.diem,
                    nhanGoiY: goiY.nhan,
                    lyDoGoiY: goiY.lyDo,
                    tacGia: { id: r.author.id, tenHienThi: r.author.displayName, email: r.author.email },
                    ngayTao: r.createdAt.toISOString(),
                };
            }),
            tongSoPhanTu,
            tongSoTrang: Math.ceil(tongSoPhanTu / kichThuoc),
        };
    }

    async duyetBai(adminId: string, id: string) {
        await this.doiTrangThaiBai(adminId, id, 'APPROVED', undefined, 'APPROVE');
        return { thanhCong: true };
    }

    async tuChoiBai(adminId: string, id: string, dto: TuChoiBaiDto) {
        await this.doiTrangThaiBai(adminId, id, 'REJECTED', dto.lyDo, 'REJECT');
        return { thanhCong: true };
    }

    async anBai(adminId: string, id: string) {
        await this.doiTrangThaiBai(adminId, id, 'HIDDEN', undefined, 'HIDE');
        return { thanhCong: true };
    }

    async hienBai(adminId: string, id: string) {
        await this.doiTrangThaiBai(adminId, id, 'APPROVED', undefined, 'UNHIDE');
        return { thanhCong: true };
    }

    // BR-ADM-AUTO: Chạy pipeline trên toàn bộ hàng chờ — chế độ gợi ý chỉ đếm nhãn,
    // bật CHE_DO_TU_DONG mới tự duyệt/từ chối + audit
    async chayKiemDuyetTuDong(adminId: string) {
        const cho = await this.prisma.recipe.findMany({
            where: { deletedAt: null, status: 'PENDING', riengTu: false },
            select: { id: true },
        });
        const ketQua = { tong: cho.length, daDuyet: 0, daTuChoi: 0, giuLai: 0 };
        for (const bai of cho) {
            const goiY = await this.kiemDuyet.goiYChoBai(bai.id);
            if (!CHE_DO_TU_DONG) {
                if (goiY.nhan === 'giu-lai') ketQua.giuLai += 1;
                continue;
            }
            if (goiY.nhan === 'nen-duyet') {
                await this.doiTrangThaiBai(adminId, bai.id, 'APPROVED', undefined, 'APPROVE', { diem: goiY.diem });
                ketQua.daDuyet += 1;
            } else if (goiY.nhan === 'nen-tu-choi') {
                await this.doiTrangThaiBai(adminId, bai.id, 'REJECTED', `[AUTO] ${goiY.lyDo.join('; ')}`, 'REJECT', {
                    diem: goiY.diem,
                });
                ketQua.daTuChoi += 1;
            } else {
                ketQua.giuLai += 1;
            }
        }
        return { ...ketQua, cheDoTuDong: CHE_DO_TU_DONG };
    }

    // BR-ADM-AUTO: Hoàn tác quyết định (kể cả của máy) — đưa bài về lại PENDING
    async hoanTacQuyetDinh(adminId: string, id: string) {
        const cu = await this.prisma.recipe.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, status: true, rejectionReason: true },
        });
        if (!cu) {
            throw new NotFoundException({ code: 'REC-04', message: '[REC-04] Không tìm thấy công thức' });
        }
        if (cu.status !== 'APPROVED' && cu.status !== 'REJECTED') {
            throw new BadRequestException({
                code: 'ADM-06',
                message: '[ADM-06] Chỉ hoàn tác được bài đã duyệt hoặc đã từ chối',
            });
        }
        await this.prisma.$transaction([
            this.prisma.recipe.update({ where: { id }, data: { status: 'PENDING', rejectionReason: null } }),
            this.prisma.auditLog.create({
                data: {
                    userId: adminId,
                    action: 'UPDATE',
                    entityType: 'Recipe',
                    entityId: id,
                    oldData: { status: cu.status, rejectionReason: cu.rejectionReason },
                    newData: { status: 'PENDING', hoanTac: true },
                },
            }),
        ]);
        return { thanhCong: true };
    }

    async xoaBinhLuan(adminId: string, id: string) {
        // BR-ADM: Admin dọn bình luận vi phạm (xóa mềm, giữ mạch hội thoại)
        const cu = await this.prisma.comment.findFirst({
            where: { id, deletedAt: null },
            select: { id: true },
        });
        if (!cu) {
            throw new NotFoundException({ code: 'CMT-04', message: '[CMT-04] Không tìm thấy bình luận' });
        }
        // BR-05: Gộp xóa mềm + audit vào transaction để rollback khi lỗi
        await this.prisma.$transaction([
            this.prisma.comment.update({ where: { id }, data: { deletedAt: new Date() } }),
            this.prisma.auditLog.create({
                data: { userId: adminId, action: 'DELETE', entityType: 'Comment', entityId: id, oldData: {}, newData: {} },
            }),
        ]);
        return { thanhCong: true };
    }

    private async doiTrangThaiBai(
        adminId: string,
        id: string,
        trangThai: RecipeStatus,
        lyDo: string | undefined,
        hanhDong: 'APPROVE' | 'REJECT' | 'HIDE' | 'UNHIDE',
        tuDong?: { diem: number },
    ) {
        const cu = await this.prisma.recipe.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, status: true },
        });
        if (!cu) {
            throw new NotFoundException({ code: 'REC-04', message: '[REC-04] Không tìm thấy công thức' });
        }
        // BR-05: Gộp đổi trạng thái + audit vào transaction để rollback khi lỗi
        await this.prisma.$transaction([
            this.prisma.recipe.update({
                where: { id },
                data: { status: trangThai, rejectionReason: lyDo ?? null },
            }),
            this.prisma.auditLog.create({
                data: {
                    userId: adminId,
                    action: hanhDong,
                    entityType: 'Recipe',
                    entityId: id,
                    oldData: { status: cu.status },
                    // BR-ADM-AUTO: Ghi dấu quyết định của máy + điểm để tra lại
                    newData: { status: trangThai, ...(tuDong ? { tuDong: true, diem: tuDong.diem } : {}) },
                },
            }),
        ]);
    }

    // BR-05: Nhật ký kiểm toán — ai làm gì, với cái gì, khi nào (kể cả quyết định của máy)
    async layNhatKy(trang: number, kichThuoc: number, hanhDong?: string) {
        const HANH_DONG_HOP_LE = [
            'CREATE',
            'UPDATE',
            'DELETE',
            'APPROVE',
            'REJECT',
            'HIDE',
            'UNHIDE',
            'BAN_USER',
            'ACTIVATE_USER',
            'CHANGE_ROLE',
            'SYNC_REFERENCE',
            'RESOLVE_REPORT',
        ];
        if (hanhDong && !HANH_DONG_HOP_LE.includes(hanhDong)) {
            throw new BadRequestException({ code: 'ADM-00', message: '[ADM-00] Hành động lọc không hợp lệ' });
        }
        const where = hanhDong ? { action: hanhDong as never } : {};
        const [items, tongSoPhanTu] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                skip: trang * kichThuoc,
                take: kichThuoc,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { id: true, email: true, displayName: true } } },
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        return {
            noiDung: items.map((n) => ({
                id: n.id,
                hanhDong: n.action,
                loaiThucThe: n.entityType,
                thucTheId: n.entityId,
                duLieuCu: n.oldData,
                duLieuMoi: n.newData,
                nguoiLam: { id: n.user.id, email: n.user.email, tenHienThi: n.user.displayName },
                ngayTao: n.createdAt.toISOString(),
            })),
            tongSoPhanTu,
            tongSoTrang: Math.ceil(tongSoPhanTu / kichThuoc),
        };
    }

    async layDashboard() {
        // BR-ADM: Số liệu tổng quan cho trang quản trị
        const bayNgayTruoc = new Date();
        bayNgayTruoc.setDate(bayNgayTruoc.getDate() - 7);
        const [tongNguoiDung, dangHoatDong, choDuyet, daDuyet, ungVienTop, tangNguoiDung, tangBai, tuongTac] =
            await Promise.all([
                this.prisma.user.count(),
                // BR-ADM: Hoạt động = có tài khoản tạo trong 7 ngày qua (chưa tracking hành vi)
                this.prisma.user.count({ where: { status: 'ACTIVE', createdAt: { gte: bayNgayTruoc } } }),
                this.prisma.recipe.count({ where: { deletedAt: null, status: 'PENDING' } }),
                this.prisma.recipe.count({ where: { deletedAt: null, status: 'APPROVED' } }),
                this.prisma.recipe.findMany({
                    where: { deletedAt: null, status: 'APPROVED' },
                    take: 20,
                    orderBy: { ratings: { _count: 'desc' } },
                    select: { id: true, title: true, ratings: { select: { score: true } } },
                }),
                this.thongKeTheoNgay('user'),
                this.thongKeTheoNgay('recipe'),
                Promise.all([
                    this.prisma.favorite.count(),
                    this.prisma.rating.count(),
                    this.prisma.comment.count({ where: { deletedAt: null } }),
                ]),
            ]);
        // BR-ADM: Top theo điểm trung bình, tối thiểu 5 lượt chấm mới xếp hạng
        const topDanhGia = ungVienTop
            .map((r) => ({
                id: r.id,
                ten: r.title,
                diemTrungBinh:
                    r.ratings.length > 0
                        ? Math.round((r.ratings.reduce((s, x) => s + x.score, 0) / r.ratings.length) * 10) / 10
                        : 0,
                tongDanhGia: r.ratings.length,
            }))
            .filter((r) => r.tongDanhGia >= 5)
            .sort((a, b) => b.diemTrungBinh - a.diemTrungBinh || b.tongDanhGia - a.tongDanhGia)
            .slice(0, 5);
        return {
            tongNguoiDung,
            dangHoatDong,
            baiChoDuyet: choDuyet,
            baiDaDuyet: daDuyet,
            topDanhGia,
            tangTruongNguoiDung: tangNguoiDung,
            tangTruongCongThuc: tangBai,
            tuongTac: { tongYeuThich: tuongTac[0], tongDanhGia: tuongTac[1], tongBinhLuan: tuongTac[2] },
        };
    }

    private async thongKeTheoNgay(loai: 'user' | 'recipe'): Promise<Array<{ ngay: string; soLuong: number }>> {
        // BR-ADM: Đếm theo ngày 7 ngày gần nhất để vẽ biểu đồ tăng trưởng
        const ketQua: Array<{ ngay: string; soLuong: number }> = [];
        for (let lui = 6; lui >= 0; lui--) {
            const ngay = new Date();
            ngay.setHours(0, 0, 0, 0);
            ngay.setDate(ngay.getDate() - lui);
            const homSau = new Date(ngay);
            homSau.setDate(homSau.getDate() + 1);
            const where = { createdAt: { gte: ngay, lt: homSau } };
            const soLuong =
                loai === 'user'
                    ? await this.prisma.user.count({ where })
                    : await this.prisma.recipe.count({ where: { ...where, deletedAt: null } });
            ketQua.push({ ngay: ngay.toISOString().split('T')[0], soLuong });
        }
        return ketQua;
    }

    private async ghiNhatKy(
        adminId: string,
        hanhDong: 'BAN_USER' | 'ACTIVATE_USER' | 'CHANGE_ROLE' | 'APPROVE' | 'REJECT' | 'HIDE' | 'UNHIDE' | 'DELETE',
        loaiThucThe: string,
        thucTheId: string,
        duLieuCu: object,
        duLieuMoi: object,
    ) {
        await this.prisma.auditLog.create({
            data: {
                userId: adminId,
                action: hanhDong,
                entityType: loaiThucThe,
                entityId: thucTheId,
                oldData: duLieuCu as Prisma.InputJsonValue,
                newData: duLieuMoi as Prisma.InputJsonValue,
            },
        });
    }
}
