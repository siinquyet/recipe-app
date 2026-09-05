import { IsString, MinLength, MaxLength, IsOptional, IsIn } from 'class-validator';

export class TaoDanhSachDiChoDto {
    @IsString()
    @MinLength(1, { message: 'SHOP-00 Tên danh sách không được trống' })
    @MaxLength(100)
    ten!: string;

    @IsIn(['RECIPE', 'MEAL_PLAN', 'MANUAL'], {
        message: 'SHOP-00 loaiNguon phải là RECIPE, MEAL_PLAN hoặc MANUAL',
    })
    loaiNguon!: 'RECIPE' | 'MEAL_PLAN' | 'MANUAL';

    @IsOptional()
    @IsString()
    nguonId?: string;
}
