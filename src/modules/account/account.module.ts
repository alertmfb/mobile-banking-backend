import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from '../user/user.repository';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AccountRepository } from './account.repository';
import { KycService } from '../kyc/kyc.service';
import { KycServiceProvider } from '../kyc/providers';
import { KycRepository } from '../kyc/kyc.repository';
import { MessagingModule } from '../messaging/messaging.module';
import { AccountCreateListener } from './listeners/account-create.listener';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [HttpModule, ConfigModule, MessagingModule, StorageModule],
  controllers: [AccountController],
  providers: [
    AccountService,
    AccountRepository,
    UserService,
    PrismaService,
    KycService,
    KycServiceProvider,
    KycRepository,
    UserRepository,
    AccountCreateListener,
  ],
  exports: [AccountService],
})
export class AccountModule {}
