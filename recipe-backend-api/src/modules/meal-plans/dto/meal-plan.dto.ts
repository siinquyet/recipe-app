import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { MealType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMealPlanDto {
  @ApiProperty({ example: 'Tuần 1/9 - 7/9' })
  @IsString({ message: '[MEAL-01] Tên kế hoạch phải là chuỗi' })
  @MinLength(3, { message: '[MEAL-01] Tên kế hoạch tối thiểu 3 ký tự' })
  @MaxLength(200, { message: '[MEAL-01] Tên kế hoạch tối đa 200 ký tự' })
  name: string;

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate({ message: '[MEAL-02] Ngày bắt đầu không hợp lệ' })
  startDate: Date;

  @ApiProperty({ example: '2026-09-07T23:59:59.000Z' })
  @Type(() => Date)
  @IsDate({ message: '[MEAL-02] Ngày kết thúc không hợp lệ' })
  endDate: Date;
}

export class UpdateMealPlanDto {
  @ApiPropertyOptional({ example: 'Tuần 2/9 - 8/9' })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: '[MEAL-01] Tên kế hoạch tối thiểu 3 ký tự' })
  @MaxLength(200, { message: '[MEAL-01] Tên kế hoạch tối đa 200 ký tự' })
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: '[MEAL-02] Ngày bắt đầu không hợp lệ' })
  startDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: '[MEAL-02] Ngày kết thúc không hợp lệ' })
  endDate?: Date;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean({ message: '[MEAL-01] isActive phải là true/false' })
  isActive?: boolean;
}

export class CreateMealPlanItemDto {
  @ApiPropertyOptional({ description: 'ID công thức nội bộ (XOR recipeReferenceId)' })
  @IsOptional()
  @ValidateIf((o: CreateMealPlanItemDto) => !o.recipeReferenceId)
  @IsUUID('4', { message: '[MEAL-06] recipeId phải là UUID hợp lệ' })
  recipeId?: string;

  @ApiPropertyOptional({ description: 'ID công thức tham khảo Spoonacular (XOR recipeId)' })
  @IsOptional()
  @ValidateIf((o: CreateMealPlanItemDto) => !o.recipeId)
  @IsUUID('4', { message: '[MEAL-06] recipeReferenceId phải là UUID hợp lệ' })
  recipeReferenceId?: string;

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate({ message: '[MEAL-02] Ngày của món không hợp lệ' })
  date: Date;

  @ApiProperty({ enum: MealType, example: MealType.LUNCH })
  @IsEnum(MealType, { message: '[MEAL-01] Loại bữa không hợp lệ (BREAKFAST/LUNCH/DINNER/SNACK)' })
  mealType: MealType;

  @ApiPropertyOptional({ description: 'Khẩu phần override, mặc định lấy khẩu phần của công thức', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '[MEAL-03] Khẩu phần phải là số nguyên' })
  @Min(1, { message: '[MEAL-03] Khẩu phần phải lớn hơn 0' })
  servings?: number;

  @ApiPropertyOptional({ default: 0, description: 'Thứ tự trong cùng ngày + bữa' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '[MEAL-01] sortOrder phải là số nguyên' })
  @Min(0, { message: '[MEAL-01] sortOrder không được âm' })
  sortOrder?: number;
}

export class UpdateMealPlanItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: '[MEAL-02] Ngày của món không hợp lệ' })
  date?: Date;

  @ApiPropertyOptional({ enum: MealType })
  @IsOptional()
  @IsEnum(MealType, { message: '[MEAL-01] Loại bữa không hợp lệ' })
  mealType?: MealType;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '[MEAL-03] Khẩu phần phải là số nguyên' })
  @Min(1, { message: '[MEAL-03] Khẩu phần phải lớn hơn 0' })
  servings?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: '[MEAL-01] sortOrder không được âm' })
  sortOrder?: number;
}
