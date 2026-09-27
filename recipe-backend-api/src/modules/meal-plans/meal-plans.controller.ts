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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MealPlansService } from './meal-plans.service';
import {
  CreateMealPlanDto,
  CreateMealPlanItemDto,
  UpdateMealPlanDto,
  UpdateMealPlanItemDto,
} from './dto/meal-plan.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TrackActivity } from '../activity/track-activity.decorator';
import { ActivityInterceptor } from '../activity/activity.interceptor';
import { AuditLog } from '../audit/audit-log.decorator';
import { AuditInterceptor } from '../audit/audit.interceptor';

@ApiTags('Meal Plans')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('meal-plans')
export class MealPlansController {
  constructor(private readonly service: MealPlansService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách kế hoạch bữa ăn của tôi' })
  findAll(@CurrentUser() user: { id: string }) {
    return this.service.findAll(user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo kế hoạch bữa ăn (FR-MEAL-01)' })
  create(@Body() dto: CreateMealPlanDto, @CurrentUser() user: { id: string }) {
    return this.service.create(dto, user.id);
  }

  @Get(':id')
  @UseInterceptors(ActivityInterceptor)
  @TrackActivity('VIEW', 'MEAL_PLAN')
  @ApiOperation({ summary: 'Chi tiết kế hoạch bữa ăn kèm các món theo ngày' })
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.service.findOne(id, user.id);
  }

  @Patch(':id')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('UPDATE', 'MEAL_PLAN')
  @ApiOperation({ summary: 'Cập nhật tên / ngày / trạng thái kế hoạch' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMealPlanDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.update(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AuditInterceptor)
  @AuditLog('DELETE', 'MEAL_PLAN')
  @ApiOperation({ summary: 'Xóa kế hoạch bữa ăn (kèm toàn bộ món)' })
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.service.remove(id, user.id);
  }

  @Post(':id/items')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(ActivityInterceptor)
  @TrackActivity('PLAN_ITEM', 'MEAL_PLAN')
  @ApiOperation({ summary: 'Thêm món vào kế hoạch (chỉ recipe APPROVED / reference ACTIVE)' })
  addItem(
    @Param('id') id: string,
    @Body() dto: CreateMealPlanItemDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.addItem(id, dto, user.id);
  }

  @Patch(':id/items/:itemId')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('UPDATE', 'MEAL_PLAN')
  @ApiOperation({ summary: 'Đổi ngày / bữa / khẩu phần / thứ tự của món' })
  updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateMealPlanItemDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.updateItem(id, itemId, dto, user.id);
  }

  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa món khỏi kế hoạch' })
  removeItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.removeItem(id, itemId, user.id);
  }
}
