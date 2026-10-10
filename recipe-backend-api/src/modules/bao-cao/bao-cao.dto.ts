import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TaoBaoCaoDto {
    @ApiProperty({ required: false })
    @IsOptional()
    // BR-SOC: Id món/bình luận là chuỗi tự do (seed dùng slug, món mới dùng uuid)
    @IsString({ message: '[REP-00] recipeId không hợp lệ' })
    recipeId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString({ message: '[REP-00] recipeReferenceId không hợp lệ' })
    recipeReferenceId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString({ message: '[REP-00] commentId không hợp lệ' })
    commentId?: string;

    @ApiProperty({ example: 'INAPPROPRIATE' })
    @IsString()
    @IsIn(['SPAM', 'INAPPROPRIATE', 'COPYRIGHT', 'FAKE', 'OTHER'], {
        message: '[REP-00] Lý do không hợp lệ',
    })
    reason!: string;
}

export class XuLyBaoCaoDto {
    @ApiProperty({ example: 'RESOLVED', enum: ['RESOLVED', 'REJECTED'] })
    @IsIn(['RESOLVED', 'REJECTED'], { message: 'ADM-00 Trạng thái xử lý không hợp lệ' })
    trangThai!: 'RESOLVED' | 'REJECTED';

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    ghiChu?: string;

    @ApiProperty({ example: 'AN_BAI', enum: ['KHONG', 'AN_BAI', 'XOA_BINH_LUAN'], required: false })
    @IsOptional()
    @IsIn(['KHONG', 'AN_BAI', 'XOA_BINH_LUAN'], { message: 'ADM-00 Hành động xử lý không hợp lệ' })
    hanhDong?: 'KHONG' | 'AN_BAI' | 'XOA_BINH_LUAN';
}
