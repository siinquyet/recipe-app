import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RecommendationsService } from './recommendations.service';
import { RecommendationQueryDto, UpdatePreferencesDto } from './dto/recommendation.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Recommendations')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly service: RecommendationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Gợi ý món ăn dựa trên tương tác (FR-RECO-01)',
    description:
      'Kết hợp 60% collaborative + 40% content-based. Cần tối thiểu 3 tương tác ' +
      '(BR-RECO-01), nếu chưa đủ sẽ fallback sang món phổ biến. Kết quả cache 1 giờ (BR-RECO-02).',
  })
  personalized(@CurrentUser() user: { id: string }, @Query() query: RecommendationQueryDto) {
    return this.service.personalized(user.id, query.limit);
  }

  @Get('dietary')
  @ApiOperation({
    summary: 'Gợi ý món ăn theo khẩu vị (FR-RECO-02)',
    description:
      'Lọc món nội bộ (APPROVED) và công thức tham khảo (ACTIVE) theo dietaryTags trong sở thích người dùng.',
  })
  dietary(@CurrentUser() user: { id: string }, @Query() query: RecommendationQueryDto) {
    return this.service.dietary(user.id, query.limit);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Xem sở thích ăn uống của tôi' })
  getPreferences(@CurrentUser() user: { id: string }) {
    return this.service.getPreferences(user.id);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Cập nhật sở thích ăn uống (dietaryTags, allergies, cuisinePrefs)' })
  updatePreferences(@CurrentUser() user: { id: string }, @Body() dto: UpdatePreferencesDto) {
    return this.service.updatePreferences(user.id, dto);
  }
}
