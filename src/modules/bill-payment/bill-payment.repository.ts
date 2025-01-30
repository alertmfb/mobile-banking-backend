import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export class BillPaymentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: Prisma.BillPaymentsCreateInput) {
    return this.prismaService.billPayments.create({
      data,
    });
  }

  async update(id: string, data: Prisma.BillPaymentsUpdateInput) {
    return this.prismaService.billPayments.update({
      where: {
        id,
      },
      data,
    });
  }

  async findByTransactionId(transactionId: string) {
    return this.prismaService.billPayments.findFirst({
      where: {
        transactionId,
      },
    });
  }
}
