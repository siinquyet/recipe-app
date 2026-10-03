import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CapNhatCongThucDto, TaoCongThucDto } from './dto/recipe.dto';
import { JwtAuthGuard, OptionalJwtGuard } from '../../common/jwt-auth.guard';

@Controller('recipes')
export class RecipesController {
    constructor(private readonly recipesService: RecipesService) {}

    @Get()
    @UseGuards(OptionalJwtGuard)
    layDanhSach(
        @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
        @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number,
        @Query('tuKhoa') tuKhoa?: string,
        @Query('search') search?: string,
        @Query('tacGiaId') tacGiaId?: string,
        @Req() req?: { user?: { id: string } },
    ) {
        // BR-API: Phân trang page/size 0-based, chặn số âm và size quá lớn
        const finalTrang = Math.max(page, 0);
        const safeSize = Math.min(Math.max(size, 1), 50);
        const finalKeyword = (search || tuKhoa)?.trim() || undefined;
        return this.recipesService.layDanhSach({
            trang: finalTrang,
            kichThuoc: safeSize,
            tuKhoa: finalKeyword,
            tacGiaId: tacGiaId?.trim() || undefined,
            nguoiXemId: req?.user?.id,
        });
    }

    @Get('search/by-ingredients')
    layTheoNguyenLieu(
        @Query('ingredients') nguyenLieu = '',
        @Query('number', new DefaultValuePipe(10), ParseIntPipe) number: number,
    ) {
        return this.recipesService.layTheoNguyenLieu(nguyenLieu, Math.min(Math.max(number, 1), 20));
    }

    @Get(':id/similar')
    layTuongTu(@Param('id') id: string) {
        return this.recipesService.layTuongTu(id);
    }

    @Get(':id')
    @UseGuards(OptionalJwtGuard)
    layChiTiet(@Param('id') id: string, @Req() req: { user?: { id: string } }) {
        return this.recipesService.layChiTiet(id, req.user?.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/submit-review')
    guiDuyet(@Param('id') id: string, @Req() req: { user: { id: string } }) {
        return this.recipesService.guiDuyet(id, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/rut-lai')
    rutLai(@Param('id') id: string, @Req() req: { user: { id: string } }) {
        return this.recipesService.rutLai(id, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    taoMoi(@Body() dto: TaoCongThucDto, @Req() req: { user: { id: string } }) {
        return this.recipesService.taoMoi(req.user.id, dto);
    }

    

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    capNhatMotPhan(
        @Param('id') id: string,
        @Body() dto: CapNhatCongThucDto,
        @Req() req: { user: { id: string } },
    ) {
        return this.recipesService.capNhat(id, req.user.id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    xoa(@Param('id') id: string, @Req() req: { user: { id: string } }) {
        return this.recipesService.xoa(id, req.user.id);
    }
}
