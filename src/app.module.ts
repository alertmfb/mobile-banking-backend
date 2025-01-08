import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { KycModule } from './modules/kyc/kyc.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpErrorFilter } from './utils/filters/http-exception.filter';
import { MessagingModule } from './modules/messaging/messaging.module';
import { StorageModule } from './modules/storage/storage.module';
import { AccountModule } from './modules/account/account.module';
import { EventsModule } from './modules/events/events.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserModule } from './modules/user/user.module';
import { SecurityModule } from './modules/security/security.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TransactionModule } from './modules/transaction/transaction.module';
import { BeneficiaryModule } from './modules/beneficiary/beneficiary.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    UserModule,
    PrismaModule,
    KycModule,
    MessagingModule,
    StorageModule,
    AccountModule,
    EventsModule,
    SecurityModule,
    TransactionModule,
    BeneficiaryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpErrorFilter,
    },
  ],
})
export class AppModule {}
