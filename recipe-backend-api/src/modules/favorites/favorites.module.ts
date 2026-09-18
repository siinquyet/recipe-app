import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { FavoritesListController } from './favorites-list.controller';

@Module({
    providers: [FavoritesService],
    controllers: [FavoritesController, FavoritesListController],
})
export class FavoritesModule {}
