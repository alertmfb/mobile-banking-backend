import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export class CardRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createCardRquest(data: Prisma.CardRequestCreateInput) {
    return this.prismaService.cardRequest.create({ data });
  }

  async getOneByAccountId(accountId: string) {
    return this.prismaService.cardRequest.findFirst({
      where: { accountId },
    });
  }

  async getOneByCardByUserId(userId: string) {
    return this.prismaService.cardRequest.findFirst({
      where: { userId },
    });
  }

  async getManyByUserId(userId: string) {
    return this.prismaService.cardRequest.findMany({
      where: { userId },
      include: { account: true },
    });
  }

  async getManyByAccountId(accountId: string) {
    return this.prismaService.cardRequest.findMany({
      where: { accountId },
      include: { account: true },
    });
  }

  async getOne(id: string) {
    return this.prismaService.cardRequest.findUnique({
      where: { id },
      include: { account: true },
    });
  }

  async updateCardRequest(id: string, data: Prisma.CardRequestUpdateInput) {
    return this.prismaService.cardRequest.update({
      where: { id },
      data,
    });
  }
}
