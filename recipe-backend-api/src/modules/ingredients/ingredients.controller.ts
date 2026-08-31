import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IngredientsService } from './ingredients.service';
import {
  CreateInternalIngredientDto,
  CreateIngredientMappingDto,
  IngredientQueryDto,
} from './dto/ingredient.dto';

@ApiTags('Ingredients')
@ApiBearerAuth()
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly service: IngredientsService) {}

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
  @ApiOperation({ summary: 'Thêm nguyên liệu nội bộ mới' })
  create(@Body() dto: CreateInternalIngredientDto) {
    return this.service.createIngredient(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật nguyên liệu nội bộ' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateInternalIngredientDto>) {
    return this.service.updateIngredient(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa nguyên liệu nội bộ' })
  remove(@Param('id') id: string) {
    return this.service.removeIngredient(id);
  }

  // --- IngredientMapping ---

  @Get('mappings')
  @ApiOperation({ summary: 'Danh sách mapping nguyên liệu' })
  findMappings(@Query() query: IngredientQueryDto) {
    return this.service.findAllMappings(query);
  }

  @Post('mappings')
  @ApiOperation({ summary: 'Thêm mapping nguyên liệu' })
  createMapping(@Body() dto: CreateIngredientMappingDto) {
    return this.service.createMapping(dto);
  }
}
