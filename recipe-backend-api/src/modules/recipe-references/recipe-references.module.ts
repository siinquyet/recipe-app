import { Module } from '@nestjs/common';
import { RecipeReferencesController } from './recipe-references.controller';
import { RecipeReferencesService } from './recipe-references.service';

@Module({
  controllers: [RecipeReferencesController],
  providers: [RecipeReferencesService],
  exports: [RecipeReferencesService],
})
export class RecipeReferencesModule {}
