import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TaoBaoCaoDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    recipeId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    recipeReferenceId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    commentId?: string;

    @ApiProperty({ example: 'INAPPROPRIATE' })
    @IsString()
    @MinLength(1)
    @MaxLength(500)
    reason!: string;
}

export class XuLyBaoCaoDto {
    @ApiProperty({ example: 'RESOLVED', enum: ['RESOLVED', 'REJECTED'] })
    @IsIn(['RESOLVED', 'REJECTED'], { message: 'ADM-00 Trạng thái xử lý không hợp lệ' })
    trangThai!: 'RESOLVED' | 'REJECTED';

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    ghiChu?: string;
}
