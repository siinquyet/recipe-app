import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class RecipeIngredientDto {
  @IsOptional()
  @IsString()
  internalIngredientId?: string;

  @IsString({ message: '[REC-02] Mô tả nguyên liệu phải là chuỗi' })
  @MinLength(1, { message: '[REC-02] Mô tả nguyên liệu không được trống' })
  originalText: string;

  @IsNumber({}, { message: '[REC-02] Định lượng phải là số' })
  @Min(0, { message: '[REC-02] Định lượng không được âm' })
  quantity: number;

  @IsString({ message: '[REC-02] Đơn vị phải là chuỗi' })
  @MaxLength(20)
  unit: string;
}

export class RecipeStepDto {
  @IsString({ message: '[REC-03] Nội dung bước không được trống' })
  @MinLength(3, { message: '[REC-03] Nội dung bước tối thiểu 3 ký tự' })
  content: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class NutritionDto {
  @IsInt({ message: '[REC-04] Calories phải là số nguyên' })
  @Min(0)
  calories: number;

  @IsNumber({}, { message: '[REC-04] Protein phải là số' })
  @Min(0)
  protein: number;

  @IsNumber({}, { message: '[REC-04] Carbs phải là số' })
  @Min(0)
  carbs: number;

  @IsNumber({}, { message: '[REC-04] Fat phải là số' })
  @Min(0)
  fat: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fiber?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sugar?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sodium?: number;
}

export class CreateRecipeDto {
  @IsString({ message: '[REC-01] Tiêu đề phải là chuỗi' })
  @MinLength(5, { message: '[REC-01] Tiêu đề tối thiểu 5 ký tự' })
  @MaxLength(200, { message: '[REC-01] Tiêu đề tối đa 200 ký tự' })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsInt({ message: '[REC-01] Thời gian nấu phải là số nguyên phút' })
  @Min(1, { message: '[REC-01] Thời gian nấu tối thiểu 1 phút' })
  @Max(10080, { message: '[REC-01] Thời gian nấu tối đa 7 ngày (phút)' })
  cookTimeMinutes: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  prepTimeMinutes?: number;

  @IsInt({ message: '[REC-01] Số khẩu phần phải là số nguyên' })
  @Min(1, { message: '[REC-01] Số khẩu phần tối thiểu 1' })
  servings: number;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagNames?: string[];

  @IsArray({ message: '[REC-02] Nguyên liệu phải là mảng' })
  @ArrayMinSize(1, { message: '[REC-02] Cần ít nhất 1 nguyên liệu' })
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientDto)
  ingredients: RecipeIngredientDto[];

  @IsArray({ message: '[REC-03] Các bước phải là mảng' })
  @ArrayMinSize(1, { message: '[REC-03] Cần ít nhất 1 bước' })
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => RecipeStepDto)
  steps: RecipeStepDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => NutritionDto)
  nutrition?: NutritionDto;
}