import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma.service';

const BCRYPT_COST = 12;
const ACCESS_TTL_SECONDS = 15 * 60;

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    thoiGianHetHan: number;
}

export interface JwtPayload {
    sub: string;
    email: string;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
        private readonly config: ConfigService,
    ) {}

    async dangKy(email: string, matKhau: string, tenHienThi: string): Promise<AuthTokens> {
        const tonTai = await this.prisma.user.findUnique({ where: { email } });
        if (tonTai) {
            throw new ConflictException({
                code: 'AUTH-01',
                message: '[AUTH-01] Email đã được sử dụng',
            });
        }

        const passwordHash = await bcrypt.hash(matKhau, BCRYPT_COST);
        await this.prisma.user.create({
            data: { email, passwordHash, displayName: tenHienThi, role: 'USER', status: 'ACTIVE' },
        });

        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new BadRequestException({
                code: 'AUTH-00',
                message: '[AUTH-00] Không thể tạo tài khoản',
            });
        }
        return this.taoTokens(user.id, user.email);
    }

    async dangNhap(email: string, matKhau: string): Promise<AuthTokens> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new UnauthorizedException({
                code: 'AUTH-02',
                message: '[AUTH-02] Email hoặc mật khẩu không chính xác',
            });
        }

        const hopLe = await bcrypt.compare(matKhau, user.passwordHash);
        if (!hopLe) {
            throw new UnauthorizedException({
                code: 'AUTH-02',
                message: '[AUTH-02] Email hoặc mật khẩu không chính xác',
            });
        }

        return this.taoTokens(user.id, user.email);
    }

    async lamMoiToken(refreshToken: string): Promise<AuthTokens> {
        let payload: JwtPayload;
        try {
            payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
                secret: this.config.get<string>('JWT_REFRESH_SECRET'),
            });
        } catch {
            throw new UnauthorizedException({
                code: 'AUTH-03',
                message: '[AUTH-03] Refresh token không hợp lệ hoặc đã hết hạn',
            });
        }

        const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user || user.status !== 'ACTIVE') {
            throw new UnauthorizedException({
                code: 'AUTH-03',
                message: '[AUTH-03] Tài khoản không hợp lệ',
            });
        }

        return this.taoTokens(user.id, user.email);
    }

    async layThongTinNguoiDung(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new UnauthorizedException({
                code: 'AUTH-02',
                message: '[AUTH-02] Người dùng không tồn tại',
            });
        }
        return {
            id: user.id,
            email: user.email,
            tenHienThi: user.displayName,
            anhDaiDien: user.avatarUrl ?? null,
            vaiTro: user.role,
            trangThai: user.status,
        };
    }

    private async taoTokens(userId: string, email: string): Promise<AuthTokens> {
        const payload: JwtPayload = { sub: userId, email };

        const accessToken = await this.jwt.signAsync(payload, {
            secret: this.config.get<string>('JWT_SECRET'),
            expiresIn: '15m',
        });

        const refreshToken = await this.jwt.signAsync(payload, {
            secret: this.config.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
        });

        return {
            accessToken,
            refreshToken,
            thoiGianHetHan: ACCESS_TTL_SECONDS,
        };
    }
}
