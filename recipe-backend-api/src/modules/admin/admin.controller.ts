import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../../common/admin.guard';
import { AdminService } from './admin.service';
import { DoiRoleDto, TuChoiBaiDto } from './dto/admin.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Get('users')
    layNguoiDung(
        @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
        @Query('size', new DefaultValuePipe(20), ParseIntPipe) size: number,
        @Query('search') search?: string,
        @Query('status') status?: string,
    ) {
        return this.adminService.layNguoiDung(page, Math.min(Math.max(size, 1), 50), search?.trim() || undefined, status || undefined);
    }

    @Patch('users/:id/ban')
    khoaNguoiDung(@Param('id') id: string, @Req() req: { user: { id: string } }) {
        return this.adminService.khoaNguoiDung(req.user.id, id);
    }

    @Patch('users/:id/activate')
    moKhoaNguoiDung(@Param('id') id: string, @Req() req: { user: { id: string } }) {
        return this.adminService.moKhoaNguoiDung(req.user.id, id);
    }

    @Patch('users/:id/role')
    doiRole(@Param('id') id: string, @Body() dto: DoiRoleDto, @Req() req: { user: { id: string } }) {
        return this.adminService.doiRole(req.user.id, id, dto.role);
    }

    @Get('recipes/pending')
    layBaiChoDuyet(
        @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
        @Query('size', new DefaultValuePipe(20), ParseIntPipe) size: number,
    ) {
        return this.adminService.layBaiChoDuyet(page, Math.min(Math.max(size, 1), 50));
    }

    @Get('recipes')
    layTatCaBai(
        @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
        @Query('size', new DefaultValuePipe(20), ParseIntPipe) size: number,
        @Query('status') status?: string,
    ) {
        return this.adminService.layTatCaBai(page, Math.min(Math.max(size, 1), 50), status || undefined);
    }

    @Post('recipes/:id/approve')
    duyetBai(@Param('id') id: string, @Req() req: { user: { id: string } }) {
        return this.adminService.duyetBai(req.user.id, id);
    }

    @Post('recipes/:id/reject')
    tuChoiBai(@Param('id') id: string, @Body() dto: TuChoiBaiDto, @Req() req: { user: { id: string } }) {
        return this.adminService.tuChoiBai(req.user.id, id, dto);
    }

    @Post('recipes/:id/hide')
    anBai(@Param('id') id: string, @Req() req: { user: { id: string } }) {
        return this.adminService.anBai(req.user.id, id);
    }

    @Post('recipes/:id/unhide')
    hienBai(@Param('id') id: string, @Req() req: { user: { id: string } }) {
        return this.adminService.hienBai(req.user.id, id);
    }

    @Delete('comments/:id')
    xoaBinhLuan(@Param('id') id: string, @Req() req: { user: { id: string } }) {
        return this.adminService.xoaBinhLuan(req.user.id, id);
    }

    @Get('analytics/dashboard')
    layDashboard() {
        return this.adminService.layDashboard();
    }
}
