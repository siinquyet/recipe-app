import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function khoiDong() {
  const ungDung = await NestFactory.create(AppModule);
  ungDung.setGlobalPrefix('api/v1');
  ungDung.enableCors();
  const cong = Number(process.env.PORT) || 3000;
  await ungDung.listen(cong, '0.0.0.0');
  console.log(`Backend dang nghe o cong ${cong}`);
}

khoiDong();
