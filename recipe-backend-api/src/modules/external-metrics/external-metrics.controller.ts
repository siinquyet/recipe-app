import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { IsOptional, IsNumber, Max, Min } from 'class-validator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ExternalMetricsService } from './external-metrics.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/interfaces/token-payload.interface';

class UpsertMetricsDto {
  @ApiPropertyOptional({ example: 89.5 })
  @IsOptional()
  @IsNumber()
  spoonacularScore?: number;

  @ApiPropertyOptional({ example: 75.0 })
  @IsOptional()
  @IsNumber()
  healthScore?: number;

  @ApiPropertyOptional({ example: 245 })
  @IsOptional()
  @IsNumber()
  @Min(0)
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Tạo/cập nhật metrics (chỉ ADMIN)' })
  upsert(@Param('recipeReferenceId') id: string, @Body() dto: UpsertMetricsDto) {
    return this.service.upsert(id, dto);
  }

  @Delete(':recipeReferenceId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Xóa metrics (chỉ ADMIN)' })
  remove(@Param('recipeReferenceId') id: string) {
    return this.service.remove(id);
  }
}
