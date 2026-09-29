import { IsString, MinLength, MaxLength, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TaoBinhLuanDto {
    @ApiProperty({ example: 'Món này ngon quá!' })
    @IsString()
    @MinLength(1, { message: 'CMT-00 Nội dung bình luận không được trống' })
    @MaxLength(1000)
    noiDung!: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
    @IsOptional()
    @IsUUID()
    chaId?: string;
}
