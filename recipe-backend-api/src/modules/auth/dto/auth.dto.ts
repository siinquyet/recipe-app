import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'AUTH-00 Email không hợp lệ' })
    email!: string;

    @IsString()
    @MinLength(8, { message: 'AUTH-05 Mật khẩu tối thiểu 8 ký tự' })
    @MaxLength(128)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
        message: 'AUTH-05 Mật khẩu phải có chữ hoa, chữ thường và số',
    })
    matKhau!: string;

    @IsString()
    @MinLength(2, { message: 'AUTH-00 Tên hiển thị tối thiểu 2 ký tự' })
    @MaxLength(50, { message: 'AUTH-00 Tên hiển thị tối đa 50 ký tự' })
    tenHienThi!: string;
}

export class LoginDto {
    @IsEmail({}, { message: 'AUTH-00 Email không hợp lệ' })
    email!: string;

    @IsString()
    @MinLength(8, { message: 'AUTH-00 Mật khẩu tối thiểu 8 ký tự' })
    matKhau!: string;
}

export class RefreshTokenDto {
    @IsString()
    refreshToken!: string;
}
