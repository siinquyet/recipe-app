import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'nguoidung@vidu.vn' })
    @IsEmail({}, { message: 'AUTH-00 Email không hợp lệ' })
    email!: string;

    @ApiProperty({ example: 'MatKhau123', minLength: 8, maxLength: 128 })
    @IsString()
    @MinLength(8, { message: 'AUTH-05 Mật khẩu tối thiểu 8 ký tự' })
    @MaxLength(128)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
        message: 'AUTH-05 Mật khẩu phải có chữ hoa, chữ thường và số',
    })
    matKhau!: string;

    @ApiProperty({ example: 'An Nguyen', minLength: 2, maxLength: 50 })
    @IsString()
    @MinLength(2, { message: 'AUTH-00 Tên hiển thị tối thiểu 2 ký tự' })
    @MaxLength(50, { message: 'AUTH-00 Tên hiển thị tối đa 50 ký tự' })
    tenHienThi!: string;
}

export class LoginDto {
    @ApiProperty({ example: 'nguoidung@vidu.vn' })
    @IsEmail({}, { message: 'AUTH-00 Email không hợp lệ' })
    email!: string;

    @ApiProperty({ example: 'MatKhau123', minLength: 8 })
    @IsString()
    @MinLength(8, { message: 'AUTH-00 Mật khẩu tối thiểu 8 ký tự' })
    matKhau!: string;
}

export class RefreshTokenDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    @IsString()
    refreshToken!: string;
}

export class QuenMatKhauDto {
    @ApiProperty({ example: 'nguoidung@vidu.vn' })
    @IsEmail({}, { message: 'AUTH-00 Email không hợp lệ' })
    email!: string;
}

export class DoiMatKhauDto {
    @ApiProperty({ example: 'MatKhau123' })
    @IsString()
    @MinLength(8, { message: 'AUTH-05 Mật khẩu tối thiểu 8 ký tự' })
    matKhauCu!: string;

    @ApiProperty({ example: 'MatKhauMoi456', minLength: 8, maxLength: 128 })
    @IsString()
    @MinLength(8, { message: 'AUTH-05 Mật khẩu tối thiểu 8 ký tự' })
    @MaxLength(128)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
        message: 'AUTH-05 Mật khẩu phải có chữ hoa, chữ thường và số',
    })
    matKhauMoi!: string;
}
