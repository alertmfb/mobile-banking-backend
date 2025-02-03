import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MessagingModule } from '../messaging/messaging.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AccountModule } from '../account/account.module';
import { AccountRepository } from '../account/account.repository';
import { KycService } from '../kyc/kyc.service';
import { HttpModule } from '@nestjs/axios';
import { KycServiceProvider } from '../kyc/providers';
import { KycRepository } from '../kyc/kyc.repository';
import { PrismaService } from '../prisma/prisma.service';
import { UserModule } from '../user/user.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    HttpModule,
    UserModule,
    AccountModule,
    MessagingModule,
    StorageModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    AuthService,
    JwtStrategy,
    AccountRepository,
    KycService,
    KycServiceProvider,
    KycRepository,
  ],
  exports: [AuthService],
})
export class AuthModule {}
