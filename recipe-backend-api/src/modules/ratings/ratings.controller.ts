import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { TaoDanhGiaDto } from './dto/rating.dto';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('recipes/:recipeId/rating')
export class RatingsController {
    constructor(private readonly ratingsService: RatingsService) {}

    @Post()
    danhGia(
        @Param('recipeId') recipeId: string,
        @Body() dto: TaoDanhGiaDto,
        @Req() req: { user: { id: string } },
    ) {
        return this.ratingsService.danhGia(req.user.id, recipeId, dto);
    }
}
