import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TaoDanhMucDto, TaoNhanDto, slugTuTen } from './dto/danh-muc.dto';

// BR-ADM: Danh mục + nhãn cho lọc và gắn thẻ công thức
@Injectable()
export class DanhMucService {
    constructor(private readonly prisma: PrismaService) {}

    layDanhMuc() {
        return this.prisma.category.findMany({ orderBy: { name: 'asc' } }).then((ds) =>
            ds.map((c) => ({ id: c.id, ten: c.name, slug: c.slug, moTa: c.description })),
        );
    }

    async taoDanhMuc(dto: TaoDanhMucDto) {
        const slug = dto.slug?.trim() || slugTuTen(dto.ten);
        try {
            const c = await this.prisma.category.create({
                data: { name: dto.ten.trim(), slug, description: dto.moTa },
            });
            return { id: c.id, ten: c.name, slug: c.slug, moTa: c.description };
        } catch {
            throw new ConflictException({ code: 'DUP-01', message: '[DUP-01] Tên hoặc slug danh mục đã tồn tại' });
        }
    }

    async xoaDanhMuc(id: string) {
        const dung = await this.prisma.recipe.count({ where: { categoryId: id } });
        if (dung > 0) {
            throw new ConflictException({
                code: 'DUP-01',
                message: '[DUP-01] Danh mục còn công thức, không xóa được',
            });
        }
        const xoa = await this.prisma.category.deleteMany({ where: { id } });
        if (xoa.count === 0) {
            throw new NotFoundException({ code: 'NOT-01', message: '[NOT-01] Không tìm thấy danh mục' });
        }
        return { thanhCong: true };
    }

    layNhan() {
        return this.prisma.tag.findMany({ orderBy: { name: 'asc' } }).then((ds) =>
            ds.map((t) => ({ id: t.id, ten: t.name, slug: t.slug })),
        );
    }

    async taoNhan(dto: TaoNhanDto) {
        const slug = dto.slug?.trim() || slugTuTen(dto.ten);
        try {
            const t = await this.prisma.tag.create({ data: { name: dto.ten.trim(), slug } });
            return { id: t.id, ten: t.name, slug: t.slug };
        } catch {
            throw new ConflictException({ code: 'DUP-01', message: '[DUP-01] Tên hoặc slug nhãn đã tồn tại' });
        }
    }

    async xoaNhan(id: string) {
        const xoa = await this.prisma.tag.deleteMany({ where: { id } });
        if (xoa.count === 0) {
            throw new NotFoundException({ code: 'NOT-01', message: '[NOT-01] Không tìm thấy nhãn' });
        }
        return { thanhCong: true };
    }
}
