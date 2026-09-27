import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MealPlansController } from './meal-plans.controller';
import { MealPlansService } from './meal-plans.service';
import { ActivityModule } from '../activity/activity.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuthModule, ActivityModule, AuditModule],
  controllers: [MealPlansController],
  providers: [MealPlansService],
  exports: [MealPlansService],
})
export class MealPlansModule {}
