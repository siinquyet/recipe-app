import { PrismaService } from '../../common/prisma.service';
import { RecipesService } from './recipes.service';

describe('RecipesService.forkCongThuc (BR-FORK)', () => {
    const prisma = new PrismaService();
    const service = new RecipesService(prisma);
    const stamp = Date.now();
    let userA = '';
    let userB = '';
    let monGoc = '';

    beforeAll(async () => {
        const a = await prisma.user.create({
            data: { email: `fork-a-${stamp}@test.vn`, passwordHash: 'x', displayName: 'A' },
        });
        const b = await prisma.user.create({
            data: { email: `fork-b-${stamp}@test.vn`, passwordHash: 'x', displayName: 'B' },
        });
        userA = a.id;
        userB = b.id;
        const goc = await prisma.recipe.create({
            data: { title: 'Món gốc', cookTimeMinutes: 10, servings: 2, authorId: userA, status: 'APPROVED' },
        });
        monGoc = goc.id;
    }, 30000);

    afterAll(async () => {
        await prisma.recipe.deleteMany({ where: { authorId: { in: [userA, userB] } } });
        await prisma.user.deleteMany({ where: { id: { in: [userA, userB] } } });
        await prisma.$disconnect();
    }, 30000);

    it('fork giữ nguyên món gốc và chỉ chủ thấy', async () => {
        const banFork = await (service as unknown as { forkCongThuc(u: string, g: string): Promise<{ id: string; tacGia: { id: string } }> }).forkCongThuc(userA, monGoc);
        expect(banFork.tacGia.id).toBe(userA);
        const forkDb = await prisma.recipe.findUnique({ where: { id: banFork.id } });
        expect(forkDb?.riengTu).toBe(true);
        expect(forkDb?.nguonGocId).toBe(monGoc);
        const goc = await prisma.recipe.findUnique({ where: { id: monGoc } });
        expect(goc?.title).toBe('Món gốc');
        await expect(
            (service as unknown as { layBanCaNhan(u: string, g: string): Promise<unknown> }).layBanCaNhan(userB, monGoc),
        ).resolves.toBeNull();
    }, 30000);

    it('bản fork riêng tư không gửi duyệt được', async () => {
        const banFork = (await (
            service as unknown as { forkCongThuc(u: string, g: string): Promise<{ id: string }> }
        ).forkCongThuc(userA, monGoc)) as { id: string };
        await expect(service.guiDuyet(banFork.id, userA)).rejects.toThrow('[REC-07]');
    }, 30000);

    it('món có cặp độc trả kèm cảnh báo mức cao', async () => {
        const mon = await prisma.recipe.create({
            data: {
                title: 'Chè sắn mật ong',
                cookTimeMinutes: 10,
                servings: 2,
                authorId: userA,
                status: 'APPROVED',
                ingredients: {
                    create: [
                        { originalText: '200g bột sắn sống', quantity: 200, unit: 'g', sortOrder: 1 },
                        { originalText: '50ml mật ong', quantity: 50, unit: 'ml', sortOrder: 2 },
                    ],
                },
            },
        });
        const chiTiet = (await service.layChiTiet(mon.id, userA)) as unknown as {
            canhBao: Array<{ muc: string }>;
        };
        expect(chiTiet.canhBao.length).toBeGreaterThan(0);
        expect(chiTiet.canhBao[0].muc).toBe('cao');
    }, 30000);
});
