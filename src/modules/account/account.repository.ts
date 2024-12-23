import { Account, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export class AccountRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async create(data: Prisma.AccountCreateInput): Promise<Account> {
    return this.prismaService.account.create({ data });
  }
  async updateAccountByUserId(userId: string, data: Prisma.AccountUpdateInput) {
    return this.prismaService.account.update({
      where: { userId },
      data,
    });
  }
  async getAccountByUserId(userId: string) {
    return this.prismaService.account.findFirst({
      where: { userId },
    });
  }
}
