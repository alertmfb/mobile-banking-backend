import { Module } from '@nestjs/common';
import { BillPaymentService } from './bill-payment.service';
import { BillPaymentController } from './bill-payment.controller';
import { BillServiceProvider } from './providers';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { TransactionModule } from '../transaction/transaction.module';
import { BillPaymentRepository } from './bill-payment.repository';

@Module({
  imports: [HttpModule, ConfigModule, UserModule, TransactionModule],
  controllers: [BillPaymentController],
  providers: [BillPaymentService, BillServiceProvider, BillPaymentRepository],
  exports: [BillPaymentService, BillServiceProvider],
})
export class BillPaymentModule {}
