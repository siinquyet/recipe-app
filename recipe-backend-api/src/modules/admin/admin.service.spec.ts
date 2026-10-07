import { PrismaService } from '../../common/prisma.service';
import { KiemDuyetService } from '../kiem-duyet/kiem-duyet.service';
import { AdminService } from './admin.service';

describe('AdminService kiem-duyet (BR-ADM-AUTO)', () => {
    const prisma = new PrismaService();
    const service = new AdminService(prisma, new KiemDuyetService(prisma));
    const stamp = Date.now();
    let tacGia = '';
    let admin = '';
    let monFork = '';

    beforeAll(async () => {
        const tg = await prisma.user.create({
            data: { email: `adm-tg-${stamp}@test.vn`, passwordHash: 'x', displayName: 'TG' },
        });
        const ad = await prisma.user.create({
            data: { email: `adm-ad-${stamp}@test.vn`, passwordHash: 'x', displayName: 'AD', role: 'ADMIN' },
        });
        tacGia = tg.id;
        admin = ad.id;
        const fork = await prisma.recipe.create({
            data: {
                title: 'Fork lén',
                cookTimeMinutes: 5,
                servings: 1,
                authorId: tacGia,
                status: 'PENDING',
                riengTu: true,
                nguonGocId: 'mon-goc-ao',
            },
        });
        monFork = fork.id;
    }, 30000);

    afterAll(async () => {
        await prisma.recipe.deleteMany({ where: { authorId: { in: [tacGia, admin] } } });
        await prisma.user.deleteMany({ where: { id: { in: [tacGia, admin] } } });
        await prisma.$disconnect();
    }, 30000);

    it('hàng chờ không lọt bản riêng tư', async () => {
        const hangCho = await service.layBaiChoDuyet(0, 50);
        expect(hangCho.noiDung.map((b) => b.id)).not.toContain(monFork);
    }, 30000);

    it('hoàn tác giữ lý do từ chối cũ trong audit', async () => {
        const bai = await prisma.recipe.create({
            data: {
                title: 'Món bị từ chối',
                cookTimeMinutes: 5,
                servings: 1,
                authorId: tacGia,
                status: 'REJECTED',
                rejectionReason: '[REC-01] Thiếu bước làm',
            },
        });
        await service.hoanTacQuyetDinh(admin, bai.id);
        const audit = await prisma.auditLog.findFirst({
            where: { entityType: 'Recipe', entityId: bai.id, action: 'UPDATE' },
            orderBy: { createdAt: 'desc' },
        });
        expect(audit?.newData).toMatchObject({ status: 'PENDING', hoanTac: true });
        expect(audit?.oldData).toMatchObject({ rejectionReason: '[REC-01] Thiếu bước làm' });
    }, 30000);
});
