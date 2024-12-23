import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from './user.repository';
import { UserController } from './user.controller';

@Module({
  imports: [],
  providers: [UserService, PrismaService, UserRepository],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
