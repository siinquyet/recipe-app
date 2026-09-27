import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../interfaces/token-payload.interface';

export interface RefreshTokenPayload extends TokenPayload {
  tokenType: 'refresh';
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET', 'default-refresh-secret'),
    });
  }

  async validate(payload: RefreshTokenPayload) {
    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('[AUTH-08] Refresh token không hợp lệ');
    }
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}