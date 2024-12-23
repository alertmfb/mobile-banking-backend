import { Kyc, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export class KycRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async createKyc(data: Prisma.KycCreateInput): Promise<Kyc> {
    return this.prismaService.kyc.create({ data });
  }

  async updateKycByUserId(userId: string, data: Prisma.KycUpdateInput) {
    return this.prismaService.kyc.update({
      where: { userId },
      data,
    });
  }

  async getResidentialAddress(userId: string) {
    return this.prismaService.residentialAddress.findFirst({
      where: { userId },
    });
  }

  async getByUserId(userId: string) {
    return this.prismaService.kyc.findFirst({
      where: { userId },
    });
  }
}
