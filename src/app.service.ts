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
        this.prismaService.residentialAddress.deleteMany(),
        this.prismaService.kyc.deleteMany(),
        this.prismaService.account.deleteMany(),
        this.prismaService.securityQuestion.deleteMany(),
        this.prismaService.user.deleteMany(),
      ]);
      //
      // const prisma = PrismaClient();
      // await prisma.$executeRaw`TRUNCATE TABLE residential_addresses, kycs, accounts, users RESTART IDENTITY CASCADE;`;

      // Return true if all operations are successful
      return true;
    } catch (error) {
      console.error('Error clearing database:', error);
      throw new Error('Failed to clear the database');
    }
  }
}
