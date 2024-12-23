import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageServiceProvider } from './storage-service.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [StorageController],
  providers: [StorageServiceProvider],
  exports: [StorageServiceProvider],
})
export class StorageModule {}
