import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { KiemDuyetModule } from '../kiem-duyet/kiem-duyet.module';

@Module({
    imports: [KiemDuyetModule],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule {}
