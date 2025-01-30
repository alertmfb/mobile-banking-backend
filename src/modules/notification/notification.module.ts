import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationRepository } from './notification.repository';
import { UserModule } from '../user/user.module';
import { EmailProvider } from './emails/email.provider';
import { AuthEmailNotification } from './emails/modules/auth-email-notification';
import { SendGrid } from './emails/services/sendgrid';
import { ConfigModule } from '@nestjs/config';
import { Zepto } from './emails/services/zepto';

@Module({
  imports: [UserModule, ConfigModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationRepository,
    PrismaService,
    EmailProvider,
    AuthEmailNotification,
    SendGrid,
    Zepto,
  ],
  exports: [NotificationService, AuthEmailNotification],
})
export class NotificationModule {}
