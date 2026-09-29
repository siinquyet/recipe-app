import { IsInt, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TaoDanhGiaDto {
    @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
    @IsInt()
    @Min(1, { message: 'RATE-00 Điểm phải từ 1 đến 5' })
    @Max(5, { message: 'RATE-00 Điểm phải từ 1 đến 5' })
    diem!: number;

    @ApiProperty({ example: 'Rất ngon, sẽ nấu lại', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    binhLuan?: string;
}
