import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AUDIT_METADATA_KEY } from './audit-log.decorator';
import { AuditService } from './audit.service';

function isObject(v: any): boolean {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function sanitizePayload(input: any, maxSize = 4096): any {
  if (input == null) return undefined;
  try {
    const seen = new Set();
    const clone = JSON.parse(
      JSON.stringify(input, (key, value) => {
        if (typeof value === 'string' && value.length > 500) return value.slice(0, 500);
        if (typeof key === 'string') {
          const k = key.toLowerCase();
          if (k === 'password' || k === 'refreshToken' || k === 'accessToken' || k === 'token') {
            return undefined;
          }
        }
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) return '[Circular]';
          seen.add(value);
        }
        return value;
      }),
    );
    const str = JSON.stringify(clone);
    if (str.length > maxSize) return { truncated: true, preview: str.slice(0, 300) };
    return clone;
  } catch {
    return undefined;
  }
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector, private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const meta = this.reflector.get<any>(AUDIT_METADATA_KEY, context.getHandler()) as
      | { action: any; entityType: string; entityIdParam?: string }
      | undefined;
    if (!meta) return next.handle();

    const req = context.switchToHttp().getRequest();
    const user = req?.user;

    return next.handle().pipe(
      tap(async (res: any) => {
        try {
          if (!user || !user.id) return;
          const paramName = meta.entityIdParam ?? 'id';
          let entityId = req?.params?.[paramName] || req?.params?.id || (isObject(res) ? res.id : undefined);
          if (!entityId && isObject(res) && isObject(res.data)) {
            entityId = res.data.id;
          }
          if (!entityId) entityId = 'unknown';

          let action = meta.action;
          if (typeof action === 'function') {
            try {
              action = action(req, res);
            } catch {
              action = 'UNKNOWN';
            }
          }
          if (!action) action = 'UNKNOWN';

          const ipAddress = req?.headers?.['x-forwarded-for'] || req?.ip || req?.connection?.remoteAddress;
          const userAgent = req?.headers?.['user-agent'];

          await this.auditService.log({
            userId: user.id,
            action: action as any,
            entityType: meta.entityType,
            entityId,
            oldData: undefined,
            newData: sanitizePayload(res),
            ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
            userAgent,
          });
        } catch {
          // noop
        }
      }),
    );
  }
}