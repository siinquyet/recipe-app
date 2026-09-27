import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: '[AUTH-07] Mật khẩu cũ phải là chuỗi' })
  currentPassword: string;

  @IsString({ message: '[AUTH-02] Mật khẩu phải là chuỗi' })
  @MinLength(8, { message: '[AUTH-02] Mật khẩu tối thiểu 8 ký tự' })
  @MaxLength(72, { message: '[AUTH-02] Mật khẩu tối đa 72 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: '[AUTH-02] Mật khẩu mới phải có chữ hoa, chữ thường và số',
  })
  newPassword: string;
}