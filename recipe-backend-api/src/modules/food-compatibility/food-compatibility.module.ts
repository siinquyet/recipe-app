import { Module } from '@nestjs/common';
import { FoodCompatibilityController } from './food-compatibility.controller';
import { FoodCompatibilityService } from './food-compatibility.service';

@Module({
  controllers: [FoodCompatibilityController],
  providers: [FoodCompatibilityService],
  exports: [FoodCompatibilityService],
})
export class FoodCompatibilityModule {}