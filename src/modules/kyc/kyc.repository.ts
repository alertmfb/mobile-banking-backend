import { Kyc, Prisma, ResidentialAddress } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
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

  async createResidentialAddress(
    data: Prisma.ResidentialAddressCreateInput,
  ): Promise<ResidentialAddress> {
    return this.prismaService.residentialAddress.create({ data });
  }

  async updateResidentialAddressByUserId(
    userId: string,
    data: Prisma.ResidentialAddressUpdateInput,
  ) {
    return this.prismaService.residentialAddress.update({
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
