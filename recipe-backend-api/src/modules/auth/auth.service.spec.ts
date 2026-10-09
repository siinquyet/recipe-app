import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';
import { JwtStrategy } from '../../common/jwt.strategy';
import { AuthService } from './auth.service';

describe('AuthService hardening (BR-AUTH)', () => {
    const prisma = new PrismaService();
    const config = new ConfigService({
        JWT_SECRET: 'test-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
    });
    const jwt = new JwtService({ secret: 'test-secret' });
    const service = new AuthService(prisma, jwt, config);
    const strategy = new JwtStrategy(config, prisma);
    const stamp = Date.now();
    const createdIds: string[] = [];

    afterAll(async () => {
        await prisma.user.deleteMany({ where: { id: { in: createdIds } } });
        await prisma.$disconnect();
    }, 30000);

    it('chuẩn hóa email hoa/thường khi đăng ký', async () => {
        const tokens = await service.dangKy(`NguoiDung${stamp}@Test.VN`, 'Matkhau123', 'Người Dùng');
        expect(tokens.accessToken).toBeTruthy();
        const user = await prisma.user.findFirst({ where: { displayName: 'Người Dùng' } });
        createdIds.push(user!.id);
        expect(user!.email).toBe(`nguoidung${stamp}@test.vn`);
    }, 30000);

    it('đăng ký trùng email báo 409 AUTH-01', async () => {
        await expect(service.dangKy(`nguoidung${stamp}@test.vn`, 'Matkhau123', 'Trùng')).rejects.toThrow(
            '[AUTH-01]',
        );
    }, 30000);

    it('refresh token cũ mất hiệu lực sau khi đổi mật khẩu', async () => {
        const me = await service.dangKy(`doimk${stamp}@test.vn`, 'Matkhau123', 'Đổi MK');
        createdIds.push((await prisma.user.findFirst({ where: { email: `doimk${stamp}@test.vn` } }))!.id);
        const cu = await service.dangNhap(`doimk${stamp}@test.vn`, 'Matkhau123');
        await service.doiMatKhau(
            (await prisma.user.findFirst({ where: { email: `doimk${stamp}@test.vn` } }))!.id,
            'Matkhau123',
            'MatkhauMoi456',
        );
        await expect(service.lamMoiToken(cu.refreshToken)).rejects.toThrow('[AUTH-03]');
        expect(me.accessToken).toBeTruthy();
    }, 30000);

    it('strategy chặn tài khoản BANNED và user không tồn tại', async () => {
        const u = await prisma.user.create({
            data: { email: `khoa${stamp}@test.vn`, passwordHash: 'x', displayName: 'K', status: 'BANNED' },
        });
        createdIds.push(u.id);
        await expect(strategy.validate({ sub: u.id, email: u.email })).rejects.toThrow('[AUTH-02]');
        await expect(
            strategy.validate({ sub: '00000000-0000-0000-0000-000000000000', email: 'x@y.vn' }),
        ).rejects.toThrow('[AUTH-02]');
    }, 30000);
});
