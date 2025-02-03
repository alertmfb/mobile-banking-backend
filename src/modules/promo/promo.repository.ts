import { Prisma, PromoApply } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PromoRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createPromoApply(
    data: Prisma.PromoApplyCreateInput,
  ): Promise<PromoApply> {
    return this.prismaService.promoApply.create({ data });
  }

  async getOneByCode(code: string): Promise<PromoApply> {
    return this.prismaService.promoApply.findFirst({
      where: { code },
    });
  }
}
