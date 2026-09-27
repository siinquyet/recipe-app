import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ArrayNotEmpty, IsArray, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FoodCompatibilityService } from './food-compatibility.service';

class CheckFoodDto {
  @IsArray()
  @ArrayNotEmpty({ message: '[FO-05] Danh sách món không được rỗng' })
  @IsString({ each: true })
  @MinLength(2, { each: true, message: '[FO-05] Mỗi món ít nhất 2 ký tự' })
  @MaxLength(100, { each: true, message: '[FO-05] Mỗi món tối đa 100 ký tự' })
  items: string[];
}

@ApiTags('Food Compatibility')
@Controller('food-compatibility')
export class FoodCompatibilityController {
  constructor(private readonly service: FoodCompatibilityService) {}

  @Post('check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Kiểm tra tương tác giữa các nguyên liệu/món: Kỵ/Độc - Hợp - Trung tính',
  })
  check(@Body() dto: CheckFoodDto) {
    return this.service.check(dto.items);
  }
}