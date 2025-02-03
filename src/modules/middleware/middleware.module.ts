import { Module } from '@nestjs/common';
import { MiddlewareService } from './middleware.service';
import { UserMiddlewareController } from './controllers/user-middleware.controller';
import { UserModule } from '../user/user.module';
import { KycMiddlewareController } from './controllers/kyc-middleware.controller';
import { TransactionMiddlewareController } from './controllers/transaction-middleware.controller';
import { TransactionModule } from '../transaction/transaction.module';
import { DashboardMiddlewareController } from './controllers/dashboard-middleware.controller';
import { MetricModule } from '../metric/metric.module';
import { KycModule } from '../kyc/kyc.module';

@Module({
  imports: [UserModule, KycModule, TransactionModule, MetricModule],
  controllers: [
    KycMiddlewareController,
    UserMiddlewareController,
    TransactionMiddlewareController,
    DashboardMiddlewareController,
  ],
  providers: [MiddlewareService],
})
export class MiddlewareModule {}
