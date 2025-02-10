import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, TransactionType } from '@prisma/client';
import { GetAllTransactionQueryDto } from './dtos/get-all-transaction-query.dto';

@Injectable()
export class TransactionRepository {
  constructor(private prismaService: PrismaService) {}

  createTransaction(data: Prisma.TransactionCreateInput) {
    return this.prismaService.transaction.create({ data });
  }

  updateTransaction(id: string, data: Prisma.TransactionUpdateInput) {
    return this.prismaService.transaction.update({
      where: {
        id,
      },
      data,
    });
  }

  async findAllTransactions(query: GetAllTransactionQueryDto, userId?: string) {
    const {
      page,
      perPage,
      type,
      keyword,
      sort,
      order,
      from,
      to,
      reference,
      network,
      status,
    } = query;
    const limit = +perPage || 10;
    const offset = ((+page || 1) - 1) * limit;
    const _order = order == 'ASC' ? 'asc' : 'desc';
    const _sort = sort ? sort : 'createdAt';

    return this.prismaService.transaction.findMany({
      where: {
        ...(userId && { userId }),
        ...(type && { transactionType: type }),
        ...(reference && { reference }),
        ...(status && { status }),
        ...(from &&
          to && { createdAt: { gte: new Date(from), lte: new Date(to) } }),
        ...(keyword && {
          OR: [
            { reference: { contains: keyword, mode: 'insensitive' } },
            { narration: { contains: keyword, mode: 'insensitive' } },
            {
              beneficiary: {
                ...(network && { networkProvider: network }),
                OR: [
                  { bankName: { contains: keyword, mode: 'insensitive' } },
                  { accountName: { contains: keyword, mode: 'insensitive' } },
                  { accountNumber: { contains: keyword, mode: 'insensitive' } },
                  { accountNumber: { contains: keyword, mode: 'insensitive' } },
                  { phoneNumber: { contains: keyword, mode: 'insensitive' } },
                  { tvCardNumber: { contains: keyword, mode: 'insensitive' } },
                  { tvCardName: { contains: keyword, mode: 'insensitive' } },
                ],
              },
            },
          ],
        }),
      },
      include: {
        beneficiary: true,
      },
      orderBy: {
        [_sort]: _order,
      },
      skip: offset,
      take: limit,
    });
  }

  findTransactionById(id: string) {
    return this.prismaService.transaction.findUnique({
      where: {
        id,
      },
    });
  }

  findTransactionByReference(reference: string) {
    return this.prismaService.transaction.findFirst({
      where: {
        reference,
      },
      include: { beneficiary: true },
    });
  }

  findOneTransactionForUser(id: string, userId: string) {
    return this.prismaService.transaction.findFirst({
      where: {
        id,
        userId,
      },
      include: { beneficiary: true },
    });
  }

  findTransactionByUserId(userId: string) {
    return this.prismaService.transaction.findMany({
      where: {
        userId,
      },
    });
  }

  createTransactionLimit(data: Prisma.TransactionLimitCreateInput) {
    return this.prismaService.transactionLimit.create({ data });
  }

  updateTransactionLimit(id: string, data: Prisma.TransactionLimitUpdateInput) {
    return this.prismaService.transactionLimit.update({
      where: {
        id,
      },
      data,
    });
  }

  findTransactionLimitByUserId(userId: string) {
    return this.prismaService.transactionLimit.findMany({
      where: {
        userId,
      },
    });
  }

  findLimitByUserIdAndType(userId: string, transactionType: TransactionType) {
    return this.prismaService.transactionLimit.findFirst({
      where: {
        userId,
        transactionType,
      },
    });
  }
}
