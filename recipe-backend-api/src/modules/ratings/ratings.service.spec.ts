import { PrismaService } from '../../common/prisma.service';
import { RatingsService } from './ratings.service';

describe('RatingsService chống tự chấm (BR-SOC)', () => {
    const prisma = new PrismaService();
    const service = new RatingsService(prisma);
    const stamp = Date.now();
    let tacGia = '';
    let nguoiKhac = '';
    let monDuyet = '';
    let monNhap = '';

    beforeAll(async () => {
        const a = await prisma.user.create({
            data: { email: `rate-a-${stamp}@test.vn`, passwordHash: 'x', displayName: 'RA' },
        });
        const b = await prisma.user.create({
            data: { email: `rate-b-${stamp}@test.vn`, passwordHash: 'x', displayName: 'RB' },
        });
        tacGia = a.id;
        nguoiKhac = b.id;
        const duyet = await prisma.recipe.create({
            data: { title: 'Món chấm', cookTimeMinutes: 5, servings: 1, authorId: tacGia, status: 'APPROVED' },
        });
        const nhap = await prisma.recipe.create({
            data: { title: 'Món nháp', cookTimeMinutes: 5, servings: 1, authorId: tacGia, status: 'DRAFT' },
        });
        monDuyet = duyet.id;
        monNhap = nhap.id;
    }, 30000);

    afterAll(async () => {
        await prisma.rating.deleteMany({ where: { userId: { in: [tacGia, nguoiKhac] } } });
        await prisma.recipe.deleteMany({ where: { authorId: { in: [tacGia, nguoiKhac] } } });
        await prisma.user.deleteMany({ where: { id: { in: [tacGia, nguoiKhac] } } });
        await prisma.$disconnect();
    }, 30000);

    it('tác giả không tự chấm bài đã duyệt của mình', async () => {
        await expect(service.danhGia(tacGia, monDuyet, { diem: 5 })).rejects.toThrow('[SOC-04]');
    }, 30000);

    it('tác giả không chấm được bài nháp của mình', async () => {
        await expect(service.danhGia(tacGia, monNhap, { diem: 5 })).rejects.toThrow();
    }, 30000);

    it('người khác vẫn chấm được bài đã duyệt', async () => {
        const kq = await service.danhGia(nguoiKhac, monDuyet, { diem: 4 });
        expect(kq.tongSoDanhGia).toBe(1);
    }, 30000);

    it('tóm tắt điểm ẩn với bài chưa công khai', async () => {
        await expect(service.tomTat(monNhap)).rejects.toThrow('[REC-04]');
    }, 30000);
});
