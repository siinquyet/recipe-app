import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../../common/admin.guard';
import { DanhMucService } from './danh-muc.service';
import { CapNhatDanhMucDto, TaoDanhMucDto, TaoNhanDto } from './dto/danh-muc.dto';

@ApiTags('danh-muc')
@Controller()
export class DanhMucController {
    constructor(private readonly danhMucService: DanhMucService) {}

    @Get('categories')
    layDanhMuc() {
        return this.danhMucService.layDanhMuc();
    }

    @Get('tags')
    layNhan() {
        return this.danhMucService.layNhan();
    }

    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Post('categories')
    taoDanhMuc(@Body() dto: TaoDanhMucDto) {
        return this.danhMucService.taoDanhMuc(dto);
    }

    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Delete('categories/:id')
    xoaDanhMuc(@Param('id') id: string) {
        return this.danhMucService.xoaDanhMuc(id);
    }

    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Patch('categories/:id')
    capNhatDanhMuc(@Param('id') id: string, @Body() dto: CapNhatDanhMucDto) {
        return this.danhMucService.capNhatDanhMuc(id, dto);
    }

    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Post('tags')
    taoNhan(@Body() dto: TaoNhanDto) {
        return this.danhMucService.taoNhan(dto);
    }

    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Delete('tags/:id')
    xoaNhan(@Param('id') id: string) {
        return this.danhMucService.xoaNhan(id);
    }
}
