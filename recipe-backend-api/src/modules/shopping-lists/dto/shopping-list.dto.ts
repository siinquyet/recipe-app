import { IsArray, IsInt, IsNumber, IsString, MinLength, MaxLength, Min, IsOptional, IsIn, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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
    @IsString({ message: 'SHOP-00 mealPlanId không hợp lệ' })
    mealPlanId!: string;
}

export class TaoTuCongThucDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsString({ message: 'SHOP-00 congThucId không hợp lệ' })
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
    @IsString()
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
    @IsString()
    nguonId?: string;

    @ApiProperty({ type: [MonMoiDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MonMoiDto)
    cacMon?: MonMoiDto[];
}
