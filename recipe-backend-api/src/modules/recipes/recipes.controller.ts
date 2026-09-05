import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { RecipesService } from './recipes.service';

@Controller('recipes')
export class RecipesController {
    constructor(private readonly recipesService: RecipesService) {}

    @Get()
    layDanhSach(
        @Query('trang', new DefaultValuePipe(0), ParseIntPipe) trang: number,
        @Query('kichThuoc', new DefaultValuePipe(10), ParseIntPipe) kichThuoc: number,
        @Query('tuKhoa') tuKhoa?: string,
    ) {
        const safeSize = Math.min(Math.max(kichThuoc, 1), 50);
        return this.recipesService.layDanhSach({
            trang,
            kichThuoc: safeSize,
            tuKhoa: tuKhoa?.trim() || undefined,
        });
    }

    @Get(':id')
    layChiTiet(@Param('id') id: string) {
        return this.recipesService.layChiTiet(id);
    }
}
