import { PrismaService } from '../../common/prisma.service';
import { KiemDuyetService } from '../kiem-duyet/kiem-duyet.service';
import { AdminService } from './admin.service';

describe('AdminService giữ admin cuối (BR-ADM)', () => {
    const prisma = new PrismaService();
    const service = new AdminService(prisma, new KiemDuyetService(prisma));
    const stamp = Date.now();
    let adminA = '';
    let adminB = '';
    let userThuong = '';
    let adminCu: string[] = [];

    beforeAll(async () => {
        const a = await prisma.user.create({
            data: { email: `adm-a-${stamp}@test.vn`, passwordHash: 'x', displayName: 'AA', role: 'ADMIN' },
        });
        const b = await prisma.user.create({
            data: { email: `adm-b-${stamp}@test.vn`, passwordHash: 'x', displayName: 'AB', role: 'ADMIN' },
        });
        const u = await prisma.user.create({
            data: { email: `usr-${stamp}@test.vn`, passwordHash: 'x', displayName: 'UU' },
        });
        adminA = a.id;
        adminB = b.id;
        userThuong = u.id;
        // BR-TEST: Tạm hạ các admin có sẵn để test bất biến "admin cuối" trong isolation
        const dsCu = await prisma.user.findMany({
            where: { role: 'ADMIN', status: 'ACTIVE', id: { notIn: [adminA, adminB] } },
            select: { id: true },
        });
        adminCu = dsCu.map((x) => x.id);
        if (adminCu.length > 0) {
            await prisma.user.updateMany({ where: { id: { in: adminCu } }, data: { role: 'USER' } });
        }
    }, 30000);

    afterAll(async () => {
        if (adminCu.length > 0) {
            await prisma.user.updateMany({ where: { id: { in: adminCu } }, data: { role: 'ADMIN' } });
        }
        await prisma.user.deleteMany({ where: { id: { in: [adminA, adminB, userThuong] } } });
        await prisma.$disconnect();
    }, 30000);

    it('không hạ cấp admin cuối cùng', async () => {
        await service.doiRole(adminA, adminB, 'USER');
        await expect(service.doiRole(adminB, adminA, 'USER')).rejects.toThrow('[ADM-07]');
    }, 30000);

    it('không khóa admin cuối cùng', async () => {
        await expect(service.khoaNguoiDung(adminB, adminA)).rejects.toThrow('[ADM-07]');
        await service.doiRole(adminB, adminA, 'ADMIN');
    }, 30000);

    it('vẫn khóa được user thường', async () => {
        await expect(service.khoaNguoiDung(adminA, userThuong)).resolves.toEqual({ thanhCong: true });
    }, 30000);
});
