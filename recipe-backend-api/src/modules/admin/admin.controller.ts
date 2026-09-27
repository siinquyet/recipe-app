import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { ModeratorActionDto, UserStatusDto } from './dto/admin-action.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/interfaces/token-payload.interface';

@ApiTags('Admin')
@Controller('admin')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Thống kê hệ thống (chỉ ADMIN)' })
  stats() {
    return this.service.stats();
  }

  @Get('users')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Danh sách người dùng (chỉ ADMIN, không trả UUID)' })
  findAllUsers(@Query() query: { page?: number; size?: number; search?: string }) {
    return this.service.findAllUsers(query);
  }

  @Patch('users/:id/status')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Khóa/kích hoạt tài khoản người dùng (chỉ ADMIN)' })
  changeUserStatus(@Param('id') id: string, @Body() dto: UserStatusDto) {
    return this.service.changeUserStatus(id, dto);
  }

  @Patch('recipes/:id/approve')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Duyệt công thức PENDING → APPROVED (chỉ ADMIN)' })
  approve(@Param('id') id: string) {
    return this.service.approveRecipe(id);
  }

  @Patch('recipes/:id/reject')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Từ chối công thức PENDING → REJECTED kèm lý do (chỉ ADMIN)' })
  reject(@Param('id') id: string, @Body() dto: ModeratorActionDto) {
    return this.service.rejectRecipe(id, dto);
  }

  @Patch('recipes/:id/hide')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ẩn công thức APPROVED/REJECTED → HIDDEN (chỉ ADMIN)' })
  hide(@Param('id') id: string) {
    return this.service.hideRecipe(id);
  }
}