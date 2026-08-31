import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RecipeReferenceQueryDto {
  @ApiPropertyOptional({ description: 'Trang (0-based)', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number = 0;

  @ApiPropertyOptional({ description: 'Số item/trang (tối đa 50)', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  size?: number = 20;

  @ApiPropertyOptional({ description: 'Tìm theo tên', example: 'pizza' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'UNAVAILABLE'], description: 'Lọc theo trạng thái' })
  @IsOptional()
  @IsEnum(['ACTIVE', 'UNAVAILABLE'] as const)
  status?: string;

  @ApiPropertyOptional({ enum: ['SPOONACULAR'], description: 'Nguồn gốc' })
  @IsOptional()
  @IsEnum(['SPOONACULAR'] as const)
  source?: string;

  @ApiPropertyOptional({ description: 'Sắp xếp', default: 'createdAt:desc' })
  @IsOptional()
  @IsString()
  sort?: string = 'createdAt:desc';
}
