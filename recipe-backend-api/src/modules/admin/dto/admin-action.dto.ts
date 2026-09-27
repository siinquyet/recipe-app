import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UserStatusDto {
  @IsIn(['ACTIVE', 'BANNED'], { message: '[ADM-01] Trạng thái user chỉ ACTIVE/BANNED' })
  status: 'ACTIVE' | 'BANNED';
}

export class ModeratorActionDto {
  @IsOptional()
  @IsString()
  @MinLength(5, { message: '[ADM-02] Lý do tối thiểu 5 ký tự' })
  @MaxLength(500, { message: '[ADM-02] Lý do tối đa 500 ký tự' })
  reason?: string;
}