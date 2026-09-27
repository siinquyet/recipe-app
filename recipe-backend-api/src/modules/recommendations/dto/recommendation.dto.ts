import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class RecommendationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '[RECO-04] limit phải là số nguyên' })
  @Min(1, { message: '[RECO-04] limit tối thiểu 1' })
  @Max(20, { message: '[RECO-04] limit tối đa 20' })
  limit?: number;
}

export class UpdatePreferencesDto {
  @IsOptional()
  @IsArray({ message: '[RECO-05] dietaryTags phải là mảng' })
  @ArrayMaxSize(20, { message: '[RECO-05] dietaryTags tối đa 20 mục' })
  @IsString({ each: true, message: '[RECO-05] mỗi dietaryTag phải là chuỗi' })
  @MaxLength(50, { each: true, message: '[RECO-05] dietaryTag tối đa 50 ký tự' })
  dietaryTags?: string[];

  @IsOptional()
  @IsArray({ message: '[RECO-05] allergies phải là mảng' })
  @ArrayMaxSize(20, { message: '[RECO-05] allergies tối đa 20 mục' })
  @IsString({ each: true, message: '[RECO-05] mỗi allergy phải là chuỗi' })
  @MaxLength(50, { each: true, message: '[RECO-05] allergy tối đa 50 ký tự' })
  allergies?: string[];

  @IsOptional()
  @IsArray({ message: '[RECO-05] cuisinePrefs phải là mảng' })
  @ArrayMaxSize(20, { message: '[RECO-05] cuisinePrefs tối đa 20 mục' })
  @IsString({ each: true, message: '[RECO-05] mỗi cuisinePref phải là chuỗi' })
  @MaxLength(50, { each: true, message: '[RECO-05] cuisinePref tối đa 50 ký tự' })
  cuisinePrefs?: string[];
}
