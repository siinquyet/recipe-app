import { IsArray, IsDateString, IsInt, IsNumber, IsString, Matches, MinLength, MaxLength, Min, IsOptional, IsIn, IsBoolean, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CapNhatDanhSachDto {
    @ApiProperty({ example: 'Đi chợ cuối tuần (sửa)', required: false })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    ten?: string;

    @ApiProperty({ example: 'COMPLETED', enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED'], required: false })
    @IsOptional()
    @IsIn(['ACTIVE', 'COMPLETED', 'ARCHIVED'], { message: 'SHOP-00 trangThai không hợp lệ' })
    trangThai?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}

export class CapNhatTrangThaiMonDto {
    @ApiProperty({ example: true })
    @IsBoolean({ message: 'SHOP-00 daChon phải là true/false' })
    daChon!: boolean;
}

export class SuaMonDiChoDto {
    @ApiProperty({ example: '500g thịt bò băm', required: false })
    @IsOptional()
    @IsString()
    @MinLength(1)
    tenGoc?: string;

    @ApiProperty({ example: 500, required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    dinhLuong?: number;

    @ApiProperty({ example: 'g', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    donVi?: string;

    @ApiProperty({ example: true, required: false })
    @IsOptional()
    @IsBoolean()
    daChon?: boolean;
}

export class TaoTuKeHoachAnDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID('4', { message: 'SHOP-00 mealPlanId không hợp lệ' })
    mealPlanId!: string;

    // BR-SHOP: Chọn ngày hoặc cả tuần — trống nghĩa là cả kế hoạch
    @ApiProperty({ example: '2026-09-01', required: false })
    @IsOptional()
    @IsDateString({}, { message: 'SHOP-00 tuNgay không hợp lệ (YYYY-MM-DD)' })
    tuNgay?: string;

    @ApiProperty({ example: '2026-09-07', required: false })
    @IsOptional()
    @IsDateString({}, { message: 'SHOP-00 denNgay không hợp lệ (YYYY-MM-DD)' })
    denNgay?: string;

    // BR-SHOP: Tick chọn từng ngày T2..CN — trống nghĩa là cả kế hoạch
    @ApiProperty({ example: ['2026-09-01', '2026-09-03'], required: false })
    @IsOptional()
    @IsArray({ message: 'SHOP-00 cacNgay phải là mảng ngày' })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { each: true, message: 'SHOP-00 cacNgay chứa ngày không hợp lệ (YYYY-MM-DD)' })
    cacNgay?: string[];
}

export class TaoTuCongThucDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID('4', { message: 'SHOP-00 congThucId không hợp lệ' })
    congThucId!: string;

    @ApiProperty({ example: 4, required: false })
    @IsOptional()
    @IsInt()
    @Min(1)
    khauPhan?: number;
}

export class MonMoiDto {
    @ApiProperty({ example: '500g thịt bò băm' })
    @IsString()
    @MinLength(1)
    tenGoc!: string;

    @ApiProperty({ example: 500 })
    @IsNumber()
    @Min(0)
    dinhLuong!: number;

    @ApiProperty({ example: 'g' })
    @IsString()
    @MaxLength(20)
    donVi!: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID('4', { message: 'SHOP-00 nguyenLieuId không hợp lệ' })
    nguyenLieuId?: string;
}

export class TaoDanhSachDiChoDto {
    @ApiProperty({ example: 'Đi chợ cuối tuần' })
    @IsString()
    @MinLength(1, { message: 'SHOP-00 Tên danh sách không được trống' })
    @MaxLength(100)
    ten!: string;

    @ApiProperty({ example: 'MANUAL', enum: ['RECIPE', 'MEAL_PLAN', 'MANUAL'] })
    @IsIn(['RECIPE', 'MEAL_PLAN', 'MANUAL'], {
        message: 'SHOP-00 loaiNguon phải là RECIPE, MEAL_PLAN hoặc MANUAL',
    })
    loaiNguon!: 'RECIPE' | 'MEAL_PLAN' | 'MANUAL';

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
    @IsOptional()
    @IsUUID('4', { message: 'SHOP-00 nguonId không hợp lệ' })
    nguonId?: string;

    @ApiProperty({ type: [MonMoiDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MonMoiDto)
    cacMon?: MonMoiDto[];
}
