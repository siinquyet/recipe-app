import { IsString, IsOptional, IsEnum, IsNotEmpty, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInternalIngredientDto {
  @ApiProperty({ example: 'thịt bò' })
  @IsString()
  @IsNotEmpty()
  canonicalName: string;

  @ApiPropertyOptional({ description: 'Để trống sẽ auto-normalize', example: 'thit bo' })
  @IsOptional()
  @IsString()
  normalizedName?: string;

  @ApiPropertyOptional({ enum: ['meat', 'vegetable', 'spice', 'dairy', 'grain', 'seafood', 'fruit', 'other'] })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: ['MASS', 'VOLUME', 'COUNT'], default: 'COUNT' })
  @IsOptional()
  @IsEnum(['MASS', 'VOLUME', 'COUNT'] as const)
  unitCategory?: string;

  @ApiPropertyOptional({ example: 'g' })
  @IsOptional()
  @IsString()
  defaultUnit?: string;
}

export class CreateIngredientMappingDto {
  @ApiProperty({ description: 'ID InternalIngredient' })
  @IsString()
  @IsNotEmpty()
  internalIngredientId: string;

  @ApiProperty({ example: 'beef, ground' })
  @IsString()
  @IsNotEmpty()
  externalName: string;

  @ApiPropertyOptional({ enum: ['SPOONACULAR'], default: 'SPOONACULAR' })
  @IsOptional()
  @IsEnum(['SPOONACULAR'] as const)
  source?: string;

  @ApiPropertyOptional({ default: 1.0, description: 'Độ tin cậy 0-1' })
  @IsOptional()
  confidence?: number;
}

export class IngredientQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

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
}
