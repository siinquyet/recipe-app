import { Controller, Delete, Param, Post, Req, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('recipes/:recipeId/favorite')
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) {}

    @Post()
    them(@Param('recipeId') recipeId: string, @Req() req: { user: { id: string } }) {
        return this.favoritesService.themYeuThich(req.user.id, recipeId);
    }

    @Delete()
    xoa(@Param('recipeId') recipeId: string, @Req() req: { user: { id: string } }) {
        return this.favoritesService.xoaYeuThich(req.user.id, recipeId);
    }
}
