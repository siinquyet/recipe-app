import { Controller, Get, Module } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  kiemTraSucKhoe() {
    return {
      status: 'ok',
      dichVu: 'recipe-backend-api',
      thoiGian: new Date().toISOString(),
    };
  }
}

@Module({
  controllers: [HealthController],
})
export class AppModule {}
