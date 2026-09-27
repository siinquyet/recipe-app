import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuthModule, AuditModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}