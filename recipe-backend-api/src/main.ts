import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/response.interceptor';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

async function khoiDong() {
    const ungDung = await NestFactory.create(AppModule);

    ungDung.setGlobalPrefix('api/v1');
    ungDung.enableCors();

    ungDung.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    ungDung.useGlobalInterceptors(new ResponseInterceptor());
    ungDung.useGlobalFilters(new AllExceptionsFilter());

    const cong = Number(process.env.PORT) || 3000;
    await ungDung.listen(cong, '0.0.0.0');
    console.log(`Backend dang nghe o cong ${cong}`);
}

khoiDong();
