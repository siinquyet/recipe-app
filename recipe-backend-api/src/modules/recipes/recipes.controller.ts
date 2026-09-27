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
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { RecipeQueryDto } from './dto/recipe-query.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { ActivityInterceptor } from '../activity/activity.interceptor';
import { TrackActivity } from '../activity/track-activity.decorator';

@ApiTags('Recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly service: RecipesService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Danh sách công thức (phân trang, tìm kiếm hybrid)' })
  // ADMIN gọi được để xem mọi trạng thái; user thường/login chỉ thấy APPROVED (BR-02)
  findAll(
    @Query() query: RecipeQueryDto,
    @CurrentUser() user?: { role?: string },
  ) {
    return this.service.findAll(query, user?.role);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @UseInterceptors(ActivityInterceptor)
  @TrackActivity('VIEW', 'RECIPE')
  @ApiOperation({ summary: 'Chi tiết công thức (BR-02: chỉ APPROVED mới công khai)' })
  findOne(@Param('id') id: string, @CurrentUser() user?: { id: string; role: string }) {
    return this.service.findOne(id, user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ActivityInterceptor)
  @TrackActivity('CREATE_RECIPE', 'RECIPE')
  @ApiOperation({ summary: 'Tạo công thức mới (trạng thái DRAFT)' })
  create(@Body() dto: CreateRecipeDto, @CurrentUser() user: { id: string }) {
    return this.service.create(dto, user.id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Cập nhật công thức (chủ sở hữu/ADMIN)' })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRecipeDto>,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.service.update(id, dto, user.id, user.role);
  }

  @Patch(':id/submit-review')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Gửi công thức đi duyệt (DRAFT/REJECTED → PENDING)' })
  submitReview(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.service.submitForReview(id, user.id, user.role);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Xóa công thức (soft delete)' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.service.remove(id, user.id, user.role);
  }
}