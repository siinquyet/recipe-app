import { IsString, MinLength, MaxLength, IsOptional, IsUUID } from 'class-validator';

export class TaoBinhLuanDto {
    @IsString()
    @MinLength(1, { message: 'CMT-00 Nội dung bình luận không được trống' })
    @MaxLength(1000)
    noiDung!: string;

    @IsOptional()
    @IsUUID()
    chaId?: string;
}
