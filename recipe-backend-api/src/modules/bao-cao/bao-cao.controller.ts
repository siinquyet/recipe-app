import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../../common/admin.guard';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { BaoCaoService } from './bao-cao.service';
import { TaoBaoCaoDto, XuLyBaoCaoDto } from './bao-cao.dto';

@ApiTags('bao-cao')
@ApiBearerAuth()
@Controller('reports')
export class BaoCaoController {
    constructor(private readonly baoCaoService: BaoCaoService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    taoMoi(@Body() dto: TaoBaoCaoDto, @Req() req: { user: { id: string } }) {
        return this.baoCaoService.taoMoi(req.user.id, dto);
    }

    @UseGuards(AdminGuard)
    @Get()
    layDanhSach(
        @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
        @Query('size', new DefaultValuePipe(20), ParseIntPipe) size: number,
        @Query('status') status?: string,
    ) {
        return this.baoCaoService.layDanhSach(page, Math.min(Math.max(size, 1), 50), status || undefined);
    }

    @UseGuards(AdminGuard)
    @Patch(':id/resolve')
    xuLy(
        @Param('id') id: string,
        @Body() dto: XuLyBaoCaoDto,
        @Req() req: { user: { id: string } },
    ) {
        return this.baoCaoService.xuLy(req.user.id, id, dto);
    }
}
