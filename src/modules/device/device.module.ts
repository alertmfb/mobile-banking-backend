import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { DeviceRepository } from './device.repository';
import { UserModule } from '../user/user.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [UserModule],
  controllers: [DeviceController],
  providers: [DeviceService, DeviceRepository, PrismaService],
  exports: [DeviceService],
})
export class DeviceModule {}
