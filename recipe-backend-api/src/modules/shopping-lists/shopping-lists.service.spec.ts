import { PrismaService } from '../../common/prisma.service';
import { ShoppingListsService } from './shopping-lists.service';

describe('ShoppingListsService lọc món hợp lệ (BR-SHOP)', () => {
    const prisma = new PrismaService();
    const service = new ShoppingListsService(prisma);
    const stamp = Date.now();
    let userId = '';
    let monXoa = '';
    let monRieng = '';
    let planId = '';

    beforeAll(async () => {
        const u = await prisma.user.create({
            data: { email: `shop-${stamp}@test.vn`, passwordHash: 'x', displayName: 'SH' },
        });
        userId = u.id;
        const xoa = await prisma.recipe.create({
            data: {
                title: 'Món đã xóa',
                cookTimeMinutes: 5,
                servings: 2,
                authorId: userId,
                status: 'APPROVED',
                deletedAt: new Date(),
                ingredients: { create: [{ originalText: '100g rau', quantity: 100, unit: 'g', sortOrder: 1 }] },
            },
        });
        monXoa = xoa.id;
        const rieng = await prisma.recipe.create({
            data: {
                title: 'Món riêng',
                cookTimeMinutes: 5,
                servings: 2,
                authorId: userId,
                status: 'APPROVED',
                riengTu: true,
                ingredients: { create: [{ originalText: '200g thịt', quantity: 200, unit: 'g', sortOrder: 1 }] },
            },
        });
        monRieng = rieng.id;
        const plan = await prisma.mealPlan.create({
            data: {
                userId,
                name: 'Tuần SH',
                startDate: new Date('2026-10-05T00:00:00'),
                endDate: new Date('2026-10-11T00:00:00'),
                items: {
                    create: [
                        { recipeId: monXoa, date: new Date('2026-10-06T00:00:00'), mealType: 'LUNCH', servings: 2, sortOrder: 0 },
                    ],
                },
            },
        });
        planId = plan.id;
    }, 30000);

    afterAll(async () => {
        await prisma.shoppingList.deleteMany({ where: { userId } });
        await prisma.mealPlan.deleteMany({ where: { userId } });
        await prisma.recipe.deleteMany({ where: { authorId: userId } });
        await prisma.user.deleteMany({ where: { id: userId } });
        await prisma.$disconnect();
    }, 30000);

    it('bỏ nguyên liệu món đã xóa mềm khỏi đi chợ', async () => {
        const list = await service.taoTuKeHoachAn(userId, planId);
        expect(list.cacMon).toHaveLength(0);
    }, 30000);

    it('không sinh đi chợ từ món riêng tư', async () => {
        await expect(service.taoTuCongThuc(userId, monRieng)).rejects.toThrow('[REC-04]');
    }, 30000);
});
