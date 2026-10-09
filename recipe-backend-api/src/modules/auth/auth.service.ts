import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
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
    // BR-AUTH: Phiên bản token — đổi mật khẩu thì refresh cũ hết hiệu lực
    phienBan?: number;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
        private readonly config: ConfigService,
    ) {}

    async dangKy(email: string, matKhau: string, tenHienThi: string): Promise<AuthTokens> {
        // BR-AUTH: Chuẩn hóa email để Abc@X.vn và abc@x.vn là một tài khoản
        const emailChuan = email.trim().toLowerCase();
        const tonTai = await this.prisma.user.findUnique({ where: { email: emailChuan } });
        if (tonTai) {
            throw new ConflictException({
                code: 'AUTH-01',
                message: '[AUTH-01] Email đã được sử dụng',
            });
        }

        const passwordHash = await bcrypt.hash(matKhau, BCRYPT_COST);
        try {
            const user = await this.prisma.user.create({
                data: { email: emailChuan, passwordHash, displayName: tenHienThi, role: 'USER', status: 'ACTIVE' },
            });
            return this.taoTokens(user.id, user.email, user.tokenVersion);
        } catch (e) {
            // BR-AUTH: Đăng ký đồng thời cùng email — unique DB thắng, trả 409 thay vì 500
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new ConflictException({
                    code: 'AUTH-01',
                    message: '[AUTH-01] Email đã được sử dụng',
                });
            }
            throw e;
        }
    }

    async dangNhap(email: string, matKhau: string): Promise<AuthTokens> {
        const user = await this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
        if (!user) {
            throw new UnauthorizedException({
                code: 'AUTH-02',
                message: '[AUTH-02] Email hoặc mật khẩu không chính xác',
            });
        }

        // BR-AUTH: Chặn tài khoản BANNED đăng nhập
        if (user.status === 'BANNED') {
            throw new UnauthorizedException({
                code: 'AUTH-04',
                message: '[AUTH-04] Tài khoản đã bị khóa',
            });
        }

        const hopLe = await bcrypt.compare(matKhau, user.passwordHash);
        if (!hopLe) {
            throw new UnauthorizedException({
                code: 'AUTH-02',
                message: '[AUTH-02] Email hoặc mật khẩu không chính xác',
            });
        }

        return this.taoTokens(user.id, user.email, user.tokenVersion);
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
        // BR-AUTH: Refresh issued trước lần đổi mật khẩu gần nhất thì hết hiệu lực
        if (payload.phienBan !== undefined && payload.phienBan !== user.tokenVersion) {
            throw new UnauthorizedException({
                code: 'AUTH-03',
                message: '[AUTH-03] Phiên đăng nhập đã hết hiệu lực, vui lòng đăng nhập lại',
            });
        }

        return this.taoTokens(user.id, user.email, user.tokenVersion);
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

    // BR-AUTH: Quên mật khẩu — luôn trả lời chung để chống dò email, gửi mail sẽ làm ở bước sau
    async quenMatKhau(email: string) {
        await this.prisma.user.findUnique({ where: { email } });
        return { daGui: true };
    }

    async doiMatKhau(userId: string, matKhauCu: string, matKhauMoi: string) {
        // BR-AUTH: Đổi mật khẩu — xác thực mật khẩu cũ trước khi cho đặt mới
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new UnauthorizedException({
                code: 'AUTH-02',
                message: '[AUTH-02] Người dùng không tồn tại',
            });
        }
        const dungCu = await bcrypt.compare(matKhauCu, user.passwordHash);
        if (!dungCu) {
            throw new BadRequestException({
                code: 'AUTH-06',
                message: '[AUTH-06] Mật khẩu cũ không đúng',
            });
        }
        if (matKhauCu === matKhauMoi) {
            throw new BadRequestException({
                code: 'AUTH-07',
                message: '[AUTH-07] Mật khẩu mới phải khác mật khẩu cũ',
            });
        }
        const passwordHash = await bcrypt.hash(matKhauMoi, BCRYPT_COST);
        // BR-AUTH: Tăng phiên bản token để thu hồi mọi refresh token đã cấp trước đó
        await this.prisma.user.update({ where: { id: userId }, data: { passwordHash, tokenVersion: { increment: 1 } } });
        return { thanhCong: true };
    }

    private async taoTokens(userId: string, email: string, phienBan = 0): Promise<AuthTokens> {
        const payload: JwtPayload = { sub: userId, email };

        const accessToken = await this.jwt.signAsync(payload, {
            secret: this.config.get<string>('JWT_SECRET'),
            expiresIn: '15m',
        });

        const refreshToken = await this.jwt.signAsync({ ...payload, phienBan }, {
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
