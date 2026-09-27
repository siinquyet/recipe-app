import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ShoppingListsService } from './shopping-lists.service';
import {
  CreateShoppingListDto,
  CreateShoppingListItemDto,
  GenerateFromMealPlanDto,
  GenerateFromRecipeDto,
  ShoppingListQueryDto,
  UpdateShoppingListDto,
  UpdateShoppingListItemDto,
} from './dto/shopping-list.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TrackActivity } from '../activity/track-activity.decorator';
import { ActivityInterceptor } from '../activity/activity.interceptor';
import { AuditLog } from '../audit/audit-log.decorator';
import { AuditInterceptor } from '../audit/audit.interceptor';



@ApiTags('Shopping Lists')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('shopping-lists')
export class ShoppingListsController {
  constructor(private readonly service: ShoppingListsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách mua sắm của tôi (lọc theo trạng thái)' })
  findAll(@Query() query: ShoppingListQueryDto, @CurrentUser() user: { id: string }) {
    return this.service.findAll(query, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(ActivityInterceptor)
  @TrackActivity('GENERATE_SHOPPING', 'SHOPPING_LIST', { entityIdParam: 'none' })
  @ApiOperation({ summary: 'Tạo danh sách mua sắm thủ công (hoặc từ công thức nếu có recipeId)' })
  create(@Body() dto: CreateShoppingListDto, @CurrentUser() user: { id: string }) {
    return this.service.createManual(dto, user.id);
  }

  @Post('generate-from-recipe')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(ActivityInterceptor)
  @TrackActivity('GENERATE_SHOPPING', 'SHOPPING_LIST', { entityIdParam: 'none' })
  @ApiOperation({ summary: 'Tạo danh sách mua sắm từ công thức (BR-03 cộng gộp, BR-04 theo khẩu phần)' })
  generateFromRecipe(@Body() dto: GenerateFromRecipeDto, @CurrentUser() user: { id: string }) {
    return this.service.generateFromRecipe(dto, user.id);
  }

  @Post('generate-from-meal-plan')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(ActivityInterceptor)
  @TrackActivity('GENERATE_SHOPPING', 'SHOPPING_LIST', { entityIdParam: 'none' })
  @ApiOperation({ summary: 'Tạo danh sách mua sắm từ kế hoạch bữa ăn (BR-03, BR-04)' })
  generateFromMealPlan(
    @Body() dto: GenerateFromMealPlanDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.generateFromMealPlan(dto.mealPlanId, dto.name, user.id);
  }

  @Get(':id')
  @UseInterceptors(ActivityInterceptor)
  @TrackActivity('VIEW', 'SHOPPING_LIST')
  @ApiOperation({ summary: 'Chi tiết danh sách mua sắm kèm tiến độ tick' })
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.service.findOne(id, user.id);
  }

  @Patch(':id')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('UPDATE', 'SHOPPING_LIST')
  @ApiOperation({ summary: 'Đổi tên / trạng thái danh sách' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateShoppingListDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.update(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AuditInterceptor)
  @AuditLog('DELETE', 'SHOPPING_LIST')
  @ApiOperation({ summary: 'Lưu trữ danh sách mua sắm (ARCHIVED)' })
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.service.remove(id, user.id);
  }

  @Post(':id/items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Thêm món thủ công vào danh sách' })
  addItem(
    @Param('id') id: string,
    @Body() dto: CreateShoppingListItemDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.addItem(id, dto, user.id);
  }

  @Patch(':id/items/:itemId')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('UPDATE', 'SHOPPING_LIST')
  @ApiOperation({ summary: 'Tick / bỏ tick, chỉnh định lượng hoặc thứ tự của món' })
  updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateShoppingListItemDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.updateItem(id, itemId, dto, user.id);
  }

  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa một món khỏi danh sách' })
  removeItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.removeItem(id, itemId, user.id);
  }
}
