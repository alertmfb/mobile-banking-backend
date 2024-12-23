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

@Module({
  imports: [HttpModule, ConfigModule],
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
  ],
})
export class AccountModule {}
