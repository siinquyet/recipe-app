import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExternalMetricsService } from './external-metrics.service';

class UpsertMetricsDto {
  spoonacularScore?: number;
  healthScore?: number;
  aggregateLikes?: number;
}

@ApiTags('External Recipe Metrics')
@ApiBearerAuth()
@Controller('external-metrics')
export class ExternalMetricsController {
  constructor(private readonly service: ExternalMetricsService) {}

  @Get(':recipeReferenceId')
  @ApiOperation({ summary: 'Lấy metrics theo recipe reference' })
  find(@Param('recipeReferenceId') id: string) {
    return this.service.findByRecipeReference(id);
  }

  @Post(':recipeReferenceId')
  @ApiOperation({ summary: 'Tạo/cập nhật metrics (upsert)' })
  upsert(@Param('recipeReferenceId') id: string, @Body() dto: UpsertMetricsDto) {
    return this.service.upsert(id, dto);
  }

  @Delete(':recipeReferenceId')
  @ApiOperation({ summary: 'Xóa metrics' })
  remove(@Param('recipeReferenceId') id: string) {
    return this.service.remove(id);
  }
}
