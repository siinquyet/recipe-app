import { Module } from '@nestjs/common';
import { ShoppingListsController } from './shopping-lists.controller';
import { ShoppingListsService } from './shopping-lists.service';
import { AggregationService } from './services/aggregation.service';
import { ActivityModule } from '../activity/activity.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [ActivityModule, AuditModule],
  controllers: [ShoppingListsController],
  providers: [ShoppingListsService, AggregationService],
  exports: [ShoppingListsService, AggregationService],
})
export class ShoppingListsModule {}
