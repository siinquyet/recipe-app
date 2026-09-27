import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional } from 'class-validator';

/** Các khoảng thời gian mà Web Admin cho phép chọn (UI rule: date range picker 7/30/90) */
export const ANALYTICS_ALLOWED_DAYS = [7, 30, 90] as const;

export class AnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'Khoảng thời gian (số ngày). Chỉ nhận 7 / 30 / 90.',
    enum: ANALYTICS_ALLOWED_DAYS,
    default: 7,
  })
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === null || value === '' ? undefined : Number(value)))
  @IsInt({ message: '[ADM-05] days phải là số nguyên' })
  @IsIn(ANALYTICS_ALLOWED_DAYS as unknown as number[], {
    message: `[ADM-05] days chỉ nhận các giá trị: ${ANALYTICS_ALLOWED_DAYS.join(', ')}`,
  })
  days?: number = 7;
}
