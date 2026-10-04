import { Controller, Get, Param, Post, Body, Req, UseGuards } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { TaoDanhGiaDto } from './dto/rating.dto';
import { JwtAuthGuard, OptionalJwtGuard } from '../../common/jwt-auth.guard';

@Controller('recipes/:recipeId/rating')
export class RatingsController {
    constructor(private readonly ratingsService: RatingsService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    danhGia(
        @Param('recipeId') recipeId: string,
        @Body() dto: TaoDanhGiaDto,
        @Req() req: { user: { id: string } },
    ) {
        return this.ratingsService.danhGia(req.user.id, recipeId, dto);
    }

    @UseGuards(OptionalJwtGuard)
    @Get('summary')
    tomTat(@Param('recipeId') recipeId: string) {
        return this.ratingsService.tomTat(recipeId);
    }
}
