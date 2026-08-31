import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RecipeReferencesModule } from './modules/recipe-references/recipe-references.module';
import { IngredientsModule } from './modules/ingredients/ingredients.module';
import { ExternalMetricsModule } from './modules/external-metrics/external-metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RecipeReferencesModule,
    IngredientsModule,
    ExternalMetricsModule,
  ],
})
export class AppModule {}
