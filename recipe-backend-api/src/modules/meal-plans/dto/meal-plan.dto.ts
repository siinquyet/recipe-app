import { IsArray, IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export const CAC_BUOI_AN = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const;

export class MonMoiDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
    @IsOptional()
    @IsUUID('4', { message: 'MEAL-00 congThucId không hợp lệ' })
    congThucId?: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001', required: false })
    @IsOptional()
    @IsUUID('4', { message: 'MEAL-00 thamChieuId không hợp lệ' })
    thamChieuId?: string;

    @ApiProperty({ example: '2026-09-03' })
    @IsDateString({}, { message: 'MEAL-00 Ngày ăn không hợp lệ (YYYY-MM-DD)' })
    ngay!: string;

    @ApiProperty({ example: 'LUNCH', enum: CAC_BUOI_AN })
    @IsString()
    @IsIn([...CAC_BUOI_AN], { message: 'MEAL-00 Buổi ăn không hợp lệ' })
    buoiAn!: string;

    @ApiProperty({ example: 2 })
    @IsInt()
    @Min(1)
    khauPhan!: number;
}

export class TaoKeHoachAnDto {
    @ApiProperty({ example: 'Tuần 1' })
    @IsString()
    @MinLength(1, { message: 'MEAL-00 Tên kế hoạch không được trống' })
    @MaxLength(100)
    ten!: string;

    @ApiProperty({ example: '2026-09-01' })
    @IsDateString({}, { message: 'MEAL-00 Ngày bắt đầu không hợp lệ (YYYY-MM-DD)' })
    ngayBatDau!: string;

    @ApiProperty({ example: '2026-09-07' })
    @IsDateString({}, { message: 'MEAL-00 Ngày kết thúc không hợp lệ (YYYY-MM-DD)' })
    ngayKetThuc!: string;

    @ApiProperty({ type: [MonMoiDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MonMoiDto)
    cacMon?: MonMoiDto[];
}

export class CapNhatKeHoachAnDto {
    @ApiProperty({ example: 'Tuần 1 (sửa)', required: false })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    ten?: string;

    @ApiProperty({ example: '2026-09-01', required: false })
    @IsOptional()
    @IsDateString({}, { message: 'MEAL-00 Ngày bắt đầu không hợp lệ (YYYY-MM-DD)' })
    ngayBatDau?: string;

    @ApiProperty({ example: '2026-09-07', required: false })
    @IsOptional()
    @IsDateString({}, { message: 'MEAL-00 Ngày kết thúc không hợp lệ (YYYY-MM-DD)' })
    ngayKetThuc?: string;
}

export class CapNhatMonDto {
    @ApiProperty({ example: 4, required: false })
    @IsOptional()
    @IsInt()
    @Min(1, { message: 'MEAL-00 Khẩu phần tối thiểu 1' })
    khauPhan?: number;

    @ApiProperty({ example: '2026-09-03', required: false })
    @IsOptional()
    @IsDateString({}, { message: 'MEAL-00 Ngày ăn không hợp lệ (YYYY-MM-DD)' })
    ngay?: string;

    @ApiProperty({ example: 'DINNER', enum: CAC_BUOI_AN, required: false })
    @IsOptional()
    @IsString()
    @IsIn([...CAC_BUOI_AN], { message: 'MEAL-00 Buổi ăn không hợp lệ' })
    buoiAn?: string;
}
