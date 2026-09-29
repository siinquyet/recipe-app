import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// BR-UREC: Route công khai nhưng nhận diện chủ bài khi có token (để thấy nháp của mình)
@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<{ headers?: Record<string, string> }>();
        if (!req.headers?.authorization) return true;
        return (await super.canActivate(context)) as boolean;
    }
}
