import { Module } from '@nestjs/common';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [ActivityModule],
  controllers: [RecipesController],
  providers: [RecipesService],
  exports: [RecipesService],
})
export class RecipesModule {}