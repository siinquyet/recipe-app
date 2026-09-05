import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { RecipesService } from './recipes.service';

@Controller('recipes')
export class RecipesController {
    constructor(private readonly recipesService: RecipesService) {}

    @Get()
    layDanhSach(
        @Query('trang', new DefaultValuePipe(0), ParseIntPipe) trang: number,
        @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
        @Query('kichThuoc', new DefaultValuePipe(10), ParseIntPipe) kichThuoc: number,
        @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number,
        @Query('tuKhoa') tuKhoa?: string,
        @Query('search') search?: string,
    ) {
        const finalTrang = page > 0 ? page : trang;
        const finalSize = size !== 10 ? size : kichThuoc;
        const safeSize = Math.min(Math.max(finalSize, 1), 50);
        const finalKeyword = (search || tuKhoa)?.trim() || undefined;
        return this.recipesService.layDanhSach({
            trang: finalTrang,
            kichThuoc: safeSize,
            tuKhoa: finalKeyword,
        });
    }

    @Get('search/by-ingredients')
    layTheoNguyenLieu(
        @Query('ingredients') nguyenLieu: string,
        @Query('number', new DefaultValuePipe(10), ParseIntPipe) number: number,
    ) {
        return this.recipesService.layDanhSach({
            trang: 0,
            kichThuoc: Math.min(Math.max(number, 1), 20),
        });
    }

    @Get(':id/similar')
    layTuongTu(@Param('id') id: string) {
        return this.recipesService.layTuongTu(id);
    }

    @Get(':id')
    layChiTiet(@Param('id') id: string) {
        return this.recipesService.layChiTiet(id);
    }
}
