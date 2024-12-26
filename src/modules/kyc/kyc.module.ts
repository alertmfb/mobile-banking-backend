import { Module, DynamicModule } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller'; // Import KycController
import { NestjsFormDataModule, MemoryStoredFile } from 'nestjs-form-data';
import { KycRepository } from './kyc.repository';
import { KycServiceProvider } from './providers';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from '../user/user.repository';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    NestjsFormDataModule.config({ storage: MemoryStoredFile }),
    MessagingModule,
  ],
  controllers: [KycController],
  providers: [
    KycService,
    KycRepository,
    KycServiceProvider,
    UserService,
    UserRepository,
    PrismaService,
  ],
  exports: [KycService],
})
export class KycModule {
  static register(): DynamicModule {
    return {
      module: KycModule,
    };
  }
}
