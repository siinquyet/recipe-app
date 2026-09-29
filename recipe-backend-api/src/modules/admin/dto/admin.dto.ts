import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DoiRoleDto {
    @ApiProperty({ example: 'ADMIN', enum: ['USER', 'ADMIN'] })
    @IsIn(['USER', 'ADMIN'], { message: 'ADM-00 role phải là USER hoặc ADMIN' })
    role!: 'USER' | 'ADMIN';
}

export class TuChoiBaiDto {
    @ApiProperty({ example: 'Ảnh mờ, thiếu định lượng nguyên liệu' })
    @IsString()
    @MinLength(1, { message: 'ADM-00 Lý do từ chối không được trống' })
    @MaxLength(500)
    lyDo!: string;
}
