import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MessagingServiceProvider } from './messaging-service.provider';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [MessagingServiceProvider],
  exports: [MessagingServiceProvider],
})
export class MessagingModule {}
