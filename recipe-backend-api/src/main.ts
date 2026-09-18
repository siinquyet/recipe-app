import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/response.interceptor';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

async function khoiDong() {
    const ungDung = await NestFactory.create<NestExpressApplication>(AppModule, {
        bodyParser: true,
    });

    ungDung.setGlobalPrefix('api/v1');
    // BR-UREC: Phục vụ ảnh đã upload ở /uploads (ngoài prefix api)
    ungDung.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });
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
    const httpServer = await ungDung.listen(cong, '0.0.0.0');

    const httpServerInstance = httpServer as unknown as {
        keepAliveTimeout?: number;
        headersTimeout?: number;
        requestTimeout?: number;
    };
    httpServerInstance.keepAliveTimeout = 65000;
    httpServerInstance.headersTimeout = 66000;
    httpServerInstance.requestTimeout = 60000;

    console.log(`Backend dang nghe o cong ${cong}`);
}

khoiDong();
