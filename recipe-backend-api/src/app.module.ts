import { Controller, Get, Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { RecipesModule } from './modules/recipes/recipes.module';
import { MealPlansModule } from './modules/meal-plans/meal-plans.module';

@Controller('health')
export class HealthController {
    @Get()
    kiemTraSucKhoe() {
        return {
            status: 'ok',
            dichVu: 'recipe-backend-api',
            thoiGian: new Date().toISOString(),
        };
    }
}

@Module({
    imports: [CommonModule, AuthModule, RecipesModule, MealPlansModule],
    controllers: [HealthController],
})
export class AppModule {}
