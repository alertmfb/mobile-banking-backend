import { Injectable } from '@nestjs/common';
import { PrismaService } from './modules/prisma/prisma.service';
// import { PrismaClient } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}
  getHello(): string {
    return 'Hello World!';
  }

  async clearBd(): Promise<boolean> {
    try {
      // Truncate all specified tables
      await Promise.all([
        this.prismaService.kyc.deleteMany(),
        this.prismaService.kycUserDetails.deleteMany(),
        this.prismaService.account.deleteMany(),
        this.prismaService.residentialAddress.deleteMany(),
        this.prismaService.nextOfKin.deleteMany(),
        this.prismaService.notificationPreference.deleteMany(),
        this.prismaService.beneficiary.deleteMany(),
        this.prismaService.cardRequest.deleteMany(),
        this.prismaService.transaction.deleteMany(),
        this.prismaService.transactionLimit.deleteMany(),
        this.prismaService.securityQuestion.deleteMany(),
        this.prismaService.billPayments.deleteMany(),
        this.prismaService.device.deleteMany(),
        this.prismaService.promoApply.deleteMany(),
        this.prismaService.user.deleteMany(),
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing database:', error);
      throw new Error('Failed to clear the database');
    }
  }
}
