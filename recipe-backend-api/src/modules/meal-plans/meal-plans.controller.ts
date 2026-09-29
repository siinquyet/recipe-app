import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { MealPlansService } from './meal-plans.service';
import { CapNhatKeHoachAnDto, CapNhatMonDto, MonMoiDto, TaoKeHoachAnDto } from './dto/meal-plan.dto';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

@Controller('meal-plans')
export class MealPlansController {
    constructor(private readonly mealPlansService: MealPlansService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    layDanhSach(
        @Query('trang', new DefaultValuePipe(0), ParseIntPipe) trang: number,
        @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
        @Query('kichThuoc', new DefaultValuePipe(20), ParseIntPipe) kichThuoc: number,
        @Query('size', new DefaultValuePipe(20), ParseIntPipe) size: number,
        @Req() req: { user: { id: string } },
    ) {
        const finalTrang = page > 0 ? page : trang;
        const finalSize = size !== 20 ? size : kichThuoc;
        const safeSize = Math.min(Math.max(finalSize, 1), 50);
        // BR-MEAL: Mỗi tài khoản chỉ thấy kế hoạch của mình
        return this.mealPlansService.layDanhSach(finalTrang, safeSize, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    layChiTiet(@Param('id') id: string, @Req() req: { user: { id: string } }) {
        return this.mealPlansService.layChiTiet(id, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    taoMoi(@Body() dto: TaoKeHoachAnDto, @Req() req: { user: { id: string } }) {
        return this.mealPlansService.taoMoi(req.user.id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    capNhat(
        @Param('id') id: string,
        @Body() dto: CapNhatKeHoachAnDto,
        @Req() req: { user: { id: string } },
    ) {
        return this.mealPlansService.capNhat(req.user.id, id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    xoa(@Param('id') id: string, @Req() req: { user: { id: string } }) {
        return this.mealPlansService.xoa(req.user.id, id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/items')
    themMon(
        @Param('id') id: string,
        @Body() dto: MonMoiDto,
        @Req() req: { user: { id: string } },
    ) {
        return this.mealPlansService.themMon(req.user.id, id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/items/:monId')
    capNhatMon(
        @Param('id') id: string,
        @Param('monId') monId: string,
        @Body() dto: CapNhatMonDto,
        @Req() req: { user: { id: string } },
    ) {
        return this.mealPlansService.capNhatMon(req.user.id, id, monId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id/items/:monId')
    xoaMon(
        @Param('id') id: string,
        @Param('monId') monId: string,
        @Req() req: { user: { id: string } },
    ) {
        return this.mealPlansService.xoaMon(req.user.id, id, monId);
    }
}
