import { Module } from '@nestjs/common';
import { BeneficiaryService } from './beneficiary.service';
import { BeneficiaryController } from './beneficiary.controller';
import { BeneficiaryRepository } from './beneficiary.repository';
import { UserModule } from '../user/user.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [UserModule],
  controllers: [BeneficiaryController],
  providers: [BeneficiaryService, BeneficiaryRepository, PrismaService],
  exports: [BeneficiaryService],
})
export class BeneficiaryModule {}
