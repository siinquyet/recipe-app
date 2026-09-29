import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

    // Tài liệu API tương tác (Swagger UI) — chỉ bật ngoài production để khỏi lộ mặt API
    const choPhepTaiLieu = process.env.NODE_ENV !== 'production';
    if (choPhepTaiLieu) {
        const cauHinh = new DocumentBuilder()
            .setTitle('Cookbook API')
            .setDescription('Tài liệu API tương tác cho ứng dụng chia sẻ công thức nấu ăn')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const taiLieu = SwaggerModule.createDocument(ungDung, cauHinh);
        // Ghép global prefix để UI nằm ở /api/v1/docs thay vì /docs
        SwaggerModule.setup('docs', ungDung, taiLieu, { useGlobalPrefix: true });
    }

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
    if (choPhepTaiLieu) {
        console.log(`Tai lieu API: http://localhost:${cong}/api/v1/docs`);
    }
}

khoiDong();
