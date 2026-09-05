import { IsInt, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';

export class TaoDanhGiaDto {
    @IsInt()
    @Min(1, { message: 'RATE-00 Điểm phải từ 1 đến 5' })
    @Max(5, { message: 'RATE-00 Điểm phải từ 1 đến 5' })
    diem!: number;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    binhLuan?: string;
}
