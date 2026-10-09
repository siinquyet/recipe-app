import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { MealType, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { CapNhatKeHoachAnDto, CapNhatMonDto, MonMoiDto, TaoKeHoachAnDto } from './dto/meal-plan.dto';

// BR-MEAL: Ngày YYYY-MM-DD theo giờ địa phương — toISOString() trả ngày UTC,
// lệch 1 ngày với múi giờ VN (00:00+07 lưu thành 17:00Z hôm trước)
function sangYyyyMmDd(ngay: Date): string {
    const mm = String(ngay.getMonth() + 1).padStart(2, '0');
    const dd = String(ngay.getDate()).padStart(2, '0');
    return `${ngay.getFullYear()}-${mm}-${dd}`;
}

@Injectable()
export class MealPlansService {
    constructor(private readonly prisma: PrismaService) {}

    async layDanhSach(trang: number, kichThuoc: number, userId: string) {
        // BR-MEAL: Mỗi tài khoản chỉ thấy kế hoạch của mình
        const where = { userId };
        const [items, tongSoPhanTu] = await Promise.all([
            this.prisma.mealPlan.findMany({
                where,
                skip: trang * kichThuoc,
                take: kichThuoc,
                orderBy: { createdAt: 'desc' },
                include: { items: true },
            }),
            this.prisma.mealPlan.count({ where }),
        ]);

        const tongSoTrang = Math.ceil(tongSoPhanTu / kichThuoc);

        return {
            noiDung: items.map((m) => this.toKeHoachAn(m)),
            tongSoPhanTu,
            tongSoTrang,
        };
    }

    async taoMoi(userId: string, dto: TaoKeHoachAnDto) {
        if (new Date(dto.ngayBatDau) > new Date(dto.ngayKetThuc)) {
            throw new BadRequestException({
                code: 'MEAL-00',
                message: '[MEAL-00] Ngày bắt đầu phải trước ngày kết thúc',
            });
        }

        // BR-MEAL-04: Món gửi kèm lúc tạo cũng phải duyệt + trong khoảng + không trùng buổi
        if (dto.cacMon) {
            await this.validateMonMoi(dto.cacMon, dto.ngayBatDau, dto.ngayKetThuc);
        }

        const mealPlan = await this.prisma.mealPlan.create({
            data: {
                userId,
                name: dto.ten,
                startDate: new Date(dto.ngayBatDau),
                endDate: new Date(dto.ngayKetThuc),
                isActive: true,
                // BR-MEAL: Nhận món ngay khi tạo để mobile đỡ tốn thêm request
                items: dto.cacMon
                    ? {
                          create: dto.cacMon.map((mon, i) => ({
                              recipeId: mon.congThucId,
                              recipeReferenceId: mon.thamChieuId,
                              date: new Date(mon.ngay),
                              mealType: mon.buoiAn as MealType,
                              servings: mon.khauPhan,
                              sortOrder: i,
                          })),
                      }
                    : undefined,
            },
            include: { items: true },
        });

        return this.layChiTiet(mealPlan.id);
    }

    async layChiTiet(id: string, userId?: string) {
        // BR-MEAL: Join công thức để mobile hiển thị tên + ảnh, không chỉ recipeId
        const mealPlan = await this.prisma.mealPlan.findUnique({
            where: { id },
            include: {
                items: {
                    include: { recipe: { include: { author: true } }, recipeReference: true },
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });

        if (!mealPlan) {
            throw new NotFoundException({
                code: 'MEAL-04',
                message: '[MEAL-04] Không tìm thấy kế hoạch ăn',
            });
        }

        // BR-MEAL: Kế hoạch của ai người đó xem (admin xem qua API admin riêng)
        if (userId && mealPlan.userId !== userId) {
            throw new NotFoundException({
                code: 'MEAL-04',
                message: '[MEAL-04] Không tìm thấy kế hoạch ăn',
            });
        }

        return this.toKeHoachAn(mealPlan);
    }

    async capNhat(userId: string, id: string, dto: CapNhatKeHoachAnDto) {
        const plan = await this.layCuaNguoiDung(userId, id);
        const ngayBatDau = dto.ngayBatDau ? new Date(dto.ngayBatDau) : plan.startDate;
        const ngayKetThuc = dto.ngayKetThuc ? new Date(dto.ngayKetThuc) : plan.endDate;
        if (ngayBatDau > ngayKetThuc) {
            throw new BadRequestException({
                code: 'MEAL-00',
                message: '[MEAL-00] Ngày bắt đầu phải trước ngày kết thúc',
            });
        }
        // BR-MEAL: Thu hẹp khoảng lấn món cũ thì chặn — dời/xóa món đó trước
        if (dto.ngayBatDau !== undefined || dto.ngayKetThuc !== undefined) {
            const batDauMoi = new Date(ngayBatDau);
            batDauMoi.setHours(0, 0, 0, 0);
            const ketThucMoi = new Date(ngayKetThuc);
            ketThucMoi.setHours(0, 0, 0, 0);
            const ngoaiKhoang = await this.prisma.mealPlanItem.count({
                where: {
                    mealPlanId: id,
                    OR: [{ date: { lt: batDauMoi } }, { date: { gt: ketThucMoi } }],
                },
            });
            if (ngoaiKhoang > 0) {
                throw new BadRequestException({
                    code: 'MEAL-06',
                    message: `[MEAL-06] Còn ${ngoaiKhoang} món ngoài khoảng mới — dời hoặc xóa trước`,
                });
            }
        }
        await this.prisma.mealPlan.update({
            where: { id },
            data: {
                ...(dto.ten !== undefined ? { name: dto.ten } : {}),
                ...(dto.ngayBatDau !== undefined ? { startDate: new Date(dto.ngayBatDau) } : {}),
                ...(dto.ngayKetThuc !== undefined ? { endDate: new Date(dto.ngayKetThuc) } : {}),
            },
        });
        return this.layChiTiet(id);
    }

    async xoa(userId: string, id: string) {
        await this.layCuaNguoiDung(userId, id);
        // BR-MEAL: Xóa kế hoạch kéo theo món bên trong (cascade)
        await this.prisma.mealPlan.delete({ where: { id } });
        return { thanhCong: true };
    }

    async themMon(userId: string, keHoachId: string, dto: MonMoiDto) {
        // BR-MEAL-04: Chỉ món APPROVED, ngày trong khoảng kế hoạch, 1 buổi 1 món
        const plan = await this.layCuaNguoiDung(userId, keHoachId);
        this.kiemTraMotMon(dto.congThucId, dto.thamChieuId);
        if (dto.congThucId) {
            const congThuc = await this.prisma.recipe.findFirst({
                where: { id: dto.congThucId, deletedAt: null, status: 'APPROVED', riengTu: false },
                select: { id: true },
            });
            if (!congThuc) {
                throw new NotFoundException({ code: 'REC-04', message: '[REC-04] Chỉ thêm được món đã duyệt' });
            }
        }
        if (dto.thamChieuId) {
            const thamChieu = await this.prisma.recipeReference.findUnique({
                where: { id: dto.thamChieuId },
                select: { id: true },
            });
            if (!thamChieu) {
                throw new NotFoundException({ code: 'REC-04', message: '[REC-04] Không tìm thấy món tham chiếu' });
            }
        }
        const ngayAn = new Date(`${dto.ngay}T00:00:00`);
        const batDau = new Date(plan.startDate);
        batDau.setHours(0, 0, 0, 0);
        const ketThuc = new Date(plan.endDate);
        ketThuc.setHours(0, 0, 0, 0);
        if (ngayAn < batDau || ngayAn > ketThuc) {
            throw new BadRequestException({
                code: 'MEAL-06',
                message: '[MEAL-06] Ngày ăn phải trong khoảng kế hoạch',
            });
        }
        const soThuTu = await this.prisma.mealPlanItem.count({ where: { mealPlanId: keHoachId } });
        // BR-MEAL-04: 1 buổi chỉ 1 món (unique DB gồm sortOrder nên check tay)
        const daCo = await this.prisma.mealPlanItem.findFirst({
            where: { mealPlanId: keHoachId, date: ngayAn, mealType: dto.buoiAn as MealType },
            select: { id: true },
        });
        if (daCo) {
            throw new BadRequestException({
                code: 'MEAL-07',
                message: '[MEAL-07] Buổi này đã có món, sửa thay vì thêm mới',
            });
        }
        try {
            await this.prisma.mealPlanItem.create({
                data: {
                    mealPlanId: keHoachId,
                    recipeId: dto.congThucId,
                    recipeReferenceId: dto.thamChieuId,
                    date: ngayAn,
                    mealType: dto.buoiAn as MealType,
                    servings: dto.khauPhan,
                    sortOrder: soThuTu,
                },
            });
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new BadRequestException({
                    code: 'MEAL-07',
                    message: '[MEAL-07] Buổi này đã có món, sửa thay vì thêm mới',
                });
            }
            throw e;
        }
        return this.layChiTiet(keHoachId);
    }

    async capNhatMon(userId: string, keHoachId: string, monId: string, dto: CapNhatMonDto) {
        const plan = await this.layCuaNguoiDung(userId, keHoachId);
        const mon = await this.prisma.mealPlanItem.findFirst({
            where: { id: monId, mealPlanId: keHoachId },
            select: { id: true, date: true, mealType: true },
        });
        if (!mon) {
            throw new NotFoundException({ code: 'MEAL-05', message: '[MEAL-05] Không tìm thấy món trong kế hoạch' });
        }
        const ngayMoi = dto.ngay !== undefined ? new Date(`${dto.ngay}T00:00:00`) : mon.date;
        const buoiMoi = (dto.buoiAn ?? mon.mealType) as MealType;
        // BR-MEAL: Chặn dời ngày ra ngoài khoảng kế hoạch (MEAL-06)
        const batDau = new Date(plan.startDate);
        batDau.setHours(0, 0, 0, 0);
        const ketThuc = new Date(plan.endDate);
        ketThuc.setHours(0, 0, 0, 0);
        const ngayChuan = new Date(ngayMoi);
        ngayChuan.setHours(0, 0, 0, 0);
        if (ngayChuan < batDau || ngayChuan > ketThuc) {
            throw new BadRequestException({
                code: 'MEAL-06',
                message: '[MEAL-06] Ngày ăn phải trong khoảng kế hoạch',
            });
        }
        // BR-MEAL-04: Chặn đổi sang buổi đã có món (MEAL-07)
        if (dto.ngay !== undefined || dto.buoiAn !== undefined) {
            const trung = await this.prisma.mealPlanItem.findFirst({
                where: { mealPlanId: keHoachId, date: ngayChuan, mealType: buoiMoi, NOT: { id: monId } },
                select: { id: true },
            });
            if (trung) {
                throw new BadRequestException({
                    code: 'MEAL-07',
                    message: '[MEAL-07] Buổi này đã có món, chọn buổi khác',
                });
            }
        }
        // BR-MEAL-04: Cho dời ngày/đổi buổi kèm khẩu phần
        await this.prisma.mealPlanItem.update({
            where: { id: monId },
            data: {
                ...(dto.khauPhan !== undefined ? { servings: dto.khauPhan } : {}),
                ...(dto.ngay !== undefined ? { date: new Date(`${dto.ngay}T00:00:00`) } : {}),
                ...(dto.buoiAn !== undefined ? { mealType: dto.buoiAn as MealType } : {}),
            },
        });
        return this.layChiTiet(keHoachId);
    }

    async xoaMon(userId: string, keHoachId: string, monId: string) {
        await this.layCuaNguoiDung(userId, keHoachId);
        const xoa = await this.prisma.mealPlanItem.deleteMany({ where: { id: monId, mealPlanId: keHoachId } });
        if (xoa.count === 0) {
            throw new NotFoundException({ code: 'MEAL-05', message: '[MEAL-05] Không tìm thấy món trong kế hoạch' });
        }
        return this.layChiTiet(keHoachId);
    }

    private async validateMonMoi(
        cacMon: Array<{ congThucId?: string; thamChieuId?: string; ngay: string; buoiAn: string }>,
        ngayBatDau: string,
        ngayKetThuc: string,
    ) {
        const batDau = new Date(`${ngayBatDau}T00:00:00`);
        const ketThuc = new Date(`${ngayKetThuc}T00:00:00`);
        const daThay = new Set<string>();
        for (const mon of cacMon) {
            this.kiemTraMotMon(mon.congThucId, mon.thamChieuId);
            if (mon.congThucId) {
                const congThuc = await this.prisma.recipe.findFirst({
                    where: { id: mon.congThucId, deletedAt: null, status: 'APPROVED', riengTu: false },
                    select: { id: true },
                });
                if (!congThuc) {
                    throw new NotFoundException({ code: 'REC-04', message: '[REC-04] Chỉ thêm được món đã duyệt' });
                }
            }
            if (mon.thamChieuId) {
                const thamChieu = await this.prisma.recipeReference.findUnique({
                    where: { id: mon.thamChieuId },
                    select: { id: true },
                });
                if (!thamChieu) {
                    throw new NotFoundException({ code: 'REC-04', message: '[REC-04] Không tìm thấy món tham chiếu' });
                }
            }
            const ngayAn = new Date(`${mon.ngay}T00:00:00`);
            if (ngayAn < batDau || ngayAn > ketThuc) {
                throw new BadRequestException({
                    code: 'MEAL-06',
                    message: '[MEAL-06] Ngày ăn phải trong khoảng kế hoạch',
                });
            }
            const khoa = `${mon.ngay}|${mon.buoiAn}`;
            if (daThay.has(khoa)) {
                throw new BadRequestException({
                    code: 'MEAL-07',
                    message: '[MEAL-07] Buổi này đã có món, sửa thay vì thêm mới',
                });
            }
            daThay.add(khoa);
        }
    }

    private kiemTraMotMon(congThucId?: string, thamChieuId?: string) {
        // BR-MEAL-04: Mỗi món đúng 1 công thức — không món ma, không 2 nguồn cùng lúc
        if (!!congThucId === !!thamChieuId) {
            throw new BadRequestException({
                code: 'MEAL-08',
                message: '[MEAL-08] Mỗi món đúng 1 công thức (món nhà hoặc món tham chiếu)',
            });
        }
    }

    private async layCuaNguoiDung(userId: string, id: string) {
        // BR-MEAL: Mọi thao tác ghi phải đúng chủ sở hữu kế hoạch
        const plan = await this.prisma.mealPlan.findFirst({
            where: { id, userId },
            select: { id: true, startDate: true, endDate: true },
        });
        if (!plan) {
            throw new NotFoundException({
                code: 'MEAL-04',
                message: '[MEAL-04] Không tìm thấy kế hoạch ăn',
            });
        }
        return plan;
    }

    private toKeHoachAn(mealPlan: {
        id: string;
        name: string;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        items: Array<{
            id: string;
            date: Date;
            mealType: string;
            servings: number;
            sortOrder: number;
            recipeId: string | null;
            recipe?: {
                id: string;
                title: string;
                thumbnailUrl: string | null;
            } | null;
            recipeReferenceId?: string | null;
            recipeReference?: {
                id: string;
                title: string;
                imageUrl: string | null;
            } | null;
        }>;
    }) {
        return {
            id: mealPlan.id,
            ten: mealPlan.name,
            ngayBatDau: sangYyyyMmDd(mealPlan.startDate),
            ngayKetThuc: sangYyyyMmDd(mealPlan.endDate),
            kichHoat: mealPlan.isActive,
            cacMon: mealPlan.items.map((item) => ({
                id: item.id,
                ngay: sangYyyyMmDd(item.date),
                loaiBuoiAn: item.mealType,
                khauPhan: item.servings,
                thuTu: item.sortOrder,
                congThuc: item.recipe
                    ? { id: item.recipe.id, ten: item.recipe.title, anhThumbnail: item.recipe.thumbnailUrl }
                    : null,
                monThamChieu: item.recipeReference
                    ? { id: item.recipeReference.id, ten: item.recipeReference.title, anhThumbnail: item.recipeReference.imageUrl }
                    : null,
            })),
        };
    }
}
