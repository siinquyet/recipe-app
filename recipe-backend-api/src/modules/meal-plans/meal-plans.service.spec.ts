import { PrismaService } from '../../common/prisma.service';
import { MealPlansService } from './meal-plans.service';

describe('MealPlansService ngày giờ (BR-MEAL)', () => {
    const prisma = new PrismaService();
    const service = new MealPlansService(prisma);
    const stamp = Date.now();
    let userId = '';
    let monId = '';

    beforeAll(async () => {
        const u = await prisma.user.create({
            data: { email: `meal-tz-${stamp}@test.vn`, passwordHash: 'x', displayName: 'TZ' },
        });
        userId = u.id;
        const mon = await prisma.recipe.create({
            data: { title: 'Món TZ', cookTimeMinutes: 5, servings: 2, authorId: userId, status: 'APPROVED' },
        });
        monId = mon.id;
    }, 30000);

    afterAll(async () => {
        await prisma.mealPlan.deleteMany({ where: { userId } });
        await prisma.recipe.deleteMany({ where: { authorId: userId } });
        await prisma.user.deleteMany({ where: { id: userId } });
        await prisma.$disconnect();
    }, 30000);

    it('thêm món ngày 10-08 thì đọc ra vẫn 10-08 (không lệch múi giờ)', async () => {
        const plan = await service.taoMoi(userId, {
            ten: 'Tuần TZ',
            ngayBatDau: '2026-10-05',
            ngayKetThuc: '2026-10-11',
        });
        await service.themMon(userId, plan.id, {
            congThucId: monId,
            ngay: '2026-10-08',
            buoiAn: 'LUNCH',
            khauPhan: 2,
        });
        const chiTiet = await service.layChiTiet(plan.id, userId);
        expect(chiTiet.ngayBatDau).toBe('2026-10-05');
        expect(chiTiet.ngayKetThuc).toBe('2026-10-11');
        expect(chiTiet.cacMon[0].ngay).toBe('2026-10-08');
    }, 30000);
});
