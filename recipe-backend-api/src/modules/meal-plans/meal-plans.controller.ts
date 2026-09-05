import { Body, Controller, DefaultValuePipe, Get, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { MealPlansService } from './meal-plans.service';
import { TaoKeHoachAnDto } from './dto/meal-plan.dto';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

@Controller('meal-plans')
export class MealPlansController {
    constructor(private readonly mealPlansService: MealPlansService) {}

    @Get()
    layDanhSach(
        @Query('trang', new DefaultValuePipe(0), ParseIntPipe) trang: number,
        @Query('kichThuoc', new DefaultValuePipe(20), ParseIntPipe) kichThuoc: number,
    ) {
        const safeSize = Math.min(Math.max(kichThuoc, 1), 50);
        return this.mealPlansService.layDanhSach(trang, safeSize);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    taoMoi(@Body() dto: TaoKeHoachAnDto, @Req() req: { user: { id: string } }) {
        return this.mealPlansService.taoMoi(req.user.id, dto);
    }
}
