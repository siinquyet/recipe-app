import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IngredientsService } from './ingredients.service';
import {
  CreateInternalIngredientDto,
  CreateIngredientMappingDto,
  IngredientQueryDto,
} from './dto/ingredient.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/interfaces/token-payload.interface';

@ApiTags('Ingredients')
@ApiBearerAuth()
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly service: IngredientsService) {}

  // --- IngredientMapping ---
  // BẮT BUỘC khai trước @Get(':id')/:Put(':id')/:Delete(':id'):
  // NestJS match route theo thứ tự khai báo, nếu để sau thì 'mappings' bị :id nuốt mất.

  @Get('mappings')
  @ApiOperation({ summary: 'Danh sách mapping nguyên liệu' })
  findMappings(@Query() query: IngredientQueryDto) {
    return this.service.findAllMappings(query);
  }

  @Post('mappings')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Thêm mapping nguyên liệu (chỉ ADMIN)' })
  createMapping(@Body() dto: CreateIngredientMappingDto) {
    return this.service.createMapping(dto);
  }

  // --- InternalIngredient ---

  @Get()
  @ApiOperation({ summary: 'Danh sách nguyên liệu nội bộ (phân trang)' })
  findAll(@Query() query: IngredientQueryDto) {
    return this.service.findAllIngredients(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết nguyên liệu nội bộ' })
  findOne(@Param('id') id: string) {
    return this.service.findOneIngredient(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Thêm nguyên liệu nội bộ mới (chỉ ADMIN)' })
  create(@Body() dto: CreateInternalIngredientDto) {
    return this.service.createIngredient(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cập nhật nguyên liệu nội bộ (chỉ ADMIN)' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateInternalIngredientDto>) {
    return this.service.updateIngredient(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Xóa nguyên liệu nội bộ (chỉ ADMIN)' })
  remove(@Param('id') id: string) {
    return this.service.removeIngredient(id);
  }
}
