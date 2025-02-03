import { Module } from '@nestjs/common';
import { MetricService } from './metric.service';
import { MetricController } from './metric.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MetricController],
  providers: [MetricService, PrismaService],
  exports: [MetricService],
})
export class MetricModule {}
