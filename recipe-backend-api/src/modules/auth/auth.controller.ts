import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    dangKy(@Body() body: RegisterDto) {
        return this.authService.dangKy(body.email, body.matKhau, body.tenHienThi);
    }

    @Post('login')
    dangNhap(@Body() body: LoginDto) {
        return this.authService.dangNhap(body.email, body.matKhau);
    }

    @Post('refresh')
    lamMoiToken(@Body() body: RefreshTokenDto) {
        return this.authService.lamMoiToken(body.refreshToken);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    layThongTinNguoiDung(@Req() req: { user: { id: string } }) {
        return this.authService.layThongTinNguoiDung(req.user.id);
    }
}
