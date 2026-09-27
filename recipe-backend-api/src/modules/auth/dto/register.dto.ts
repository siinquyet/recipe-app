import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: '[AUTH-01] Email không hợp lệ' })
  email: string;

  @IsString({ message: '[AUTH-02] Mật khẩu phải là chuỗi' })
  @MinLength(8, { message: '[AUTH-02] Mật khẩu tối thiểu 8 ký tự' })
  @MaxLength(72, { message: '[AUTH-02] Mật khẩu tối đa 72 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: '[AUTH-02] Mật khẩu phải có chữ hoa, chữ thường và số',
  })
  password: string;

  @IsString({ message: '[AUTH-03] Tên hiển thị phải là chuỗi' })
  @MinLength(2, { message: '[AUTH-03] Tên hiển thị tối thiểu 2 ký tự' })
  @MaxLength(50, { message: '[AUTH-03] Tên hiển thị tối đa 50 ký tự' })
  displayName: string;
}