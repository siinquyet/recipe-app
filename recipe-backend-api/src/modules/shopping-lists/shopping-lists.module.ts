import { Module } from '@nestjs/common';
import { ShoppingListsService } from './shopping-lists.service';
import { ShoppingListsController } from './shopping-lists.controller';

@Module({
    providers: [ShoppingListsService],
    controllers: [ShoppingListsController],
})
export class ShoppingListsModule {}
