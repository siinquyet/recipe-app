import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { TaoBinhLuanDto } from './dto/comment.dto';
import { JwtAuthGuard, OptionalJwtGuard } from '../../common/jwt-auth.guard';

@Controller('recipes/:recipeId/comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    @Get()
    @UseGuards(OptionalJwtGuard)
    layDanhSach(
        @Param('recipeId') recipeId: string,
        @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
        @Query('size', new DefaultValuePipe(20), ParseIntPipe) size: number,
        @Req() req: { user?: { id: string } },
    ) {
        // BR-API: Phân trang page/size 0-based, chặn số âm và size quá lớn
        const finalTrang = Math.max(page, 0);
        const safeSize = Math.min(Math.max(size, 1), 50);
        return this.commentsService.layDanhSach(recipeId, finalTrang, safeSize, req.user?.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    taoMoi(
        @Param('recipeId') recipeId: string,
        @Body() dto: TaoBinhLuanDto,
        @Req() req: { user: { id: string } },
    ) {
        return this.commentsService.taoMoi(req.user.id, recipeId, dto);
    }

    @Get(':id/replies')
    @UseGuards(OptionalJwtGuard)
    layPhanHoi(
        @Param('recipeId') recipeId: string,
        @Param('id') id: string,
        @Req() req: { user?: { id: string } },
    ) {
        return this.commentsService.layPhanHoi(recipeId, id, req.user?.id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    capNhat(
        @Param('recipeId') recipeId: string,
        @Param('id') id: string,
        @Body() dto: TaoBinhLuanDto,
        @Req() req: { user: { id: string } },
    ) {
        return this.commentsService.capNhat(req.user.id, recipeId, id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    xoa(
        @Param('recipeId') recipeId: string,
        @Param('id') id: string,
        @Req() req: { user: { id: string } },
    ) {
        return this.commentsService.xoa(req.user.id, recipeId, id);
    }
}
