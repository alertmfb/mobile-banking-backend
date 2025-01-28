import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { SecurityController } from './security.controller';
import { SecurityRepository } from './security.repository';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';
import { UserModule } from '../user/user.module';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [UserModule, MessagingModule],
  controllers: [SecurityController],
  providers: [
    SecurityService,
    SecurityRepository,
    PrismaService,
    UserService,
    UserRepository,
  ],
})
export class SecurityModule {}
