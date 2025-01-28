import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from '../user/user.module';
import { AccountModule } from '../account/account.module';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionRepository } from './transaction.repository';

@Module({
  imports: [ConfigModule, HttpModule, UserModule, AccountModule],
  controllers: [TransactionController],
  providers: [TransactionService, TransactionRepository, PrismaService],
  exports: [TransactionService],
})
export class TransactionModule {}
