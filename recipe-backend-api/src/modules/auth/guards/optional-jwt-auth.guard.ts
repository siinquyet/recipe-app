import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard JWT "tùy chọn": cho phép request không đăng nhập vẫn đi qua,
 * nhưng nếu có token hợp lệ thì req.user được gán.
 *
 * Dùng cho các endpoint public cần biết người xem là ai (để ghi UserActivity,
 * hoặc để ADMIN xem thêm dữ liệu mà user thường không thấy).
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
    if (err || !user) {
      // Token thiếu/hết hạn/hợp lệ sai -> coi như khách vô danh, KHÔNG chặn request
      return undefined;
    }
    return user;
  }
}
