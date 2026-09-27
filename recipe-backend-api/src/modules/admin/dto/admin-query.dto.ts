import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AdminUserQueryDto {
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

  @ApiPropertyOptional({ description: 'Tìm theo email hoặc tên hiển thị' })
  @IsOptional()
  @IsString()
  search?: string;
}
