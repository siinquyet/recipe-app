import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponseFormat<T> {
    success: boolean;
    data: T | null;
    error: ApiErrorFormat | null;
}

export interface ApiErrorFormat {
    code: string;
    message: string;
    details?: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponseFormat<T>> {
    intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponseFormat<T>> {
        return next.handle().pipe(
            map((data) => ({
                success: true,
                data: data ?? null,
                error: null,
            })),
        );
    }
}
