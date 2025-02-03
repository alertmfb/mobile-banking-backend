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

  async createKycUserDetails(data: Prisma.KycUserDetailsCreateInput) {
    return this.prismaService.kycUserDetails.create({ data });
  }

  async getKycUserDetails(userId: string) {
    return this.prismaService.kycUserDetails.findFirst({
      where: { userId },
    });
  }

  async updateKycUserDetailsByUserId(
    userId: string,
    data: Prisma.KycUserDetailsUpdateInput,
  ) {
    return this.prismaService.kycUserDetails.update({
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

  async createNextOfKin(payload: Prisma.NextOfKinCreateInput) {
    return this.prismaService.nextOfKin.create({ data: payload });
  }

  async getNextOfKinByUserId(userId: string) {
    return this.prismaService.nextOfKin.findFirst({ where: { userId } });
  }

  async updateNextOfKinByUserId(
    userId: string,
    data: Prisma.NextOfKinUpdateInput,
  ) {
    return this.prismaService.nextOfKin.update({ where: { id: userId }, data });
  }

  async getByUserId(userId: string) {
    return this.prismaService.kyc.findFirst({
      where: { userId },
    });
  }

  async getManyKycWhereQuery(query: Prisma.KycWhereInput, take: number = 5) {
    return this.prismaService.kyc.findMany({ where: query, take });
  }
}
