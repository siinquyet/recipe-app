import { IsString, MinLength, MaxLength, IsDateString } from 'class-validator';

export class TaoKeHoachAnDto {
    @IsString()
    @MinLength(1, { message: 'MEAL-00 Tên kế hoạch không được trống' })
    @MaxLength(100)
    ten!: string;

    @IsDateString({}, { message: 'MEAL-00 Ngày bắt đầu không hợp lệ (YYYY-MM-DD)' })
    ngayBatDau!: string;

    @IsDateString({}, { message: 'MEAL-00 Ngày kết thúc không hợp lệ (YYYY-MM-DD)' })
    ngayKetThuc!: string;
}
