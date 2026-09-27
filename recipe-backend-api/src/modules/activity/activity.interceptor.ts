import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { ACTIVITY_METADATA_KEY, TrackActivityOptions } from './track-activity.decorator';
import { ActivityService } from './activity.service';

function isObject(v: any): boolean {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function sanitizeMetadata(input: any, maxSize = 4096): any {
  if (input == null) return undefined;
  try {
    const seen = new Set();
    const clone = JSON.parse(
      JSON.stringify(input, (key, value) => {
        if (typeof value === 'string' && value.length > 500) {
          return value.slice(0, 500);
        }
        if (typeof key === 'string') {
          const k = key.toLowerCase();
          if (k === 'password' || k === 'refreshToken' || k === 'accessToken' || k === 'token' || k === 'tokenmetadata') {
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
    if (str.length > maxSize) {
      return { truncated: true, preview: str.slice(0, 300) };
    }
    return clone;
  } catch {
    return undefined;
  }
}

@Injectable()
export class ActivityInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector, private readonly activityService: ActivityService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const meta = this.reflector.get<TrackActivityOptions & { type: string }>(ACTIVITY_METADATA_KEY, context.getHandler());
    if (!meta) return next.handle();

    const req = context.switchToHttp().getRequest();
    const user = req?.user;

    return next.handle().pipe(
      // Phải CHỜ ghi xong UserActivity trước khi trả response.
      // Nếu fire-and-forget (tap), request kế tiếp của client (ví dụ
      // GET /recommendations ngay sau khi mở 1 món) có thể đọc DB trước khi
      // INSERT kịp chạy -> BR-RECO-01 đếm thiếu tương tác.
      // ActivityService.log() đã tự nuốt lỗi ([LOG-01]) nên chờ ở đây là an toàn.
      concatMap(async (res: any) => {
        try {
          if (!user || !user.id) return res;
          const paramName = meta.entityIdParam ?? 'id';
          let entityId = req?.params?.[paramName] || req?.params?.id || (isObject(res) ? res.id : undefined);
          if (!entityId && isObject(res) && isObject(res.data)) {
            entityId = res.data.id;
          }
          if (!entityId) entityId = 'unknown';

          const md: any = {};
          if (req?.method === 'GET') {
            const q = req.query || {};
            if (Object.keys(q).length) md.query = q;
            if (req.path) md.path = req.path;
            if (req.headers?.referer) md.referrer = req.headers.referer;
          } else {
            const bodyMd = sanitizeMetadata(req.body);
            if (bodyMd) md.body = bodyMd;
            if (req.path) md.path = req.path;
          }
          const metadata = Object.keys(md).length ? sanitizeMetadata(md) : undefined;

          await this.activityService.log({
            userId: user.id,
            type: meta.type,
            entityType: meta.entityType,
            entityId,
            metadata,
          });
        } catch {
          // noop - [LOG-01] theo NFR
        }
        return res;
      }),
    );
  }
}