import { PrismaService } from '../../common/prisma.service';
import { MealPlansService } from './meal-plans.service';

describe('MealPlansService toàn vẹn món (BR-MEAL)', () => {
    const prisma = new PrismaService();
    const service = new MealPlansService(prisma);
    const stamp = Date.now();
    let userA = '';
    let userB = '';
    let monA = '';
    let monRiengB = '';
    let planA = '';

    beforeAll(async () => {
        const a = await prisma.user.create({
            data: { email: `mp-a-${stamp}@test.vn`, passwordHash: 'x', displayName: 'MA' },
        });
        const b = await prisma.user.create({
            data: { email: `mp-b-${stamp}@test.vn`, passwordHash: 'x', displayName: 'MB' },
        });
        userA = a.id;
        userB = b.id;
        const mon = await prisma.recipe.create({
            data: { title: 'Món A', cookTimeMinutes: 5, servings: 2, authorId: userA, status: 'APPROVED' },
        });
        monA = mon.id;
        const rieng = await prisma.recipe.create({
            data: {
                title: 'Món riêng B',
                cookTimeMinutes: 5,
                servings: 2,
                authorId: userB,
                status: 'APPROVED',
                riengTu: true,
                nguonGocId: monA,
            },
        });
        monRiengB = rieng.id;
        const plan = await service.taoMoi(userA, {
            ten: 'Tuần A',
            ngayBatDau: '2026-10-05',
            ngayKetThuc: '2026-10-11',
        });
        planA = plan.id;
    }, 30000);

    afterAll(async () => {
        await prisma.mealPlan.deleteMany({ where: { userId: { in: [userA, userB] } } });
        await prisma.recipe.deleteMany({ where: { authorId: { in: [userA, userB] } } });
        await prisma.user.deleteMany({ where: { id: { in: [userA, userB] } } });
        await prisma.$disconnect();
    }, 30000);

    it('thêm món không kèm id nào thì 400', async () => {
        await expect(
            service.themMon(userA, planA, { ngay: '2026-10-06', buoiAn: 'LUNCH', khauPhan: 2 } as never),
        ).rejects.toThrow('[MEAL-08]');
    }, 30000);

    it('thêm món kèm cả 2 id thì 400', async () => {
        await expect(
            service.themMon(userA, planA, {
                congThucId: monA,
                thamChieuId: '00000000-0000-4000-8000-000000000000',
                ngay: '2026-10-06',
                buoiAn: 'LUNCH',
                khauPhan: 2,
            }),
        ).rejects.toThrow('[MEAL-08]');
    }, 30000);

    it('thêm món tham chiếu không tồn tại thì 404', async () => {
        await expect(
            service.themMon(userA, planA, {
                thamChieuId: '00000000-0000-4000-8000-000000000000',
                ngay: '2026-10-06',
                buoiAn: 'LUNCH',
                khauPhan: 2,
            }),
        ).rejects.toThrow('[REC-04]');
    }, 30000);

    it('không ké được món riêng tư của người khác vào kế hoạch', async () => {
        await expect(
            service.themMon(userA, planA, {
                congThucId: monRiengB,
                ngay: '2026-10-06',
                buoiAn: 'DINNER',
                khauPhan: 2,
            }),
        ).rejects.toThrow('[REC-04]');
    }, 30000);

    it('thu hẹp khoảng lấn món cũ thì 400 kèm số món', async () => {
        await service.themMon(userA, planA, {
            congThucId: monA,
            ngay: '2026-10-10',
            buoiAn: 'LUNCH',
            khauPhan: 2,
        });
        await expect(
            service.capNhat(userA, planA, { ngayBatDau: '2026-10-05', ngayKetThuc: '2026-10-06' }),
        ).rejects.toThrow('[MEAL-06]');
    }, 30000);
});
