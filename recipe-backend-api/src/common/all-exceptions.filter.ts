import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorFormat } from './response.interceptor';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let error: ApiErrorFormat = {
            code: 'SYS-00',
            message: 'Lỗi hệ thống',
        };

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'string') {
                error = { code: mapStatusToCode(status), message: res };
            } else if (typeof res === 'object' && res !== null) {
                const obj = res as Record<string, unknown>;
                const message = (obj.message as string | string[]) ?? exception.message;
                error = {
                    code: (obj.code as string) ?? mapStatusToCode(status),
                    message: Array.isArray(message) ? message.join('; ') : message,
                    details: obj.details as string | undefined,
                };
            }
        } else if (exception instanceof Error) {
            this.logger.error(exception.message, exception.stack);
            error.message = exception.message;
        }

        response.status(status).json({
            success: false,
            data: null,
            error,
        });
    }
}

function mapStatusToCode(status: number): string {
    switch (status) {
        case 400:
            return 'VAL-00';
        case 401:
            return 'AUTH-02';
        case 403:
            return 'AUTH-04';
        case 404:
            return 'NOT-01';
        case 409:
            return 'DUP-01';
        case 429:
            return 'RATE-01';
        default:
            return 'SYS-00';
    }
}
