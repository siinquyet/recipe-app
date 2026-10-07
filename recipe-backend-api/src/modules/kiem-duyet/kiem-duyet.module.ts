import { Module } from '@nestjs/common';
import { KiemDuyetService } from './kiem-duyet.service';

@Module({
    providers: [KiemDuyetService],
    exports: [KiemDuyetService],
})
export class KiemDuyetModule {}
