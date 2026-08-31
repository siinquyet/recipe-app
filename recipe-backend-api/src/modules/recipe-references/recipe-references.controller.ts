import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecipeReferencesService } from './recipe-references.service';
import { RecipeReferenceQueryDto } from './dto/recipe-reference-query.dto';

@ApiTags('Recipe References')
@ApiBearerAuth()
@Controller('recipe-references')
export class RecipeReferencesController {
  constructor(private readonly service: RecipeReferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách recipe references (phân trang)' })
  findAll(@Query() query: RecipeReferenceQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết recipe reference' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
