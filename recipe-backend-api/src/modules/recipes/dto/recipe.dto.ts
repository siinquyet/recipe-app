import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NguyenLieuMoiDto {
    @ApiProperty({ example: 'Thịt ba chỉ' })
    @IsString()
    @MinLength(1)
    @MaxLength(200)
    ten!: string;

    @ApiProperty({ example: 500 })
    @IsNumber()
    @Min(0)
    dinhLuong!: number;

    @ApiProperty({ example: 'g' })
    @IsString()
    @MaxLength(20)
    donVi!: string;
}

export class BuocMoiDto {
    @ApiProperty({ example: 'Ướp thịt với mắm, đường 15 phút' })
    @IsString()
    @MinLength(1)
    noiDung!: string;
}

export class DinhDuongMoiDto {
    @ApiProperty({ example: 450 })
    @IsInt()
    @Min(0)
    calo!: number;

    @ApiProperty({ example: 25 })
    @IsNumber()
    @Min(0)
    protein!: number;

    @ApiProperty({ example: 30 })
    @IsNumber()
    @Min(0)
    carb!: number;

    @ApiProperty({ example: 15 })
    @IsNumber()
    @Min(0)
    chatBeo!: number;
}

export class TaoCongThucDto {
    @ApiProperty({ example: 'Thịt kho tàu' })
    @IsString()
    @MinLength(1)
    @MaxLength(200)
    ten!: string;

    @ApiProperty({ example: 'Món kho đậm đà đưa cơm', required: false })
    @IsOptional()
    @IsString()
    moTa?: string;

    @ApiProperty({ example: '/uploads/anh-1.jpg', required: false })
    @IsOptional()
    @IsString()
    anhThumbnail?: string;

    @ApiProperty({ example: 30 })
    @IsInt()
    @Min(1)
    thoiGianNauPhut!: number;

    @ApiProperty({ example: 15, required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    thoiGianChuanBiPhut?: number;

    @ApiProperty({ example: 4 })
    @IsInt()
    @Min(1)
    khauPhan!: number;

    @ApiProperty({ type: [NguyenLieuMoiDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => NguyenLieuMoiDto)
    nguyenLieu!: NguyenLieuMoiDto[];

    @ApiProperty({ type: [BuocMoiDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BuocMoiDto)
    cacBuoc!: BuocMoiDto[];

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
    @IsOptional()
    @IsString()
    danhMucId?: string;

    @ApiProperty({ type: [String], example: ['uuid-tag-1'], required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tagIds?: string[];

    @ApiProperty({ type: DinhDuongMoiDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => DinhDuongMoiDto)
    dinhDuong?: DinhDuongMoiDto;
}

export class CapNhatCongThucDto {
    @ApiProperty({ example: 'Thịt kho tàu', required: false })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(200)
    ten?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    moTa?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    anhThumbnail?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    @Min(1)
    thoiGianNauPhut?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    thoiGianChuanBiPhut?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    @Min(1)
    khauPhan?: number;

    @ApiProperty({ type: [NguyenLieuMoiDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => NguyenLieuMoiDto)
    nguyenLieu?: NguyenLieuMoiDto[];

    @ApiProperty({ type: [BuocMoiDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BuocMoiDto)
    cacBuoc?: BuocMoiDto[];
}
