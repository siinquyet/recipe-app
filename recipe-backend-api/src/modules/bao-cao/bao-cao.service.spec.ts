import { PrismaService } from '../../common/prisma.service';
import { BaoCaoService } from './bao-cao.service';

describe('BaoCaoService xử lý kèm hành động (BR-SOC)', () => {
    const prisma = new PrismaService();
    const service = new BaoCaoService(prisma);
    const stamp = Date.now();
    let admin = '';
    let tacGia = '';
    let monId = '';

    beforeAll(async () => {
        const ad = await prisma.user.create({
            data: { email: `bc-ad-${stamp}@test.vn`, passwordHash: 'x', displayName: 'BA', role: 'ADMIN' },
        });
        const tg = await prisma.user.create({
            data: { email: `bc-tg-${stamp}@test.vn`, passwordHash: 'x', displayName: 'BT' },
        });
        admin = ad.id;
        tacGia = tg.id;
        const mon = await prisma.recipe.create({
            data: { title: 'Món vi phạm', cookTimeMinutes: 5, servings: 1, authorId: tacGia, status: 'APPROVED' },
        });
        monId = mon.id;
    }, 30000);

    afterAll(async () => {
        await prisma.report.deleteMany({ where: { userId: tacGia } });
        await prisma.recipe.deleteMany({ where: { authorId: tacGia } });
        await prisma.user.deleteMany({ where: { id: { in: [admin, tacGia] } } });
        await prisma.$disconnect();
    }, 30000);

    it('xác nhận vi phạm kèm ẩn bài thì bài bị ẩn', async () => {
        const bc = await prisma.report.create({
            data: { userId: tacGia, recipeId: monId, reason: 'SPAM' },
        });
        await service.xuLy(admin, bc.id, { trangThai: 'RESOLVED', hanhDong: 'AN_BAI' });
        const mon = await prisma.recipe.findUnique({ where: { id: monId } });
        expect(mon?.status).toBe('HIDDEN');
    }, 30000);

    it('bác báo cáo thì resolvedAt để trống', async () => {
        const bc = await prisma.report.create({
            data: { userId: tacGia, recipeId: monId, reason: 'OTHER' },
        });
        await service.xuLy(admin, bc.id, { trangThai: 'REJECTED' });
        const sau = await prisma.report.findUnique({ where: { id: bc.id } });
        expect(sau?.status).toBe('REJECTED');
        expect(sau?.resolvedAt).toBeNull();
    }, 30000);
});
