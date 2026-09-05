import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ShoppingListsService } from './shopping-lists.service';
import { TaoDanhSachDiChoDto } from './dto/shopping-list.dto';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('shopping-lists')
export class ShoppingListsController {
    constructor(private readonly shoppingListsService: ShoppingListsService) {}

    @Get()
    layDanhSach(
        @Req() req: { user: { id: string } },
        @Query('trang', new DefaultValuePipe(0), ParseIntPipe) trang: number,
        @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
        @Query('kichThuoc', new DefaultValuePipe(20), ParseIntPipe) kichThuoc: number,
        @Query('size', new DefaultValuePipe(20), ParseIntPipe) size: number,
    ) {
        const finalTrang = page > 0 ? page : trang;
        const finalSize = size !== 20 ? size : kichThuoc;
        const safeSize = Math.min(Math.max(finalSize, 1), 50);
        return this.shoppingListsService.layDanhSachCuaNguoiDung(req.user.id, finalTrang, safeSize);
    }

    @Post()
    taoMoi(@Body() dto: TaoDanhSachDiChoDto, @Req() req: { user: { id: string } }) {
        return this.shoppingListsService.taoMoi(req.user.id, dto);
    }

    @Get(':id')
    layChiTiet(@Param('id') id: string, @Req() req: { user: { id: string } }) {
        return this.shoppingListsService.layChiTiet(id, req.user.id);
    }
}
