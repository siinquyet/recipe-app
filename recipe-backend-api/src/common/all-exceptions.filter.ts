import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorFormat } from './response.interceptor';
import { MulterError } from 'multer';

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
        } else if (exception instanceof MulterError) {
            // BR-UPLOAD: Xử lý lỗi Multer bằng tiếng Việt
            status = HttpStatus.BAD_REQUEST;
            switch (exception.code) {
                case 'LIMIT_FILE_SIZE':
                    error = { code: 'UP-03', message: '[UP-03] File quá lớn, tối đa 5MB' };
                    break;
                case 'LIMIT_FILE_COUNT':
                    error = { code: 'UP-04', message: '[UP-04] Quá nhiều file, tối đa 1 file' };
                    break;
                case 'LIMIT_UNEXPECTED_FILE':
                    error = { code: 'UP-05', message: '[UP-05] Field file không đúng' };
                    break;
                default:
                    error = { code: 'UP-00', message: `[UP-00] Lỗi tải file: ${exception.message}` };
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
