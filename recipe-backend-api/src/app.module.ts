import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RecipeReferencesModule } from './modules/recipe-references/recipe-references.module';
import { IngredientsModule } from './modules/ingredients/ingredients.module';
import { ExternalMetricsModule } from './modules/external-metrics/external-metrics.module';
import { AuthModule } from './modules/auth/auth.module';
import { RecipesModule } from './modules/recipes/recipes.module';
import { AdminModule } from './modules/admin/admin.module';
import { FoodCompatibilityModule } from './modules/food-compatibility/food-compatibility.module';
import { ActivityModule } from './modules/activity/activity.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RecipeReferencesModule,
    IngredientsModule,
    ExternalMetricsModule,
    AuthModule,
    RecipesModule,
    AdminModule,
    FoodCompatibilityModule,
    ActivityModule,
    AuditModule,
  ],
})
export class AppModule {}
