import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';

export interface JwtPayload {
    sub: string;
    email: string;
    phienBan?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        config: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) {
            throw new Error('[AUTH-00] Thiếu JWT_SECRET — không khởi động với secret mặc định');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: JwtPayload) {
        if (!payload?.sub) {
            throw new UnauthorizedException({
                code: 'AUTH-02',
                message: '[AUTH-02] Token không hợp lệ',
            });
        }
        // BR-AUTH: Tài khoản BANNED/xóa dùng token cũ cũng bị chặn ngay, không chờ hết hạn
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, email: true, status: true },
        });
        if (!user || user.status !== 'ACTIVE') {
            throw new UnauthorizedException({
                code: 'AUTH-02',
                message: '[AUTH-02] Tài khoản không còn hiệu lực',
            });
        }
        return { id: user.id, email: user.email };
    }
}
