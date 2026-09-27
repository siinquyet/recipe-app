import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: '[AUTH-04] Email không hợp lệ' })
  email: string;

  @IsString({ message: '[AUTH-05] Mật khẩu không được bỏ trống' })
  password: string;
}