import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

// BR-SOC: Danh sách công thức đã yêu thích của chính người dùng
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesListController {
    constructor(private readonly favoritesService: FavoritesService) {}

    @Get()
    layDanhSach(
        @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
        @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number,
        @Req() req: { user: { id: string } },
    ) {
        const kichThuoc = Math.min(Math.max(size, 1), 50);
        return this.favoritesService.layDanhSachYeuThich(req.user.id, Math.max(page, 0), kichThuoc);
    }
}
