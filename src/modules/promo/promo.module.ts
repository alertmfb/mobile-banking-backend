import { Module } from '@nestjs/common';
import { PromoService } from './promo.service';
import { PromoController } from './promo.controller';
import { PromoRepository } from './promo.repository';
import { UserModule } from '../user/user.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [UserModule, HttpModule, ConfigModule],
  controllers: [PromoController],
  providers: [PromoService, PromoRepository, PrismaService],
  exports: [PromoService],
})
export class PromoModule {}
