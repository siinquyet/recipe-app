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
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { ModeratorActionDto, UserStatusDto } from './dto/admin-action.dto';
import { AdminUserQueryDto } from './dto/admin-query.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/interfaces/token-payload.interface';
import { AuditInterceptor } from '../audit/audit.interceptor';
import { AuditLog } from '../audit/audit-log.decorator';

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
  findAllUsers(@Query() query: AdminUserQueryDto) {
    return this.service.findAllUsers(query);
  }

  @Patch('users/:id/status')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AuditInterceptor)
  @AuditLog(
    (req: any, res: any) => {
      const status = req?.body?.status || res?.status || res?.data?.status;
      if (status === 'BANNED') return 'BAN_USER';
      if (status === 'ACTIVE') return 'ACTIVATE_USER';
      return 'CHANGE_ROLE';
    },
    'USER',
  )
  @ApiOperation({ summary: 'Khóa/kích hoạt tài khoản người dùng (chỉ ADMIN)' })
  changeUserStatus(@Param('id') id: string, @Body() dto: UserStatusDto) {
    return this.service.changeUserStatus(id, dto);
  }

  @Patch('recipes/:id/approve')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AuditInterceptor)
  @AuditLog('APPROVE', 'RECIPE')
  @ApiOperation({ summary: 'Duyệt công thức PENDING → APPROVED (chỉ ADMIN)' })
  approve(@Param('id') id: string) {
    return this.service.approveRecipe(id);
  }

  @Patch('recipes/:id/reject')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AuditInterceptor)
  @AuditLog('REJECT', 'RECIPE')
  @ApiOperation({ summary: 'Từ chối công thức PENDING → REJECTED kèm lý do (chỉ ADMIN)' })
  reject(@Param('id') id: string, @Body() dto: ModeratorActionDto) {
    return this.service.rejectRecipe(id, dto);
  }

  @Patch('recipes/:id/hide')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AuditInterceptor)
  @AuditLog('HIDE', 'RECIPE')
  @ApiOperation({ summary: 'Ẩn công thức APPROVED/REJECTED → HIDDEN (chỉ ADMIN)' })
  hide(@Param('id') id: string) {
    return this.service.hideRecipe(id);
  }
}