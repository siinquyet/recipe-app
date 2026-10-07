import { PrismaService } from '../../common/prisma.service';
import { KiemDuyetService } from '../kiem-duyet/kiem-duyet.service';
import { AdminService } from './admin.service';

describe('AdminService nhat-ky (BR-05)', () => {
    const prisma = new PrismaService();
    const service = new AdminService(prisma, new KiemDuyetService(prisma));
    const stamp = Date.now();
    let admin = '';

    beforeAll(async () => {
        const ad = await prisma.user.create({
            data: { email: `adm-log-${stamp}@test.vn`, passwordHash: 'x', displayName: 'LG', role: 'ADMIN' },
        });
        admin = ad.id;
        await prisma.auditLog.create({
            data: {
                userId: admin,
                action: 'APPROVE',
                entityType: 'Recipe',
                entityId: 'mon-ao-log',
                oldData: { status: 'PENDING' },
                newData: { status: 'APPROVED' },
            },
        });
    }, 30000);

    afterAll(async () => {
        await prisma.auditLog.deleteMany({ where: { userId: admin } });
        await prisma.user.deleteMany({ where: { id: admin } });
        await prisma.$disconnect();
    }, 30000);

    it('đọc được dòng audit vừa ghi, kèm tên người làm', async () => {
        const ketQua = await service.layNhatKy(0, 20, 'APPROVE');
        const dong = ketQua.noiDung.find((d) => d.thucTheId === 'mon-ao-log');
        expect(dong).toBeDefined();
        expect(dong?.nguoiLam.email).toBe(`adm-log-${stamp}@test.vn`);
        expect(dong?.hanhDong).toBe('APPROVE');
    }, 30000);
});
