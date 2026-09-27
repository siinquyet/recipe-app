import { IsString, MinLength } from 'class-validator';

export class RefreshDto {
  @IsString({ message: '[AUTH-06] Refresh token phải là chuỗi' })
  @MinLength(10, { message: '[AUTH-06] Refresh token không hợp lệ' })
  refreshToken: string;
}