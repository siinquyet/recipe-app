import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { RecipeStatus } from '@prisma/client';

export class RecipeQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  size: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(RecipeStatus, { message: '[REC-05] Trạng thái không hợp lệ' })
  status?: RecipeStatus;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  tagNames?: string[];

  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'title', 'updatedAt'], { message: '[REC-05] Trường sort không hợp lệ' })
  sortBy: string = 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'], { message: '[REC-05] Hướng sort chỉ asc/desc' })
  sortDirection: 'asc' | 'desc' = 'desc';
}