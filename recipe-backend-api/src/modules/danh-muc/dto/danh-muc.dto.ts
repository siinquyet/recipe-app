import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

function slugTuTen(ten: string): string {
    return ten
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export { slugTuTen };

export class TaoDanhMucDto {
    @ApiProperty({ example: 'Món mặn' })
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    ten!: string;

    @ApiProperty({ example: 'mon-man', required: false })
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    moTa?: string;
}

export class TaoNhanDto {
    @ApiProperty({ example: 'Ăn chay' })
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    ten!: string;

    @ApiProperty({ example: 'an-chay', required: false })
    @IsOptional()
    @IsString()
    slug?: string;
}
