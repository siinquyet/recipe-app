import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ShoppingListStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ShoppingListSourceDto {
  @ApiPropertyOptional({ description: 'ID công thức nội bộ (XOR recipeReferenceId)' })
  @IsOptional()
  @ValidateIf((o: ShoppingListSourceDto) => !o.recipeReferenceId)
  @IsUUID('4', { message: '[SHOP-02] recipeId phải là UUID hợp lệ' })
  recipeId?: string;

  @ApiPropertyOptional({ description: 'ID công thức tham khảo (XOR recipeId)' })
  @IsOptional()
  @ValidateIf((o: ShoppingListSourceDto) => !o.recipeId)
  @IsUUID('4', { message: '[SHOP-02] recipeReferenceId phải là UUID hợp lệ' })
  recipeReferenceId?: string;

  @ApiPropertyOptional({ description: 'Khẩu phần mong muốn, mặc định lấy khẩu phần của công thức', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '[SHOP-02] servings phải là số nguyên' })
  @Min(1, { message: '[SHOP-02] Khẩu phần phải lớn hơn 0' })
  servings?: number;
}

/** Tạo danh sách thủ công: bắt buộc có tên */
export class CreateShoppingListDto extends ShoppingListSourceDto {
  @ApiProperty({ example: 'Mua sắm cuối tuần' })
  @IsString({ message: '[SHOP-01] Tên danh sách phải là chuỗi' })
  @MinLength(3, { message: '[SHOP-01] Tên danh sách tối thiểu 3 ký tự' })
  @MaxLength(200, { message: '[SHOP-01] Tên danh sách tối đa 200 ký tự' })
  name: string;
}

/** Generate từ công thức: tên không bắt buộc, mặc định "Mua sắm: <tên công thức>" */
export class GenerateFromRecipeDto extends ShoppingListSourceDto {
  @ApiPropertyOptional({ example: 'Mua sắm cuối tuần' })
  @IsOptional()
  @IsString({ message: '[SHOP-01] Tên danh sách phải là chuỗi' })
  @MinLength(3, { message: '[SHOP-01] Tên danh sách tối thiểu 3 ký tự' })
  @MaxLength(200, { message: '[SHOP-01] Tên danh sách tối đa 200 ký tự' })
  name?: string;
}

export class UpdateShoppingListDto {
  @ApiPropertyOptional({ example: 'Mua sắm cuối tuần (đã chốt)' })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: '[SHOP-01] Tên danh sách tối thiểu 3 ký tự' })
  @MaxLength(200, { message: '[SHOP-01] Tên danh sách tối đa 200 ký tự' })
  name?: string;

  @ApiPropertyOptional({ enum: ShoppingListStatus, example: ShoppingListStatus.COMPLETED })
  @IsOptional()
  @IsEnum(ShoppingListStatus, { message: '[SHOP-01] Trạng thái phải là ACTIVE/COMPLETED/ARCHIVED' })
  status?: ShoppingListStatus;
}

export class CreateShoppingListItemDto {
  @ApiProperty({ example: '500g thịt bò' })
  @IsString({ message: '[SHOP-02] Tên nguyên liệu phải là chuỗi' })
  @MinLength(2, { message: '[SHOP-02] Tên nguyên liệu tối thiểu 2 ký tự' })
  @MaxLength(500, { message: '[SHOP-02] Tên nguyên liệu tối đa 500 ký tự' })
  originalText: string;

  @ApiPropertyOptional({ description: 'Nguyên liệu nội bộ đã map (để gộp được với món khác)' })
  @IsOptional()
  @IsUUID('4', { message: '[SHOP-02] internalIngredientId phải là UUID hợp lệ' })
  internalIngredientId?: string;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '[SHOP-02] Định lượng phải là số' })
  @Min(0, { message: '[SHOP-02] Định lượng không được âm' })
  quantity?: number;

  @ApiPropertyOptional({ example: 'g', default: 'g' })
  @IsOptional()
  @IsString({ message: '[SHOP-02] Đơn vị phải là chuỗi' })
  @MaxLength(20, { message: '[SHOP-02] Đơn vị tối đa 20 ký tự' })
  unit?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '[SHOP-01] sortOrder phải là số nguyên' })
  @Min(0, { message: '[SHOP-01] sortOrder không được âm' })
  sortOrder?: number;
}

export class UpdateShoppingListItemDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean({ message: '[SHOP-01] isChecked phải là true/false' })
  isChecked?: boolean;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '[SHOP-02] Định lượng phải là số' })
  @Min(0, { message: '[SHOP-02] Định lượng không được âm' })
  quantity?: number;

  @ApiPropertyOptional({ example: 'g' })
  @IsOptional()
  @IsString({ message: '[SHOP-02] Đơn vị phải là chuỗi' })
  @MaxLength(20, { message: '[SHOP-02] Đơn vị tối đa 20 ký tự' })
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '[SHOP-01] sortOrder phải là số nguyên' })
  @Min(0, { message: '[SHOP-01] sortOrder không được âm' })
  sortOrder?: number;
}

export class GenerateFromMealPlanDto {
  @ApiProperty({ description: 'ID kế hoạch bữa ăn (phải là kế hoạch của chính tôi)' })
  @IsUUID('4', { message: '[SHOP-01] mealPlanId phải là UUID hợp lệ' })
  mealPlanId: string;

  @ApiPropertyOptional({ description: 'Tên danh sách, mặc định "Mua sắm: <tên kế hoạch>"' })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: '[SHOP-01] Tên danh sách tối thiểu 3 ký tự' })
  @MaxLength(200, { message: '[SHOP-01] Tên danh sách tối đa 200 ký tự' })
  name?: string;
}

export class ShoppingListQueryDto {
  @ApiPropertyOptional({ enum: ShoppingListStatus, description: 'Lọc theo trạng thái' })
  @IsOptional()
  @IsEnum(ShoppingListStatus, { message: '[SHOP-01] Trạng thái không hợp lệ' })
  status?: ShoppingListStatus;
}
