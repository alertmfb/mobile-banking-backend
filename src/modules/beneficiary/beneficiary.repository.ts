import { Beneficiary, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetAllBeneficiaryQueryDto } from './dto/get-all-beneficiary-query.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BeneficiaryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: Prisma.BeneficiaryCreateInput): Promise<Beneficiary> {
    return this.prismaService.beneficiary.create({ data });
  }

  async update(
    userId: string,
    id: string,
    data: Prisma.BeneficiaryUpdateInput,
  ): Promise<Beneficiary> {
    return this.prismaService.beneficiary.update({
      where: {
        userId,
        id,
      },
      data,
    });
  }

  async getOneForUser(userId: string, id: string): Promise<Beneficiary> {
    return this.prismaService.beneficiary.findFirst({
      where: {
        userId,
        id,
      },
    });
  }

  async getOneForUserWhere(
    userId: string,
    where: Prisma.BeneficiaryWhereInput,
  ): Promise<Beneficiary> {
    console.log('prismaService', this.prismaService);
    return this.prismaService.beneficiary.findFirst({
      where: {
        userId,
        ...where,
      },
    });
  }

  async getAll(userId: string, query: GetAllBeneficiaryQueryDto) {
    const { page, perPage, keyword, beneficiaryType, network, sort, order } =
      query;

    const limit = +perPage || 10;
    const offset = ((+page || 1) - 1) * limit;

    return this.prismaService.beneficiary.findMany({
      where: {
        userId: userId,
        isBeneficiary: true,
        ...(keyword && {
          OR: [
            { accountName: { contains: keyword, mode: 'insensitive' } },
            { bankName: { contains: keyword, mode: 'insensitive' } },
            { bankCode: { contains: keyword, mode: 'insensitive' } },
            { accountNumber: { contains: keyword, mode: 'insensitive' } },
            { phoneNumber: { contains: keyword, mode: 'insensitive' } },
            { tvCardNumber: { contains: keyword, mode: 'insensitive' } },
            { tvCardName: { contains: keyword, mode: 'insensitive' } },
          ],
        }),
        ...(beneficiaryType && { beneficiaryType }),
        ...(network && { networkProvider: network }),
      },
      take: limit,
      skip: offset,
      orderBy: {
        [sort || 'createdAt']: order
          ? order === 'ASC'
            ? 'asc'
            : 'desc'
          : 'desc',
      },
    });
  }

  async delete(userId: string, id: string): Promise<Beneficiary> {
    return this.prismaService.beneficiary.delete({
      where: {
        userId,
        id,
      },
    });
  }
}
