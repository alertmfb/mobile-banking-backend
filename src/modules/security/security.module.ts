import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { SecurityController } from './security.controller';
import { SecurityRepository } from './security.repository';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';

@Module({
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
