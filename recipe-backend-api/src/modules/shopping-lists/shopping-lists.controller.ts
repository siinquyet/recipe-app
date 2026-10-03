import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ShoppingListsService } from './shopping-lists.service';
import { TaoDanhSachDiChoDto, MonMoiDto, SuaMonDiChoDto, CapNhatDanhSachDto, TaoTuCongThucDto, TaoTuKeHoachAnDto } from './dto/shopping-list.dto';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('shopping-lists')
export class ShoppingListsController {
    constructor(private readonly shoppingListsService: ShoppingListsService) {}

    @Get()
    layDanhSach(
        @Req() req: { user: { id: string } },
        @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
        @Query('size', new DefaultValuePipe(20), ParseIntPipe) size: number,
    ) {
        // BR-API: Phân trang page/size 0-based, chặn số âm và size quá lớn
        const finalTrang = Math.max(page, 0);
        const safeSize = Math.min(Math.max(size, 1), 50);
        return this.shoppingListsService.layDanhSachCuaNguoiDung(req.user.id, finalTrang, safeSize);
    }

    @Post()
    taoMoi(@Body() dto: TaoDanhSachDiChoDto, @Req() req: { user: { id: string } }) {
        return this.shoppingListsService.taoMoi(req.user.id, dto);
    }

    @Post('generate-from-meal-plan')
    taoTuKeHoachAn(@Body() body: TaoTuKeHoachAnDto, @Req() req: { user: { id: string } }) {
        return this.shoppingListsService.taoTuKeHoachAn(req.user.id, body.mealPlanId);
    }

    @Post('generate-from-recipe')
    taoTuCongThuc(@Body() body: TaoTuCongThucDto, @Req() req: { user: { id: string } }) {
        return this.shoppingListsService.taoTuCongThuc(req.user.id, body.congThucId, body.khauPhan);
    }

    @Get(':id')
    layChiTiet(@Param('id') id: string, @Req() req: { user: { id: string } }) {
        return this.shoppingListsService.layChiTiet(id, req.user.id);
    }

    @Delete(':id')
    xoa(@Param('id') id: string, @Req() req: { user: { id: string } }) {
        return this.shoppingListsService.xoa(id, req.user.id);
    }

    @Patch(':id')
    capNhat(
        @Param('id') id: string,
        @Body() dto: CapNhatDanhSachDto,
        @Req() req: { user: { id: string } },
    ) {
        return this.shoppingListsService.capNhat(id, req.user.id, dto);
    }

    @Post(':id/items')
    themMon(
        @Param('id') id: string,
        @Body() dto: MonMoiDto,
        @Req() req: { user: { id: string } },
    ) {
        return this.shoppingListsService.themMon(id, req.user.id, dto);
    }

    @Patch(':id/items/:itemId')
    suaMon(
        @Param('id') id: string,
        @Param('itemId') itemId: string,
        @Body() dto: SuaMonDiChoDto,
        @Req() req: { user: { id: string } },
    ) {
        // BR-SHOP: Một endpoint sửa món (tick mua + tên + lượng + đơn vị)
        return this.shoppingListsService.suaMon(id, itemId, req.user.id, dto);
    }

    @Delete(':id/items/:itemId')
    xoaMon(
        @Param('id') id: string,
        @Param('itemId') itemId: string,
        @Req() req: { user: { id: string } },
    ) {
        return this.shoppingListsService.xoaMon(id, itemId, req.user.id);
    }
}
