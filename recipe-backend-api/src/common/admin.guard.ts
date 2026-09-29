import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from './prisma.service';

// BR-ADM: Chắn mọi route /admin/* — chỉ ADMIN đang ACTIVE mới qua
@Injectable()
export class AdminGuard extends AuthGuard('jwt') {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const xong = (await super.canActivate(context)) as boolean;
        if (!xong) return false;
        const req = context.switchToHttp().getRequest<{ user: { id: string } }>();
        const user = await this.prisma.user.findUnique({
            where: { id: req.user.id },
            select: { role: true, status: true },
        });
        if (!user || user.role !== 'ADMIN' || user.status !== 'ACTIVE') {
            throw new ForbiddenException({
                code: 'ADM-03',
                message: '[ADM-03] Cần quyền quản trị',
            });
        }
        return true;
    }
}
